import logging
import time
from typing import Optional

try:
    from langchain.agents import AgentExecutor, create_tool_calling_agent
except ImportError:
    from langchain_classic.agents import AgentExecutor, create_tool_calling_agent
from langsmith import traceable

from backend.app.ai.llm import get_llm
from backend.app.ai.agents.shipment.prompt import get_shipment_prompt
from backend.app.ai.agents.shipment.utils import get_shipment_agent_tools
from backend.app.ai.agents.shipment.schemas import ShipmentAnalysisResponse
from backend.app.ai.agents.shipment.state import ShipmentState
from backend.app.ai.agents.shipment.chains import get_structuring_chain

logger = logging.getLogger(__name__)

class ShipmentAgent:
    """
    Shipment Monitoring Agent.
    Monitors all incoming shipments, detects risks, evaluates suppliers,
    and acts as a Senior Supply Chain Logistics Manager.
    """
    
    def __init__(self):
        """
        Initializes the agent utilizing the global LLM factory.
        """
        self.llm = get_llm()
        self.tools = get_shipment_agent_tools()
        self.prompt = get_shipment_prompt()
        
        # Tool Calling Agent setup
        self.agent = create_tool_calling_agent(self.llm, self.tools, self.prompt)
        self.agent_executor = AgentExecutor(
            agent=self.agent, 
            tools=self.tools, 
            verbose=False, 
            return_intermediate_steps=True,
            handle_parsing_errors=True
        )

    @traceable(name="shipment_agent_analyze")
    async def analyze(self, user_question: str) -> ShipmentAnalysisResponse:
        """
        Processes a user question about shipments and returns structured analysis.
        """
        start_time = time.time()
        state = ShipmentState(user_question=user_question)
        
        try:
            # 1. Execute agent to fetch data and construct reasoning
            logger.info(f"ShipmentAgent analyzing question: {user_question}")
            result = await self.agent_executor.ainvoke({"user_question": user_question})
            
            raw_output = result.get("output", "")
            intermediate_steps = result.get("intermediate_steps", [])
            
            # Record observability metrics
            state.shipment_analysis = raw_output
            for action, observation in intermediate_steps:
                state.record_tool_call(action.tool, observation)
                
            logger.info(f"ShipmentAgent executed {len(intermediate_steps)} tools.")

            # 2. Structure the raw output into the required Pydantic schema
            structuring_chain = get_structuring_chain(self.llm)
            
            formatting_prompt = (
                f"You are a strict data formatter. Convert the following logistics analysis into the required JSON schema.\n\n"
                f"Original Question: {user_question}\n"
                f"Analysis to Format:\n{raw_output}\n\n"
                f"Ensure the output strictly adheres to the ShipmentAnalysisResponse schema."
            )
            
            final_response = await structuring_chain.ainvoke(formatting_prompt)
            
            state.final_response = final_response
            state.execution_metadata.duration_ms = (time.time() - start_time) * 1000
            
            return final_response
            
        except Exception as e:
            logger.error(f"ShipmentAgent execution failed: {e}")
            state.error = str(e)
            state.execution_metadata.duration_ms = (time.time() - start_time) * 1000
            
            # Graceful Fallback
            return ShipmentAnalysisResponse(
                summary="An unexpected error occurred while analyzing shipment health.",
                shipment_status="Error",
                critical_shipments=[],
                delayed_shipments=[],
                supplier_risk=["Agent execution failure", str(e)],
                warehouse_risk=[],
                recommendations=["Please try again later or verify database connections."],
                confidence=0.0
            )
