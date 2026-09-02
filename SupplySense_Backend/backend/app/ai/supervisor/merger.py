"""
SupplySense — LangGraph Supervisor Merger
Combines multi-agent outputs, deduplicates recommendations, preserves evidence & citations,
and computes final composite confidence for the Supervisor response.
"""

import logging
import time
from typing import Dict, Any, List

from langchain_core.messages import SystemMessage, HumanMessage
from langsmith import traceable

from backend.app.ai.llm import get_llm
from backend.app.ai.supervisor.prompt import SUPERVISOR_MERGER_PROMPT
from backend.app.ai.supervisor.schemas import (
    SupervisorResponse,
    IntentCategory,
    MergedFinding,
    MergedRecommendation,
    ExecutionMetadata,
)
from backend.app.ai.supervisor.state import SupervisorState

logger = logging.getLogger(__name__)


def _format_agent_output_compact(name: str, data: Dict[str, Any]) -> str:
    """Format agent output into a token-efficient text summary for merger synthesis."""
    if not isinstance(data, dict):
        return f"=== AGENT OUTPUT: {name.upper()} ===\n{str(data)[:500]}"
    
    summary = data.get("summary") or data.get("executive_summary") or data.get("overall_risk") or ""
    status_val = data.get("inventory_status") or data.get("shipment_status") or data.get("risk_level") or "OK"
    confidence = data.get("confidence", 0.8)
    
    lines = [
        f"=== AGENT OUTPUT: {name.upper()} (Status: {status_val}, Confidence: {confidence}) ===",
        f"Summary: {summary}",
    ]
    
    findings = data.get("critical_findings") or data.get("findings") or data.get("risks") or []
    if findings:
        lines.append("Key Findings:")
        for f in findings[:3]:
            if isinstance(f, dict):
                lines.append(f" - [{f.get('severity', 'Medium')}] {f.get('title', 'Finding')}: {f.get('description') or f.get('detail') or ''}")
            else:
                lines.append(f" - {str(f)}")
                
    actions = data.get("priority_actions") or data.get("recommendations") or []
    if actions:
        lines.append("Key Actions:")
        for a in actions[:3]:
            if isinstance(a, dict):
                lines.append(f" - [{a.get('urgency') or a.get('priority') or 'High'}] {a.get('action', 'Action')}: {a.get('rationale') or ''}")
            else:
                lines.append(f" - {str(a)}")
                
    return "\n".join(lines)


