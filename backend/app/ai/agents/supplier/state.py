"""
SupplySense — Supplier Intelligence Agent State
Maintains context throughout the agent's execution lifecycle.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from backend.app.ai.agents.supplier.schemas import SupplierAnalysisResponse


class ExecutionMetadata(BaseModel):
    """Observability metrics captured during a single agent run."""
    duration_ms: float = 0.0
    tokens_used: int = 0
    tools_called: int = 0


class SupplierAgentState(BaseModel):
    """
    State object for the Supplier Intelligence Agent.
    Tracks everything from the original question through tool execution
    to the final structured response.
    """
    user_question: str = Field(
        description="The original user query."
    )
    conversation_history: List[Dict[str, str]] = Field(
        default_factory=list,
        description="Past interactions for multi-turn context."
    )
    detected_intent: Optional[str] = Field(
        default=None,
        description="Classified intent of the user's question — e.g. 'supplier_comparison', 'risk_assessment'."
    )
    selected_tools: List[str] = Field(
        default_factory=list,
        description="Tools the agent decided to invoke during this run."
    )
    tool_outputs: Dict[str, Any] = Field(
        default_factory=dict,
        description="Raw data returned from each tool invocation."
    )
    supplier_data: Dict[str, Any] = Field(
        default_factory=dict,
        description="Aggregated supplier information from tool outputs."
    )
    shipment_analysis: str = Field(
        default="",
        description="Intermediate analysis of shipment-related data."
    )
    purchase_order_analysis: str = Field(
        default="",
        description="Intermediate analysis of purchase order data."
    )
    supplier_risk: List[str] = Field(
        default_factory=list,
        description="Identified supplier risks."
    )
    recommendations: List[str] = Field(
        default_factory=list,
        description="Proposed business actions."
    )
    confidence_score: float = Field(
        default=0.0,
        description="Overall confidence in the analysis."
    )
    final_response: Optional[SupplierAnalysisResponse] = Field(
        default=None,
        description="The final structured Pydantic response."
    )
    execution_metadata: ExecutionMetadata = Field(
        default_factory=ExecutionMetadata
    )
    error: Optional[str] = Field(
        default=None,
        description="Error captured during execution for graceful degradation."
    )

    def record_tool_call(self, tool_name: str, output: Any) -> None:
        """Record a tool invocation and its output for observability."""
        self.selected_tools.append(tool_name)
        self.tool_outputs[tool_name] = output
        self.execution_metadata.tools_called += 1
