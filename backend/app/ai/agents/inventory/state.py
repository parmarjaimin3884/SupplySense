from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from backend.app.ai.agents.inventory.schemas import InventoryAnalysisResponse

class InventoryAgentState(BaseModel):
    """
    Represents the internal state of the Inventory Agent during a single execution.
    While this agent operates independently without a LangGraph supervisor, this state
    object helps organize the data flow cleanly.
    """
    user_question: str = Field(description="The original question or command from the user.")
    tool_calls_made: List[str] = Field(default_factory=list, description="List of tool names invoked.")
    tool_outputs: Dict[str, Any] = Field(default_factory=dict, description="Raw data retrieved from the tool layer.")
    final_response: Optional[InventoryAnalysisResponse] = Field(default=None, description="The final structured output.")
    error: Optional[str] = Field(default=None, description="Any error encountered during execution.")

    def add_tool_output(self, tool_name: str, output: Any):
        self.tool_calls_made.append(tool_name)
        self.tool_outputs[tool_name] = output
