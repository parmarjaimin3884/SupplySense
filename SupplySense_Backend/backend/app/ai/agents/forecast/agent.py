"""
SupplySense — Demand Forecast Agent
Production-ready agent that predicts future product demand, identifies
seasonal trends, and provides procurement recommendations.
Acts as a Senior Demand Planning Manager.
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
from backend.app.ai.agents.forecast.prompt import get_forecast_prompt
from backend.app.ai.agents.forecast.utils import get_forecast_agent_tools
from backend.app.ai.agents.forecast.schemas import (
    ForecastAnalysisResponse,
    DemandRecommendation,
)
from backend.app.ai.agents.forecast.state import ForecastAgentState
from backend.app.ai.agents.forecast.chains import get_structuring_chain

logger = logging.getLogger(__name__)


class ForecastAgent:
    """
    Demand Forecast Agent.

    Predicts future product demand by analyzing historical sales,
    seasonal patterns, inventory turnover, and trending products.
    Returns structured Pydantic models with forecasts and
    procurement recommendations.

    Responsibilities:
        - Future demand prediction (daily, weekly, monthly, seasonal)
        - Trending & slow product identification
        - Seasonal / festive demand spike detection
        - Demand decline early warning
        - Procurement & safety stock recommendations
        - Dead stock clearance suggestions
    """

    def __init__(self) -> None:
        """
        Initializes the Demand Forecast Agent.
        Automatically obtains the LLM from the global factory.
        """
        self.llm = get_llm()
        self.tools = get_forecast_agent_tools()
        self.prompt = get_forecast_prompt()

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

    @traceable(name="forecast_agent_analyze")
    async def analyze(self, user_question: str) -> ForecastAnalysisResponse:
        """
        Processes a user question about demand forecasting and returns
        a structured analysis.

        Pipeline:
            1. Execute the tool-calling agent to gather data and produce reasoning.
            2. Record intermediate tool calls for observability.
            3. Pass the raw analysis through a structuring chain to produce
               a validated ForecastAnalysisResponse.

        Args:
            user_question: The natural-language demand or forecasting question.

        Returns:
            ForecastAnalysisResponse: Fully structured forecast with predictions,
            trending products, recommendations, and confidence score.
        """
        start_time = time.time()
        state = ForecastAgentState(user_question=user_question)

        try:
            # -- Step 1: Execute the agent ------------------------------------
            logger.info(f"ForecastAgent analyzing question: {user_question}")
            result = await self.agent_executor.ainvoke(
                {"user_question": user_question}
            )

            raw_output = result.get("output", "")
            intermediate_steps = result.get("intermediate_steps", [])

            # Record observability data
            for action, observation in intermediate_steps:
                state.record_tool_call(action.tool, observation)

            logger.info(
                f"ForecastAgent executed {len(intermediate_steps)} tool call(s)."
            )

            # -- Step 2: Structure the raw output -----------------------------
            structuring_chain = get_structuring_chain(self.llm)

            formatting_prompt = (
                f"You are a strict data formatter for a demand forecasting system. "
                f"Convert the following demand analysis into the required JSON schema.\n\n"
                f"Original Question: {user_question}\n"
                f"Analysis to Format:\n{raw_output}\n\n"
                f"IMPORTANT RULES:\n"
                f"- Populate 'forecast' with per-product demand predictions if individual products were analyzed.\n"
                f"- Set 'predicted_demand' to the overall demand outlook: 'Growing', 'Stable', 'Declining', or 'Mixed'.\n"
                f"- Populate 'high_demand_products' with names of top/trending products.\n"
                f"- Populate 'low_demand_products' with names of slow-moving or declining products.\n"
                f"- Each recommendation must include action, rationale, and priority.\n"
                f"- Set 'confidence' based on data availability (1.0 = complete data, 0.5 = partial, <0.3 = very limited).\n"
                f"- Ensure the output strictly adheres to the ForecastAnalysisResponse schema.\n"
                f"- DO NOT hallucinate any data — only use information from the analysis above."
            )

            final_response: ForecastAnalysisResponse = (
                await structuring_chain.ainvoke(formatting_prompt)
            )

            # -- Step 3: Record final state -----------------------------------
            state.final_response = final_response
            state.confidence_score = final_response.confidence
            state.execution_metadata.duration_ms = (time.time() - start_time) * 1000

            logger.info(
                f"ForecastAgent completed in {state.execution_metadata.duration_ms:.0f}ms "
                f"with confidence={final_response.confidence:.2f}"
            )

            return final_response

        except Exception as e:
            logger.error(f"ForecastAgent execution failed: {e}", exc_info=True)
            state.error = str(e)
            state.execution_metadata.duration_ms = (time.time() - start_time) * 1000

            # Graceful fallback — always return a valid schema
            return ForecastAnalysisResponse(
                summary="An unexpected error occurred while analyzing demand forecasts.",
                forecast=[],
                predicted_demand="Unknown",
                high_demand_products=[],
                low_demand_products=[],
                recommendations=[
                    DemandRecommendation(
                        action="Retry Analysis",
                        product_name=None,
                        rationale=f"Agent execution failed: {str(e)}. "
                                  f"Verify database connectivity and tool availability.",
                        priority="High",
                    )
                ],
                confidence=0.0,
            )
