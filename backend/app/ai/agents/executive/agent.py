"""
SupplySense - Executive Summary Agent
Converts technical AI analysis from all upstream agents into
business-friendly executive reports readable in under two minutes.

This agent does NOT query databases, call tools, or compute metrics.
It ONLY summarizes validated analyses from 5 upstream agents.
"""

import logging
import time
from typing import Optional

from langchain_core.messages import SystemMessage, HumanMessage
from langsmith import traceable

from backend.app.ai.llm import get_llm
from backend.app.ai.agents.executive.prompt import EXECUTIVE_AGENT_SYSTEM_PROMPT
from backend.app.ai.agents.executive.schemas import (
    ExecutiveSummaryResponse,
    ManagementRecommendation,
)
from backend.app.ai.agents.executive.state import ExecutiveAgentState
from backend.app.ai.agents.executive.chains import get_structuring_chain

# Upstream agent response types
from backend.app.ai.agents.inventory.schemas import InventoryAnalysisResponse
from backend.app.ai.agents.shipment.schemas import ShipmentAnalysisResponse
from backend.app.ai.agents.supplier.schemas import SupplierAnalysisResponse
from backend.app.ai.agents.forecast.schemas import ForecastAnalysisResponse
from backend.app.ai.agents.risk.schemas import RiskAnalysisResponse

logger = logging.getLogger(__name__)


def _safe_dump(output) -> dict:
    """Safely serialize a Pydantic model or dict."""
    if output is None:
        return {}
    if hasattr(output, "model_dump"):
        return output.model_dump()
    if hasattr(output, "dict"):
        return output.dict()
    if isinstance(output, dict):
        return output
    return {}


def _format_inventory(output: Optional[InventoryAnalysisResponse]) -> str:
    """Format inventory findings for executive consumption."""
    if output is None:
        return "## INVENTORY\nStatus: Not assessed today.\n"
    d = _safe_dump(output)
    lines = [
        "## INVENTORY",
        f"Status: {d.get('inventory_status', 'Unknown')}",
        f"Confidence: {d.get('confidence', 0.0)}",
        f"Summary: {d.get('summary', 'No data.')}",
    ]
    for r in d.get("risks", []):
        lines.append(f"  Risk: {r}")
    for rec in d.get("recommendations", []):
        lines.append(f"  Action: {rec}")
    return "\n".join(lines)


def _format_shipment(output: Optional[ShipmentAnalysisResponse]) -> str:
    """Format shipment findings for executive consumption."""
    if output is None:
        return "## SHIPMENTS & LOGISTICS\nStatus: Not assessed today.\n"
    d = _safe_dump(output)
    lines = [
        "## SHIPMENTS & LOGISTICS",
        f"Status: {d.get('shipment_status', 'Unknown')}",
        f"Confidence: {d.get('confidence', 0.0)}",
        f"Summary: {d.get('summary', 'No data.')}",
    ]
    for s in d.get("critical_shipments", []):
        lines.append(f"  Critical: {s}")
    for s in d.get("delayed_shipments", []):
        lines.append(f"  Delayed: {s}")
    for r in d.get("supplier_risk", []):
        lines.append(f"  Supplier Issue: {r}")
    for r in d.get("warehouse_risk", []):
        lines.append(f"  Warehouse Issue: {r}")
    for rec in d.get("recommendations", []):
        lines.append(f"  Action: {rec}")
    return "\n".join(lines)