@traceable(name="supervisor_merge_agent_outputs")
async def merge_agent_outputs(
    user_question: str,
    intent: str,
    selected_agents: List[str],
    agent_outputs: Dict[str, Any],
    nodes_executed: List[str],
    start_time: float,
    query_type: str = "agent",
    status: str = "success",
    target_tool: str = None,
    llm_calls_made: int = 0,
) -> SupervisorResponse:
    """
    Merges outputs from all executed agents or tools into a single unified SupervisorResponse.

    Args:
        user_question: Original user query.
        intent: Classified intent string.
        selected_agents: Agents chosen by router.
        agent_outputs: Map of agent_name -> serialized agent response dict.
        nodes_executed: List of node names executed in graph.
        start_time: Start timestamp for duration calculation.
        query_type: Execution mode ('direct_tool', 'agent', 'rag', 'unsupported_hybrid', 'unknown').
        status: Status string ('success', 'unsupported_workflow', 'clarification_needed', 'error').
        target_tool: Name of tool used if direct_tool mode.
        llm_calls_made: Total LLM calls executed during workflow.

    Returns:
        SupervisorResponse: Validated final response object.
    """
    duration_ms = (time.time() - start_time) * 1000 if start_time else 0.0

    # 1. Handle Direct Tool Mode
    if query_type == "direct_tool" or "direct_tool" in agent_outputs:
        dt_data = agent_outputs.get("direct_tool", {})
        answer_str = dt_data.get("answer") or dt_data.get("summary") or "Direct tool query completed."
        used_tool = dt_data.get("tool_used") or target_tool
        return SupervisorResponse(
            status=dt_data.get("status", "success"),
            query=user_question,
            query_type="direct_tool",
            intent=intent,
            selected_agents=[],
            tool_used=used_tool,
            source=dt_data.get("source", "operational_database"),
            summary=answer_str,
            answer=answer_str,
            findings=[],
            recommendations=[],
            citations_and_sources=[],
            raw_agent_outputs=agent_outputs,
            confidence=dt_data.get("confidence", 0.99),
            execution_metadata=ExecutionMetadata(
                total_duration_ms=duration_ms,
                nodes_executed=nodes_executed,
                agents_invoked=[],
                parallel_execution_used=False,
                llm_calls_made=llm_calls_made,
            ),
        )

    # 2. Handle Unsupported Hybrid Mode
    if query_type == "unsupported_hybrid" or "hybrid" in agent_outputs:
        h_data = agent_outputs.get("hybrid", {})
        answer_str = h_data.get("answer") or "This query requires both operational data and company policy knowledge. Hybrid reasoning is not enabled yet."
        return SupervisorResponse(
            status="unsupported_workflow",
            query=user_question,
            query_type="unsupported_hybrid",
            intent="Hybrid",
            selected_agents=[],
            summary="Hybrid operational + policy reasoning is currently unsupported.",
            answer=answer_str,
            findings=[],
            recommendations=[],
            citations_and_sources=[],
            raw_agent_outputs=agent_outputs,
            confidence=1.0,
            execution_metadata=ExecutionMetadata(
                total_duration_ms=duration_ms,
                nodes_executed=nodes_executed,
                agents_invoked=[],
                parallel_execution_used=False,
                llm_calls_made=llm_calls_made,
            ),
        )

    # 3. Handle Clarification / Unknown Mode
    if query_type == "unknown" or "clarification" in agent_outputs:
        c_data = agent_outputs.get("clarification", {})
        answer_str = c_data.get("answer") or "I'm not sure which information you're looking for. Could you please clarify your question?"
        return SupervisorResponse(
            status="clarification_needed",
            query=user_question,
            query_type="unknown",
            intent="Unknown",
            selected_agents=[],
            summary="Clarification required.",
            answer=answer_str,
            findings=[],
            recommendations=[],
            citations_and_sources=[],
            raw_agent_outputs=agent_outputs,
            confidence=c_data.get("confidence", 0.3),
            execution_metadata=ExecutionMetadata(
                total_duration_ms=duration_ms,
                nodes_executed=nodes_executed,
                agents_invoked=[],
                parallel_execution_used=False,
                llm_calls_made=llm_calls_made,
            ),
        )

    # 4. Single Agent case (e.g. RAG, Inventory, Shipment, Supplier, Forecast, Risk, Executive)
    if len(agent_outputs) == 1:
        agent_name = list(agent_outputs.keys())[0]
        out_data = agent_outputs[agent_name]
        q_mode = "rag" if agent_name == "rag" else "agent"
        resp = _build_single_agent_supervisor_response(
            user_question, intent, selected_agents, agent_name, out_data, nodes_executed, duration_ms
        )
        resp.query_type = q_mode
        resp.agent_used = agent_name
        resp.status = status
        resp.execution_metadata.llm_calls_made = llm_calls_made
        return resp

    # 5. Multi-agent case: Use LLM synthesis
    try:
        llm = get_llm()
        structuring_chain = llm.with_structured_output(SupervisorResponse)

        context_blocks = []
        for name, data in agent_outputs.items():
            context_blocks.append(_format_agent_output_compact(name, data))
            context_blocks.append("")

        context_str = "\n".join(context_blocks)

        prompt_content = (
            f"Original Query: {user_question}\n"
            f"Classified Intent: {intent}\n"
            f"Invoked Agents: {selected_agents}\n\n"
            f"AGENT OUTPUTS TO MERGE:\n{context_str}\n\n"
            f"Synthesize the above into a unified SupervisorResponse matching the schema. Write clear, executive Markdown prose."
        )

        messages = [
            SystemMessage(content=SUPERVISOR_MERGER_PROMPT),
            HumanMessage(content=prompt_content),
        ]

        response: SupervisorResponse = await structuring_chain.ainvoke(messages)
        response.status = status
        response.query = user_question
        response.query_type = "agent"
        response.selected_agents = selected_agents
        response.raw_agent_outputs = agent_outputs
        response.execution_metadata = ExecutionMetadata(
            total_duration_ms=duration_ms,
            nodes_executed=nodes_executed,
            agents_invoked=list(agent_outputs.keys()),
            parallel_execution_used=len(agent_outputs) > 1,
            llm_calls_made=llm_calls_made + 1,
        )

        return response

    except Exception as e:
        logger.error(f"Multi-agent synthesis error: {e}. Falling back to heuristic merge.", exc_info=True)
        fallback_resp = _heuristic_fallback_merge(
            user_question, intent, selected_agents, agent_outputs, nodes_executed, duration_ms
        )
        fallback_resp.execution_metadata.llm_calls_made = llm_calls_made
        return fallback_resp


