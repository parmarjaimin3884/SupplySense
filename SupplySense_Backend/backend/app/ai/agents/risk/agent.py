"""
SupplySense — Risk Analysis Agent
The CENTRAL DECISION MAKING AGENT for the SupplySense platform.

This agent does NOT query databases or call business tools.
It receives structured outputs from 4 upstream agents (Inventory, Shipment,
Supplier, Forecast) and produces an enterprise-level operational risk
assessment with cross-correlated findings and prioritized actions.
"""

import logging
import time
from typing import Optional

from langchain_core.messages import SystemMessage, HumanMessage
from langsmith import traceable

from backend.app.ai.llm import get_llm
from backend.app.ai.agents.risk.prompt import RISK_AGENT_SYSTEM_PROMPT
from backend.app.ai.agents.risk.schemas import (
    RiskAnalysisResponse,
    PriorityAction,
    RiskRecommendation,
)
from backend.app.ai.agents.risk.state import RiskAgentState
from backend.app.ai.agents.risk.chains import get_structuring_chain
from backend.app.ai.agents.risk.utils import (
    build_risk_analysis_prompt,
    compute_data_confidence,
)

# Upstream agent response types
from backend.app.ai.agents.inventory.schemas import InventoryAnalysisResponse
from backend.app.ai.agents.shipment.schemas import ShipmentAnalysisResponse
from backend.app.ai.agents.supplier.schemas import SupplierAnalysisResponse
from backend.app.ai.agents.forecast.schemas import ForecastAnalysisResponse

logger = logging.getLogger(__name__)


