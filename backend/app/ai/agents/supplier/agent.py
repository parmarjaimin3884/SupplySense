"""
SupplySense — Supplier Intelligence Agent
Production-ready agent that evaluates supplier performance, procurement risks,
and provides strategic recommendations.
Acts as a Senior Procurement Manager.
"""

import logging
import time
from typing import Optional

try:
    from langchain.agents import AgentExecutor, create_tool_calling_agent
except ImportError:
    from langchain_classic.agents import AgentExecutor, create_tool_calling_agent
from langsmith import traceable

from backend.app.ai.llm import get_llm
from backend.app.ai.agents.supplier.prompt import get_supplier_prompt
from backend.app.ai.agents.supplier.utils import get_supplier_agent_tools
from backend.app.ai.agents.supplier.schemas import (
    SupplierAnalysisResponse,
    SupplierRecommendation,
)
from backend.app.ai.agents.supplier.state import SupplierAgentState
from backend.app.ai.agents.supplier.chains import get_structuring_chain

logger = logging.getLogger(__name__)


class SupplierAgent:
    """
    Supplier Intelligence Agent.

    Continuously evaluates supplier performance and procurement risks.
    Uses LangChain tool-calling agent architecture with existing SupplySense
    database tools. Returns structured Pydantic models.

    Responsibilities:
        - Supplier reliability & quality analysis
        - Lead time & delivery performance evaluation
        - Purchase order fulfillment tracking
        - Procurement risk identification
        - Vendor ranking & comparison
        - Alternative supplier recommendations
    """

    def __init__(self) -> None:
        """
        Initializes the Supplier Intelligence Agent.
        Automatically obtains the LLM from the global factory.
        """
        self.llm = get_llm()
        self.tools = get_supplier_agent_tools()
        self.prompt = get_supplier_prompt()

        # Create the LangChain tool-calling agent
        self.agent = create_tool_calling_agent(self.llm, self.tools, self.prompt)
        self.agent_executor = AgentExecutor(
            agent=self.agent,
            tools=self.tools,
            verbose=False,
            return_intermediate_steps=True,
            handle_parsing_errors=True,
            max_iterations=15,
        )

    @traceable(name="supplier_agent_analyze")
    async def analyze(self, user_question: str) -> SupplierAnalysisResponse:
        """
        Processes a user question about suppliers and returns a structured analysis.

        Pipeline:
            1. Execute the tool-calling agent to gather data and produce reasoning.
            2. Record intermediate tool calls for observability.
            3. Pass the raw analysis through a structuring chain to produce
               a validated SupplierAnalysisResponse.

        Args:
            user_question: The natural-language procurement or supplier question.

        Returns:
            SupplierAnalysisResponse: Fully structured analysis with health,
            risks, recommendations, and confidence score.
        """
        start_time = time.time()
        state = SupplierAgentState(user_question=user_question)

        try:
            # ── Step 1: Execute the agent ────────────────────────────────
            logger.info(f"SupplierAgent analyzing question: {user_question}")
            result = await self.agent_executor.ainvoke(
                {"user_question": user_question}
            )

            raw_output = result.get("output", "")
            intermediate_steps = result.get("intermediate_steps", [])

            # Record observability data
            for action, observation in intermediate_steps:
                state.record_tool_call(action.tool, observation)

            logger.info(
                f"SupplierAgent executed {len(intermediate_steps)} tool call(s)."
            )

            # ── Step 2: Structure the raw output ─────────────────────────
            structuring_chain = get_structuring_chain(self.llm)

            formatting_prompt = (
                f"You are a strict data formatter for a procurement intelligence system. "
                f"Convert the following supplier analysis into the required JSON schema.\n\n"
                f"Original Question: {user_question}\n"
                f"Analysis to Format:\n{raw_output}\n\n"
                f"IMPORTANT RULES:\n"
                f"- Populate 'supplier_health' with per-supplier details if individual supplier data was analyzed.\n"
                f"- Populate 'best_suppliers' with company names of top performers.\n"
                f"- Populate 'risky_suppliers' with company names of at-risk vendors.\n"
                f"- Each recommendation must include action, rationale, and priority.\n"
                f"- Set 'confidence' based on how much data was available (1.0 = complete data, 0.5 = partial, <0.3 = very limited).\n"
                f"- Ensure the output strictly adheres to the SupplierAnalysisResponse schema.\n"
                f"- DO NOT hallucinate any data — only use information from the analysis above."
            )

            final_response: SupplierAnalysisResponse = await structuring_chain.ainvoke(
                formatting_prompt
            )

            # ── Step 3: Record final state ───────────────────────────────
            state.final_response = final_response
            state.confidence_score = final_response.confidence
            state.execution_metadata.duration_ms = (time.time() - start_time) * 1000

            logger.info(
                f"SupplierAgent completed in {state.execution_metadata.duration_ms:.0f}ms "
                f"with confidence={final_response.confidence:.2f}"
            )

            return final_response

        except Exception as e:
            logger.error(f"SupplierAgent execution failed: {e}", exc_info=True)
            state.error = str(e)
            state.execution_metadata.duration_ms = (time.time() - start_time) * 1000

            # Graceful fallback — always return a valid schema
            return SupplierAnalysisResponse(
                summary="An unexpected error occurred while analyzing supplier intelligence.",
                supplier_health=[],
                best_suppliers=[],
                risky_suppliers=[],
                risk_assessments=[],
                recommendations=[
                    SupplierRecommendation(
                        action="Retry Analysis",
                        supplier_name=None,
                        rationale=f"Agent execution failed: {str(e)}. "
                                  f"Verify database connectivity and tool availability.",
                        priority="High",
                    )
                ],
                confidence=0.0,
            )
