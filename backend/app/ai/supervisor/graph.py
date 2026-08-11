"""
SupplySense — LangGraph Supervisor Graph Construction
Builds, connects, and compiles the multi-agent StateGraph orchestrator.
"""

import logging
import time
from typing import List, Dict, Any, Union

from langgraph.graph import StateGraph, START, END
from langsmith import traceable

from backend.app.ai.supervisor.state import SupervisorState
from backend.app.ai.supervisor.schemas import SupervisorResponse, ExecutionMode
from backend.app.ai.supervisor.router import router_node
from backend.app.ai.supervisor.nodes import (
    inventory_node,
    shipment_node,
    supplier_node,
    forecast_node,
    rag_node,
    risk_node,
    executive_node,
    direct_tool_node,
    hybrid_node,
    clarification_node,
)
from backend.app.ai.supervisor.merger import merger_node, merge_agent_outputs

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Routing Functions for Graph Edges
# ---------------------------------------------------------------------------

def route_from_router(state: SupervisorState) -> Union[List[str], str]:
    """
    Evaluates router decision in state and returns target node name(s).
    Supports parallel execution for agentic queries and direct fast paths.
    """
    query_type = state.get("query_type", ExecutionMode.AGENT.value)
    selected = state.get("selected_agents", [])
    logger.info(f"route_from_router evaluating query_type='{query_type}' selected_agents={selected}")

    # Fast Path 1: Direct Tool Node
    if query_type == ExecutionMode.DIRECT_TOOL.value:
        return "direct_tool"

    # Fast Path 2: Unsupported Hybrid Node
    if query_type == ExecutionMode.UNSUPPORTED_HYBRID.value:
        return "hybrid"

    # Fast Path 3: Clarification Node (Unknown/Ambiguous query)
    if query_type == ExecutionMode.UNKNOWN.value:
        return "clarification"

    # Fast Path 4: RAG Knowledge Query
    if query_type == ExecutionMode.RAG.value or "rag" in selected:
        return "rag"

    # Path 5: Specialized AI Agent Query
    targets = []

    # Check for layer 1 (Operational) agents
    for agent_name in ["inventory", "shipment", "supplier", "forecast"]:
        if agent_name in selected:
            targets.append(agent_name)

    if targets:
        return targets

    # If no operational agents were selected, check Layer 2 (Risk) or Layer 3 (Executive)
    if "risk" in selected:
        return "risk"
    if "executive" in selected:
        return "executive"

    # Default fallback to direct tool search if unclassified
    return "direct_tool"


def route_from_operational(state: SupervisorState) -> str:
    """
    Evaluates next step after operational / knowledge nodes finish.
    Routes to 'risk' if selected, else 'executive' if selected, else 'merger'.
    """
    selected = state.get("selected_agents", [])
    outputs = state.get("agent_outputs", {})

    if "risk" in selected and "risk" not in outputs:
        return "risk"
    if "executive" in selected and "executive" not in outputs:
        return "executive"

    return "merger"


def route_from_risk(state: SupervisorState) -> str:
    """
    Evaluates next step after risk_node finishes.
    Routes to 'executive' if selected and not yet run, else 'merger'.
    """
    selected = state.get("selected_agents", [])
    outputs = state.get("agent_outputs", {})

    if "executive" in selected and "executive" not in outputs:
        return "executive"

    return "merger"


# ---------------------------------------------------------------------------
# Graph Assembly
# ---------------------------------------------------------------------------

