import logging
import json
from typing import Optional

from langchain_core.language_models.chat_models import BaseChatModel
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.messages import SystemMessage, HumanMessage

from backend.app.ai.agents.inventory.prompt import get_prompt_template
from backend.app.ai.agents.inventory.utils import get_all_inventory_tools
from backend.app.ai.agents.inventory.schemas import InventoryAnalysisResponse
from backend.app.ai.agents.inventory.state import InventoryAgentState

from backend.app.ai.llm import get_llm

logger = logging.getLogger(__name__)

class InventoryAgent:
    """
    An independent Inventory Agent that acts as a Warehouse Inventory Manager.
    It takes a user question, decides which tools to call, fetches structured data,
    analyzes it, and returns a structured Pydantic model with recommendations.
    """
    
    def __init__(self, llm: Optional[BaseChatModel] = None):
        """
        Initialize the agent with a configurable ChatModel (defaults to global LLM factory get_llm()).
        """
        self.llm = llm if llm is not None else get_llm()
        self.tools = get_all_inventory_tools()
        self.prompt = get_prompt_template()
        
        # Create the LangChain Agent using the tool-calling architecture
        self.agent = create_tool_calling_agent(self.llm, self.tools, self.prompt)
        self.agent_executor = AgentExecutor(
            agent=self.agent, 
            tools=self.tools, 
            verbose=False, 
            return_intermediate_steps=True
        )

    async def analyze(self, user_question: str) -> InventoryAnalysisResponse:
        """
        Analyzes the user's inventory question and returns a structured response.
        """
        state = InventoryAgentState(user_question=user_question)
        
        try:
            # 1. Execute the agent to gather data and get a natural language analysis
            result = await self.agent_executor.ainvoke({"user_question": user_question})
            
            raw_output = result.get("output", "")
            intermediate_steps = result.get("intermediate_steps", [])
            
            # Record tool usages in our state for observability
            for action, observation in intermediate_steps:
                state.add_tool_output(action.tool, observation)
            
            # 2. Force the LLM to structure the raw analysis into our schema
            # We use `with_structured_output` to parse the final reasoning.
            structured_llm = self.llm.with_structured_output(InventoryAnalysisResponse)
            
            structuring_prompt = (
                f"You are a strict data formatter. Convert the following analysis into the required JSON schema.\n\n"
                f"Original User Question: {user_question}\n"
                f"Analysis to Format:\n{raw_output}\n\n"
                f"Ensure the output strictly adheres to the InventoryAnalysisResponse schema without hallucinating."
            )
            
            final_structured_response = await structured_llm.ainvoke(structuring_prompt)
            
            state.final_response = final_structured_response
            return final_structured_response
            
        except Exception as e:
            logger.error(f"InventoryAgent failed during analysis: {e}")
            state.error = str(e)
            # Return a graceful fallback response matching the schema
            return InventoryAnalysisResponse(
                summary="An unexpected error occurred while processing your inventory request.",
                risks=["Agent execution failure", str(e)],
                recommendations=["Please try again later or contact technical support."],
                inventory_status="Error",
                confidence=0.0
            )