def _format_supplier(output: Optional[SupplierAnalysisResponse]) -> str:
    """Format supplier findings for executive consumption."""
    if output is None:
        return "## SUPPLIERS & PROCUREMENT\nStatus: Not assessed today.\n"
    d = _safe_dump(output)
    lines = [
        "## SUPPLIERS & PROCUREMENT",
        f"Confidence: {d.get('confidence', 0.0)}",
        f"Summary: {d.get('summary', 'No data.')}",
    ]
    best = d.get("best_suppliers", [])
    if best:
        lines.append(f"Top Performers: {', '.join(best)}")
    risky = d.get("risky_suppliers", [])
    if risky:
        lines.append(f"Needs Attention: {', '.join(risky)}")
    for h in d.get("supplier_health", []):
        name = h.get("company_name", "Unknown")
        verdict = h.get("health_verdict", "?")
        lines.append(f"  {name}: {verdict}")
    for ra in d.get("risk_assessments", []):
        lines.append(
            f"  [{ra.get('severity', '?')}] {ra.get('supplier_name', '?')}: "
            f"{ra.get('description', '')}"
        )
    for rec in d.get("recommendations", []):
        if isinstance(rec, dict):
            lines.append(f"  [{rec.get('priority', '?')}] {rec.get('action', '?')}")
        else:
            lines.append(f"  Action: {rec}")
    return "\n".join(lines)


def _format_forecast(output: Optional[ForecastAnalysisResponse]) -> str:
    """Format forecast findings for executive consumption."""
    if output is None:
        return "## DEMAND FORECAST\nStatus: Not assessed today.\n"
    d = _safe_dump(output)
    lines = [
        "## DEMAND FORECAST",
        f"Outlook: {d.get('predicted_demand', 'Unknown')}",
        f"Confidence: {d.get('confidence', 0.0)}",
        f"Summary: {d.get('summary', 'No data.')}",
    ]
    high = d.get("high_demand_products", [])
    if high:
        lines.append(f"Trending Products: {', '.join(high)}")
    low = d.get("low_demand_products", [])
    if low:
        lines.append(f"Slow Movers: {', '.join(low)}")
    for f in d.get("forecast", []):
        name = f.get("product_name", "Unknown")
        pred = f.get("predicted_demand", "?")
        units = f.get("estimated_units")
        detail = f"  {name}: {pred}"
        if units:
            detail += f" (~{units} units)"
        lines.append(detail)
    for rec in d.get("recommendations", []):
        if isinstance(rec, dict):
            lines.append(f"  [{rec.get('priority', '?')}] {rec.get('action', '?')}")
        else:
            lines.append(f"  Action: {rec}")
    return "\n".join(lines)


def _format_risk(output: Optional[RiskAnalysisResponse]) -> str:
    """Format risk analysis findings for executive consumption."""
    if output is None:
        return "## RISK ASSESSMENT\nStatus: Not assessed today.\n"
    d = _safe_dump(output)
    lines = [
        "## RISK ASSESSMENT",
        f"Risk Level: {d.get('risk_level', 'Unknown')}",
        f"Confidence: {d.get('confidence', 0.0)}",
        f"Summary: {d.get('summary', 'No data.')}",
        f"Overall: {d.get('overall_risk', '')}",
    ]
    products = d.get("affected_products", [])
    if products:
        lines.append(f"Affected Products: {', '.join(products)}")
    suppliers = d.get("affected_suppliers", [])
    if suppliers:
        lines.append(f"Affected Suppliers: {', '.join(suppliers)}")
    warehouses = d.get("affected_warehouses", [])
    if warehouses:
        lines.append(f"Affected Warehouses: {', '.join(warehouses)}")
    for finding in d.get("critical_findings", []):
        lines.append(
            f"  [{finding.get('severity', '?')}] {finding.get('title', '?')}: "
            f"{finding.get('business_impact', '')}"
        )
    for pa in d.get("priority_actions", []):
        lines.append(
            f"  Priority #{pa.get('rank', '?')} [{pa.get('urgency', '?')}]: "
            f"{pa.get('action', '?')}"
        )
    return "\n".join(lines)


