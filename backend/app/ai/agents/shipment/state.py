from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from backend.app.ai.agents.shipment.schemas import ShipmentAnalysisResponse

class ExecutionMetadata(BaseModel):
    duration_ms: float = 0.0
    tokens_used: int = 0
    tools_called: int = 0

class ShipmentState(BaseModel):
    """
    State object for the Shipment Monitoring Agent.
    Maintains context throughout the agent's execution lifecycle.
    """
    user_question: str = Field(description="The original user query.")
    conversation_history: List[Dict[str, str]] = Field(default_factory=list, description="Past interactions if any.")
    detected_intent: Optional[str] = Field(default=None, description="What the agent believes the user wants.")
    selected_tools: List[str] = Field(default_factory=list, description="Tools the agent decided to invoke.")
    tool_outputs: Dict[str, Any] = Field(default_factory=dict, description="Raw data from the tools.")
    shipment_analysis: str = Field(default="", description="Internal reasoning and analysis text.")
    business_risks: List[str] = Field(default_factory=list, description="Identified risks.")
    recommendations: List[str] = Field(default_factory=list, description="Proposed actions.")
    confidence_score: float = Field(default=0.0)
    final_response: Optional[ShipmentAnalysisResponse] = Field(default=None)
    execution_metadata: ExecutionMetadata = Field(default_factory=ExecutionMetadata)
    error: Optional[str] = Field(default=None, description="Graceful error capture.")

    def record_tool_call(self, tool_name: str, output: Any):
        self.selected_tools.append(tool_name)
        self.tool_outputs[tool_name] = output
        self.execution_metadata.tools_called += 1