def _build_single_agent_supervisor_response(
    query: str,
    intent: str,
    selected_agents: List[str],
    agent_name: str,
    data: Dict[str, Any],
    nodes_executed: List[str],
    duration_ms: float,
) -> SupervisorResponse:
    """Builds SupervisorResponse directly from a single agent's output without extra LLM call."""
    summary = data.get("summary") or data.get("executive_summary") or f"Analysis completed by {agent_name} agent."
    answer = data.get("answer") or data.get("overall_risk") or summary
    confidence = data.get("confidence", 0.8)

    # Extract citations if RAG
    citations = data.get("sources", [])

    # Extract findings
    findings = []
    if "risks" in data and isinstance(data["risks"], list):
        for r in data["risks"]:
            findings.append(MergedFinding(category=agent_name.capitalize(), title="Risk Finding", detail=str(r), source_agent=agent_name))
    elif "critical_findings" in data and isinstance(data["critical_findings"], list):
        for f in data["critical_findings"]:
            if isinstance(f, dict):
                findings.append(MergedFinding(
                    category=f.get("category", agent_name),
                    title=f.get("title", "Critical Finding"),
                    detail=f.get("description", ""),
                    source_agent=agent_name,
                    severity=f.get("severity"),
                ))

    # Extract recommendations
    recs = []
    if "recommendations" in data and isinstance(data["recommendations"], list):
        for rec in data["recommendations"]:
            if isinstance(rec, str):
                recs.append(MergedRecommendation(action=rec, rationale=summary, priority="Medium", source_agents=[agent_name]))
            elif isinstance(rec, dict):
                recs.append(MergedRecommendation(
                    action=rec.get("action", str(rec)),
                    rationale=rec.get("rationale", summary),
                    priority=rec.get("priority", "Medium"),
                    source_agents=[agent_name],
                ))

    intent_cat = _parse_intent_enum(intent)

    return SupervisorResponse(
        status="success",
        query=query,
        query_type="rag" if agent_name == "rag" else "agent",
        intent=intent_cat,
        selected_agents=selected_agents,
        agent_used=agent_name,
        source="qdrant_vectorstore" if agent_name == "rag" else f"{agent_name}_agent",
        summary=summary,
        answer=answer,
        findings=findings,
        recommendations=recs,
        citations_and_sources=citations,
        raw_agent_outputs={agent_name: data},
        confidence=confidence,
        execution_metadata=ExecutionMetadata(
            total_duration_ms=duration_ms,
            nodes_executed=nodes_executed,
            agents_invoked=[agent_name],
            parallel_execution_used=False,
        ),
    )