def build_supervisor_graph() -> StateGraph:
    """
    Constructs and returns the uncompiled LangGraph StateGraph instance.
    """
    workflow = StateGraph(SupervisorState)

    # 1. Add all nodes
    workflow.add_node("router", router_node)
    workflow.add_node("direct_tool", direct_tool_node)
    workflow.add_node("inventory", inventory_node)
    workflow.add_node("shipment", shipment_node)
    workflow.add_node("supplier", supplier_node)
    workflow.add_node("forecast", forecast_node)
    workflow.add_node("rag", rag_node)
    workflow.add_node("risk", risk_node)
    workflow.add_node("executive", executive_node)
    workflow.add_node("hybrid", hybrid_node)
    workflow.add_node("clarification", clarification_node)
    workflow.add_node("merger", merger_node)

    # 2. Add entry point
    workflow.add_edge(START, "router")

    # 3. Add conditional edges from router to target execution nodes
    workflow.add_conditional_edges(
        "router",
        route_from_router,
        {
            "direct_tool": "direct_tool",
            "hybrid": "hybrid",
            "clarification": "clarification",
            "inventory": "inventory",
            "shipment": "shipment",
            "supplier": "supplier",
            "forecast": "forecast",
            "rag": "rag",
            "risk": "risk",
            "executive": "executive",
        },
    )

    # 4. Connect fast-path direct nodes directly to merger
    workflow.add_edge("direct_tool", "merger")
    workflow.add_edge("hybrid", "merger")
    workflow.add_edge("clarification", "merger")

    # 5. Add conditional edges from operational/knowledge nodes to downstream nodes
    for op_node in ["inventory", "shipment", "supplier", "forecast", "rag"]:
        workflow.add_conditional_edges(
            op_node,
            route_from_operational,
            {
                "risk": "risk",
                "executive": "executive",
                "merger": "merger",
            },
        )

    # 6. Add conditional edge from risk node to executive or merger
    workflow.add_conditional_edges(
        "risk",
        route_from_risk,
        {
            "executive": "executive",
            "merger": "merger",
        },
    )

    # 7. Connect executive node to merger
    workflow.add_edge("executive", "merger")

    # 8. Connect merger node to END
    workflow.add_edge("merger", END)

    return workflow


# Compile executable graph app instance
supervisor_graph_app = build_supervisor_graph().compile()


class SupplySenseSupervisor:
    """
    Production-ready Class wrapper around the LangGraph Supervisor.
    Provides async `run()` method for executing user queries through the graph.
    """

    def __init__(self):
        self.app = supervisor_graph_app

    @traceable(name="supplysense_supervisor_run")
    async def run(
        self,
        user_question: str,
        conversation_history: List[Dict[str, str]] = None,
    ) -> SupervisorResponse:
        """
        Executes a user question through the LangGraph Multi-Agent Supervisor workflow.

        Args:
            user_question: User query string.
            conversation_history: Optional history of previous dialog turns.

        Returns:
            SupervisorResponse: Final unified response object.
        """
        start_time = time.time()
        initial_state: SupervisorState = {
            "user_question": user_question,
            "conversation_history": conversation_history or [],
            "query_type": ExecutionMode.AGENT.value,
            "intent": "",
            "intent_explanation": "",
            "selected_agents": [],
            "target_tool": None,
            "tool_parameters": {},
            "agent_outputs": {},
            "merged_response": {},
            "nodes_executed": [],
            "confidence": 0.0,
            "status": "success",
            "error": None,
            "start_time": start_time,
            "llm_calls_made": 0,
        }

        try:
            final_state = await self.app.ainvoke(initial_state)
            merged_dict = final_state.get("merged_response", {})

            if isinstance(merged_dict, dict) and merged_dict:
                return SupervisorResponse(**merged_dict)

            # Fallback if dictionary conversion needed
            return await merge_agent_outputs(
                user_question=user_question,
                intent=final_state.get("intent", "Hybrid"),
                selected_agents=final_state.get("selected_agents", []),
                agent_outputs=final_state.get("agent_outputs", {}),
                nodes_executed=final_state.get("nodes_executed", []),
                start_time=start_time,
                query_type=final_state.get("query_type", "agent"),
                status=final_state.get("status", "success"),
                target_tool=final_state.get("target_tool"),
                llm_calls_made=final_state.get("llm_calls_made", 0),
            )

        except Exception as e:
            logger.error(f"SupplySenseSupervisor execution error: {e}", exc_info=True)
            duration_ms = (time.time() - start_time) * 1000
            return SupervisorResponse(
                status="error",
                query=user_question,
                query_type="unknown",
                intent="Error",
                selected_agents=[],
                summary="Supervisor graph execution failed.",
                answer=f"An error occurred while executing the workflow: {str(e)}",
                findings=[],
                recommendations=[],
                citations_and_sources=[],
                raw_agent_outputs={},
                confidence=0.0,
                execution_metadata={
                    "total_duration_ms": duration_ms,
                    "nodes_executed": ["error_handler"],
                    "agents_invoked": [],
                    "parallel_execution_used": False,
                },
            )


# Global helper function for convenience
async def run_supervisor(
    user_question: str,
    conversation_history: List[Dict[str, str]] = None,
) -> SupervisorResponse:
    """Convenience helper function to run a query through the LangGraph supervisor."""
    supervisor = SupplySenseSupervisor()
    return await supervisor.run(user_question, conversation_history)
