"""
SupplySense - Executive Summary Agent State
Maintains context throughout the agent's execution lifecycle.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from backend.app.ai.agents.executive.schemas import ExecutiveSummaryResponse


class ExecutionMetadata(BaseModel):
    """Observability metrics captured during a single agent run."""
    duration_ms: float = 0.0
    tokens_used: int = 0
    agents_received: int = 0


class ExecutiveAgentState(BaseModel):
    """
    State object for the Executive Summary Agent.
    Tracks the full lifecycle from upstream agent inputs to the
    final executive report.

    This agent does NOT call database tools or business APIs.
    It only summarizes validated analysis from upstream agents.
    """
    user_question: str = Field(
        description="The original user query."
    )
    conversation_history: List[Dict[str, str]] = Field(
        default_factory=list,
        description="Past interactions for multi-turn context."
    )

    # Upstream agent inputs
    inventory_findings: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Structured output from the Inventory Agent."
    )
    shipment_findings: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Structured output from the Shipment Agent."
    )
    supplier_findings: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Structured output from the Supplier Intelligence Agent."
    )
    forecast_findings: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Structured output from the Demand Forecast Agent."
    )
    risk_findings: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Structured output from the Risk Analysis Agent."
    )

    # Output
    executive_summary: Optional[str] = Field(
        default=None,
        description="The generated executive summary text."
    )
    recommendations: List[str] = Field(
        default_factory=list,
        description="Management recommendations."
    )
    priority: Optional[str] = Field(
        default=None,
        description="Overall priority level."
    )
    confidence_score: float = Field(
        default=0.0,
        description="Confidence in the summary."
    )
    final_response: Optional[ExecutiveSummaryResponse] = Field(
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

    def record_agent_input(self, agent_name: str, output: Dict[str, Any]) -> None:
        """Record an upstream agent's findings for observability."""
        field_map = {
            "inventory": "inventory_findings",
            "shipment": "shipment_findings",
            "supplier": "supplier_findings",
            "forecast": "forecast_findings",
            "risk": "risk_findings",
        }
        field = field_map.get(agent_name)
        if field:
            setattr(self, field, output)
            self.execution_metadata.agents_received += 1
