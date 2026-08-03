"""
SupplySense — Risk Analysis Agent State
Maintains context throughout the agent's execution lifecycle.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from backend.app.ai.agents.risk.schemas import RiskAnalysisResponse


class ExecutionMetadata(BaseModel):
    """Observability metrics captured during a single agent run."""
    duration_ms: float = 0.0
    tokens_used: int = 0
    agents_received: int = 0


class RiskAgentState(BaseModel):
    """
    State object for the Risk Analysis Agent.
    Tracks the full lifecycle of a single analysis invocation —
    from user question through upstream agent inputs to the final
    enterprise-level risk assessment.

    Unlike other agents, the Risk Agent does NOT call database tools.
    It receives structured outputs from 4 upstream agents.
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

    # Agent reasoning
    detected_risks: List[str] = Field(
        default_factory=list,
        description="Risks identified during cross-agent analysis."
    )
    risk_score: float = Field(
        default=0.0,
        description="Computed overall risk score (0.0 = no risk, 1.0 = critical)."
    )
    severity: Optional[str] = Field(
        default=None,
        description="Overall severity level — Very Low, Low, Medium, High, Critical."
    )
    recommendations: List[str] = Field(
        default_factory=list,
        description="Proposed business actions."
    )
    confidence_score: float = Field(
        default=0.0,
        description="Confidence in the analysis."
    )

    # Output
    final_response: Optional[RiskAnalysisResponse] = Field(
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
        if agent_name == "inventory":
            self.inventory_findings = output
        elif agent_name == "shipment":
            self.shipment_findings = output
        elif agent_name == "supplier":
            self.supplier_findings = output
        elif agent_name == "forecast":
            self.forecast_findings = output
        self.execution_metadata.agents_received += 1