def _build_executive_prompt(
    user_question: str,
    inventory_output: Optional[InventoryAnalysisResponse] = None,
    shipment_output: Optional[ShipmentAnalysisResponse] = None,
    supplier_output: Optional[SupplierAnalysisResponse] = None,
    forecast_output: Optional[ForecastAnalysisResponse] = None,
    risk_output: Optional[RiskAnalysisResponse] = None,
) -> str:
    """
    Build the complete analysis prompt by combining user question
    with formatted outputs from all 5 upstream agents.
    """
    agents = [
        inventory_output, shipment_output, supplier_output,
        forecast_output, risk_output,
    ]
    available = sum(1 for a in agents if a is not None)

    sections = [
        "# EXECUTIVE REPORT REQUEST\n",
        f"Request: {user_question}\n",
        f"Data Sources Available: {available}/5 departments reporting\n",
        "=" * 50,
        "",
        _format_inventory(inventory_output),
        "",
        "=" * 50,
        "",
        _format_shipment(shipment_output),
        "",
        "=" * 50,
        "",
        _format_supplier(supplier_output),
        "",
        "=" * 50,
        "",
        _format_forecast(forecast_output),
        "",
        "=" * 50,
        "",
        _format_risk(risk_output),
        "",
        "=" * 50,
        "",
        "# INSTRUCTIONS",
        "",
        "Synthesize ALL of the above into a concise executive report.",
        "Write in plain business language. No technical jargon.",
        "The report must be readable in under 2 minutes.",
        "Lead with the single most important finding.",
        "Include both positive highlights and issues.",
        "End with exactly 3 numbered immediate priorities.",
        f"Set confidence based on data completeness ({available}/5 departments reported).",
    ]
    return "\n".join(sections)