def _heuristic_fallback_merge(
    query: str,
    intent: str,
    selected_agents: List[str],
    agent_outputs: Dict[str, Any],
    nodes_executed: List[str],
    duration_ms: float,
) -> SupervisorResponse:
    """Heuristic fallback merger if LLM synthesis fails or hits token limits."""
    summaries = []
    citations = []
    findings = []
    recommendations = []
    confidences = []
    primary_answer = ""
    primary_summary = ""

    # Priority order for primary answer: risk > executive > inventory > shipment > supplier > forecast
    priority_order = ["risk", "executive", "inventory", "shipment", "supplier", "forecast", "rag"]
    for agent in priority_order:
        if agent in agent_outputs and isinstance(agent_outputs[agent], dict):
            data = agent_outputs[agent]
            if not primary_answer:
                primary_answer = data.get("overall_risk") or data.get("executive_summary") or data.get("answer") or data.get("summary", "")
            if not primary_summary:
                primary_summary = data.get("summary") or data.get("executive_summary") or primary_answer

    for name, data in agent_outputs.items():
        if not isinstance(data, dict):
            continue

        if "summary" in data and data["summary"]:
            summaries.append(f"[{name.upper()}]: {data['summary']}")
        if "sources" in data and isinstance(data["sources"], list):
            citations.extend(data["sources"])
        if "confidence" in data and isinstance(data["confidence"], (int, float)):
            confidences.append(float(data["confidence"]))

        # Extract critical findings
        crit = data.get("critical_findings") or data.get("findings") or data.get("risks") or []
        for item in crit:
            if isinstance(item, dict):
                findings.append(MergedFinding(
                    category=item.get("category", name.capitalize()),
                    title=item.get("title", f"{name.capitalize()} Finding"),
                    detail=item.get("description") or item.get("detail") or str(item),
                    severity=item.get("severity", "Medium"),
                    source_agent=name,
                ))
            elif isinstance(item, str):
                findings.append(MergedFinding(
                    category=name.capitalize(),
                    title=f"{name.capitalize()} Risk",
                    detail=item,
                    severity="Medium",
                    source_agent=name,
                ))

        # Extract priority actions & recommendations
        actions = data.get("priority_actions") or data.get("recommendations") or []
        for act in actions:
            if isinstance(act, dict):
                recommendations.append(MergedRecommendation(
                    action=act.get("action", "Recommended Action"),
                    rationale=act.get("rationale") or act.get("target") or "",
                    priority=act.get("urgency") or act.get("priority") or "High",
                    source_agents=[name],
                ))
            elif isinstance(act, str):
                recommendations.append(MergedRecommendation(
                    action=act,
                    rationale=primary_summary,
                    priority="Medium",
                    source_agents=[name],
                ))

    final_summary = primary_summary if primary_summary else (" ".join(summaries) if summaries else "Multi-agent operational analysis completed.")
    final_answer = primary_answer if primary_answer else final_summary
    avg_conf = max(confidences) if confidences else 0.8

    return SupervisorResponse(
        status="success",
        query=query,
        query_type="agent",
        intent=_parse_intent_enum(intent),
        selected_agents=selected_agents,
        summary=final_summary,
        answer=final_answer,
        findings=findings,
        recommendations=recommendations,
        citations_and_sources=list(set(citations)),
        raw_agent_outputs=agent_outputs,
        confidence=round(avg_conf, 2),
        execution_metadata=ExecutionMetadata(
            total_duration_ms=duration_ms,
            nodes_executed=nodes_executed,
            agents_invoked=list(agent_outputs.keys()),
            parallel_execution_used=len(agent_outputs) > 1,
        ),
    )


def _parse_intent_enum(intent_str: str) -> IntentCategory:
    """Helper to convert string intent to IntentCategory enum safely."""
    for cat in IntentCategory:
        if cat.value.lower() == str(intent_str).lower():
            return cat
    return IntentCategory.HYBRID


def _serialize_response(resp: Any) -> Dict[str, Any]:
    """Helper to convert Pydantic models or dicts to plain dicts."""
    if resp is None:
        return {}
    if hasattr(resp, "model_dump"):
        return resp.model_dump()
    if hasattr(resp, "dict"):
        return resp.dict()
    if isinstance(resp, dict):
        return resp
    return {"raw": str(resp)}


async def merger_node(state: SupervisorState) -> dict:
    """
    LangGraph node function for output merging.
    """
    query = state.get("user_question", "")
    intent = state.get("intent", "Hybrid")
    selected_agents = state.get("selected_agents", [])
    agent_outputs = state.get("agent_outputs", {})
    nodes_executed = state.get("nodes_executed", [])
    start_time = state.get("start_time", time.time())
    query_type = state.get("query_type", "agent")
    status = state.get("status", "success")
    target_tool = state.get("target_tool")
    llm_calls = state.get("llm_calls_made", 0)

    merged_res = await merge_agent_outputs(
        user_question=query,
        intent=intent,
        selected_agents=selected_agents,
        agent_outputs=agent_outputs,
        nodes_executed=nodes_executed + ["merger_node"],
        start_time=start_time,
        query_type=query_type,
        status=status,
        target_tool=target_tool,
        llm_calls_made=llm_calls,
    )

    return {
        "merged_response": _serialize_response(merged_res),
        "confidence": merged_res.confidence,
        "nodes_executed": ["merger_node"],
    }