class RiskAgent:
    """
    Risk Analysis Agent — The Central Decision Intelligence Engine.

    Unlike other SupplySense agents, the Risk Agent does NOT use tools
    or an AgentExecutor. It operates as a pure reasoning chain:

    1. Receives validated Pydantic outputs from 4 upstream agents.
    2. Formats them into a comprehensive analysis prompt.
    3. Passes through LLM for cross-domain risk reasoning.
    4. Structures output into a validated RiskAnalysisResponse.

    Architecture:
        Inventory Agent ──┐
        Shipment Agent  ──┤
        Supplier Agent  ──┼──► RiskAgent.analyze() ──► RiskAnalysisResponse
        Forecast Agent  ──┘

    Responsibilities:
        - Cross-correlate risks across inventory, shipment, supplier, and demand
        - Classify overall operational risk level (Very Low → Critical)
        - Rank priority actions by urgency
        - Produce executive-ready risk summaries
        - Identify affected products, suppliers, and warehouses
    """

    def __init__(self) -> None:
        """
        Initializes the Risk Analysis Agent.
        Automatically obtains the LLM from the global factory.
        """
        self.llm = get_llm()

    @traceable(name="risk_agent_analyze")
    async def analyze(
        self,
        user_question: str,
        inventory_analysis: Optional[InventoryAnalysisResponse] = None,
        shipment_analysis: Optional[ShipmentAnalysisResponse] = None,
        supplier_analysis: Optional[SupplierAnalysisResponse] = None,
        forecast_analysis: Optional[ForecastAnalysisResponse] = None,
    ) -> RiskAnalysisResponse:
        """
        Processes upstream agent outputs and produces an enterprise-level
        operational risk assessment.

        Pipeline:
            1. Format all upstream agent outputs into a structured context prompt.
            2. Send to LLM with risk analysis system prompt for reasoning.
            3. Pass raw reasoning through structuring chain for Pydantic output.

        Args:
            user_question: The natural-language risk or operations question.
            inventory_analysis: Output from the Inventory Agent (optional).
            shipment_analysis: Output from the Shipment Agent (optional).
            supplier_analysis: Output from the Supplier Intelligence Agent (optional).
            forecast_analysis: Output from the Demand Forecast Agent (optional).

        Returns:
            RiskAnalysisResponse: Fully structured risk assessment with findings,
            priority actions, recommendations, and confidence score.
        """
        start_time = time.time()
        state = RiskAgentState(user_question=user_question)

        try:
            # -- Step 0: Record upstream inputs --------------------------------
            if inventory_analysis is not None:
                state.record_agent_input("inventory", inventory_analysis.model_dump()
                    if hasattr(inventory_analysis, "model_dump")
                    else inventory_analysis.dict()
                )
            if shipment_analysis is not None:
                state.record_agent_input("shipment", shipment_analysis.model_dump()
                    if hasattr(shipment_analysis, "model_dump")
                    else shipment_analysis.dict()
                )
            if supplier_analysis is not None:
                state.record_agent_input("supplier", supplier_analysis.model_dump()
                    if hasattr(supplier_analysis, "model_dump")
                    else supplier_analysis.dict()
                )
            if forecast_analysis is not None:
                state.record_agent_input("forecast", forecast_analysis.model_dump()
                    if hasattr(forecast_analysis, "model_dump")
                    else forecast_analysis.dict()
                )

            agents_available = state.execution_metadata.agents_received
            logger.info(
                f"RiskAgent analyzing with {agents_available}/4 upstream agents. "
                f"Question: {user_question}"
            )

            # -- Step 1: Build the composite analysis prompt -------------------
            analysis_prompt = build_risk_analysis_prompt(
                user_question=user_question,
                inventory_output=inventory_analysis,
                shipment_output=shipment_analysis,
                supplier_output=supplier_analysis,
                forecast_output=forecast_analysis,
            )

            # -- Step 2: LLM reasoning pass ------------------------------------
            messages = [
                SystemMessage(content=RISK_AGENT_SYSTEM_PROMPT),
                HumanMessage(content=analysis_prompt),
            ]

            raw_response = await self.llm.ainvoke(messages)
            raw_output = raw_response.content

            logger.info("RiskAgent completed LLM reasoning pass.")

            # -- Step 3: Structure the raw output ------------------------------
            structuring_chain = get_structuring_chain(self.llm)

            formatting_prompt = (
                f"You are a strict data formatter for an enterprise risk management system. "
                f"Convert the following operational risk analysis into the required JSON schema.\n\n"
                f"Original Question: {user_question}\n"
                f"Upstream Agents Reporting: {agents_available}/4\n"
                f"Risk Analysis to Format:\n{raw_output}\n\n"
                f"IMPORTANT RULES:\n"
                f"- Set 'risk_level' to one of: 'Very Low', 'Low', 'Medium', 'High', 'Critical'.\n"
                f"- Each finding in 'critical_findings' must have a unique risk_id (e.g. RISK-INV-001).\n"
                f"- Each finding must specify 'source_agents' — which upstream agents provided evidence.\n"
                f"- Rank 'priority_actions' by urgency (rank 1 = most urgent).\n"
                f"- Set 'confidence' considering {agents_available}/4 agents reported.\n"
                f"- Ensure the output strictly adheres to the RiskAnalysisResponse schema.\n"
                f"- DO NOT hallucinate any data — only use information from the analysis above."
            )

            final_response: RiskAnalysisResponse = (
                await structuring_chain.ainvoke(formatting_prompt)
            )

            # -- Step 4: Record final state ------------------------------------
            state.final_response = final_response
            state.risk_score = _risk_level_to_score(final_response.risk_level)
            state.severity = final_response.risk_level
            state.confidence_score = final_response.confidence
            state.execution_metadata.duration_ms = (time.time() - start_time) * 1000

            logger.info(
                f"RiskAgent completed in {state.execution_metadata.duration_ms:.0f}ms | "
                f"Risk Level: {final_response.risk_level} | "
                f"Findings: {len(final_response.critical_findings)} | "
                f"Priority Actions: {len(final_response.priority_actions)} | "
                f"Confidence: {final_response.confidence:.2f}"
            )

            return final_response

        except Exception as e:
            logger.error(f"RiskAgent execution failed: {e}", exc_info=True)
            state.error = str(e)
            state.execution_metadata.duration_ms = (time.time() - start_time) * 1000

            # Compute fallback confidence from available data
            fallback_confidence = compute_data_confidence(
                inventory_analysis, shipment_analysis,
                supplier_analysis, forecast_analysis,
            )

            # Graceful fallback — always return a valid schema
            return RiskAnalysisResponse(
                summary="An unexpected error occurred during operational risk analysis.",
                overall_risk=f"Risk analysis engine encountered an error: {str(e)}",
                risk_level="Medium",
                critical_findings=[],
                affected_products=[],
                affected_suppliers=[],
                affected_warehouses=[],
                recommendations=[
                    RiskRecommendation(
                        action="Retry Risk Analysis",
                        category="Operational Escalation",
                        target=None,
                        rationale=f"Agent execution failed: {str(e)}. "
                                  f"Verify LLM connectivity and upstream agent outputs.",
                        priority="High",
                    )
                ],
                priority_actions=[
                    PriorityAction(
                        rank=1,
                        action="Operational Escalation",
                        target="Risk Analysis System",
                        rationale="Automated risk analysis is unavailable. "
                                  "Manual review of upstream agent outputs recommended.",
                        urgency="Within 24 Hours",
                    )
                ],
                confidence=0.0,
            )


def _risk_level_to_score(risk_level: str) -> float:
    """Convert a textual risk level to a numeric score (0.0 - 1.0)."""
    mapping = {
        "Very Low": 0.1,
        "Low": 0.3,
        "Medium": 0.5,
        "High": 0.7,
        "Critical": 0.95,
    }
    return mapping.get(risk_level, 0.5)