class ExecutiveAgent:
    """
    Executive Summary Agent.

    Converts technical AI analysis into business-friendly executive reports.
    This is the final agent in the SupplySense pipeline.

    Architecture:
        Inventory Agent  --+
        Shipment Agent   --+
        Supplier Agent   --+---> ExecutiveAgent.analyze() ---> ExecutiveSummaryResponse
        Forecast Agent   --+
        Risk Agent       --+

    This agent does NOT:
        - Query databases
        - Call LangChain tools
        - Use AgentExecutor
        - Calculate business metrics

    It ONLY:
        - Receives validated Pydantic outputs from 5 upstream agents
        - Formats them into a structured context prompt
        - Uses LLM reasoning to produce a business-friendly summary
        - Structures output via with_structured_output
    """

    def __init__(self) -> None:
        """
        Initializes the Executive Summary Agent.
        Automatically obtains the LLM from the global factory.
        """
        self.llm = get_llm()

    @traceable(name="executive_agent_analyze")
    async def analyze(
        self,
        user_question: str,
        inventory_analysis: Optional[InventoryAnalysisResponse] = None,
        shipment_analysis: Optional[ShipmentAnalysisResponse] = None,
        supplier_analysis: Optional[SupplierAnalysisResponse] = None,
        forecast_analysis: Optional[ForecastAnalysisResponse] = None,
        risk_analysis: Optional[RiskAnalysisResponse] = None,
    ) -> ExecutiveSummaryResponse:
        """
        Produces an executive summary from upstream agent analyses.

        Pipeline:
            1. Format all upstream agent outputs into a structured prompt.
            2. Send to LLM with executive reporting system prompt.
            3. Structure output into validated ExecutiveSummaryResponse.

        Args:
            user_question: The executive's question or report request.
            inventory_analysis: Output from the Inventory Agent (optional).
            shipment_analysis: Output from the Shipment Agent (optional).
            supplier_analysis: Output from the Supplier Agent (optional).
            forecast_analysis: Output from the Forecast Agent (optional).
            risk_analysis: Output from the Risk Analysis Agent (optional).

        Returns:
            ExecutiveSummaryResponse: Business-friendly executive report.
        """
        start_time = time.time()
        state = ExecutiveAgentState(user_question=user_question)

        try:
            # -- Record upstream inputs ----------------------------------------
            if inventory_analysis is not None:
                state.record_agent_input("inventory", _safe_dump(inventory_analysis))
            if shipment_analysis is not None:
                state.record_agent_input("shipment", _safe_dump(shipment_analysis))
            if supplier_analysis is not None:
                state.record_agent_input("supplier", _safe_dump(supplier_analysis))
            if forecast_analysis is not None:
                state.record_agent_input("forecast", _safe_dump(forecast_analysis))
            if risk_analysis is not None:
                state.record_agent_input("risk", _safe_dump(risk_analysis))

            agents_available = state.execution_metadata.agents_received
            logger.info(
                f"ExecutiveAgent generating report with {agents_available}/5 "
                f"upstream agents. Request: {user_question}"
            )

            # -- Step 1: Build composite prompt --------------------------------
            analysis_prompt = _build_executive_prompt(
                user_question=user_question,
                inventory_output=inventory_analysis,
                shipment_output=shipment_analysis,
                supplier_output=supplier_analysis,
                forecast_output=forecast_analysis,
                risk_output=risk_analysis,
            )

            # -- Step 2: LLM reasoning pass ------------------------------------
            messages = [
                SystemMessage(content=EXECUTIVE_AGENT_SYSTEM_PROMPT),
                HumanMessage(content=analysis_prompt),
            ]

            raw_response = await self.llm.ainvoke(messages)
            raw_output = raw_response.content

            logger.info("ExecutiveAgent completed LLM reasoning pass.")

            # -- Step 3: Structure the output ----------------------------------
            structuring_chain = get_structuring_chain(self.llm)

            formatting_prompt = (
                f"You are a strict data formatter for executive reporting. "
                f"Convert the following executive report into the required JSON schema.\n\n"
                f"Report Request: {user_question}\n"
                f"Departments Reporting: {agents_available}/5\n"
                f"Report to Format:\n{raw_output}\n\n"
                f"RULES:\n"
                f"- 'overall_health' must be one of: 'Excellent', 'Good', 'Needs Attention', "
                f"'Concerning', 'Critical'.\n"
                f"- 'executive_summary' must be 3-5 sentences, no technical jargon.\n"
                f"- 'todays_highlights' should have 3-5 positive items.\n"
                f"- 'immediate_priorities' must have exactly 3 items.\n"
                f"- Each recommendation needs an 'owner' (role, not person name).\n"
                f"- Set 'confidence' based on data completeness ({agents_available}/5).\n"
                f"- Strictly adhere to the ExecutiveSummaryResponse schema.\n"
                f"- DO NOT invent data not present in the report above."
            )

            final_response: ExecutiveSummaryResponse = (
                await structuring_chain.ainvoke(formatting_prompt)
            )

            # -- Record final state --------------------------------------------
            state.final_response = final_response
            state.executive_summary = final_response.executive_summary
            state.priority = final_response.overall_health
            state.confidence_score = final_response.confidence
            state.execution_metadata.duration_ms = (time.time() - start_time) * 1000

            logger.info(
                f"ExecutiveAgent completed in "
                f"{state.execution_metadata.duration_ms:.0f}ms | "
                f"Health: {final_response.overall_health} | "
                f"Issues: {len(final_response.critical_issues)} | "
                f"Confidence: {final_response.confidence:.2f}"
            )

            return final_response

        except Exception as e:
            logger.error(f"ExecutiveAgent execution failed: {e}", exc_info=True)
            state.error = str(e)
            state.execution_metadata.duration_ms = (time.time() - start_time) * 1000

            return ExecutiveSummaryResponse(
                executive_summary=(
                    "The automated executive reporting system encountered an issue. "
                    "A manual review of operational status is recommended."
                ),
                overall_health="Needs Attention",
                todays_highlights=[
                    "Automated monitoring systems are active."
                ],
                critical_issues=[],
                business_impact=(
                    "Executive report generation was interrupted. "
                    "No immediate business impact, but manual review is advised."
                ),
                top_risks=[
                    "Automated reporting unavailable - manual review needed."
                ],
                recommended_actions=[
                    ManagementRecommendation(
                        action="Request manual operational status from department heads.",
                        reason=f"Automated report generation failed: {str(e)}",
                        priority="High",
                        owner="Operations Director",
                    )
                ],
                immediate_priorities=[
                    "1. Verify system connectivity and retry report generation.",
                    "2. Request manual status updates from Warehouse and Procurement teams.",
                    "3. Review yesterday's report for any outstanding action items.",
                ],
                confidence=0.0,
            )
