"""
SupplySense — LangGraph Supervisor Schemas
Pydantic models for intent classification, routing decisions,
merged multi-agent outputs, and final supervisor response.
"""

from typing import List, Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field


class AgentType(str, Enum):
    """Supported agent identifiers in the SupplySense multi-agent system."""
    INVENTORY = "inventory"
    SHIPMENT = "shipment"
    SUPPLIER = "supplier"
    FORECAST = "forecast"
    RISK = "risk"
    EXECUTIVE = "executive"
    RAG = "rag"


class IntentCategory(str, Enum):
    """High-level user intent categories."""
    INVENTORY = "Inventory"
    SHIPMENT = "Shipment"
    SUPPLIER = "Supplier"
    FORECAST = "Forecast"
    RISK = "Risk"
    EXECUTIVE_SUMMARY = "Executive Summary"
    KNOWLEDGE = "Knowledge"
    HYBRID = "Hybrid"


class IntentClassification(BaseModel):
    """
    Structured output from the Intent Classifier LLM node.
    Determines user intent and selects required agents.
    """
    primary_intent: IntentCategory = Field(
        description="Primary intent category classified from user query."
    )
    explanation: str = Field(
        description="Reasoning for the intent classification and routing choice."
    )
    selected_agents: List[AgentType] = Field(
        description="List of agents required to fulfill the user's request. "
                    "For hybrid queries, select multiple agents."
    )
    requires_parallel_execution: bool = Field(
        default=False,
        description="True if selected operational agents can run in parallel."
    )
    requires_sequential_synthesis: bool = Field(
        default=False,
        description="True if Risk or Executive agents depend on output from operational agents."
    )


class MergedFinding(BaseModel):
    """A consolidated finding merged from one or more agents."""
    category: str = Field(description="Finding category — e.g. Inventory, Risk, Policy, Supplier.")
    title: str = Field(description="Short summary title.")
    detail: str = Field(description="Detailed explanation with evidence.")
    source_agent: str = Field(description="Agent that provided this finding.")
    severity: Optional[str] = Field(default=None, description="Severity if applicable (Low, Medium, High, Critical).")


class MergedRecommendation(BaseModel):
    """A consolidated, deduplicated recommendation merged from multiple agents."""
    action: str = Field(description="Recommended business action.")
    rationale: str = Field(description="Justification backed by multi-agent evidence.")
    priority: str = Field(description="Priority — Low, Medium, High, Urgent.")
    source_agents: List[str] = Field(description="Agents advocating this action.")


class ExecutionMetadata(BaseModel):
    """Observability and performance metrics for the graph execution."""
    total_duration_ms: float = 0.0
    nodes_executed: List[str] = Field(default_factory=list)
    agents_invoked: List[str] = Field(default_factory=list)
    parallel_execution_used: bool = False
    tokens_used: int = 0


class SupervisorResponse(BaseModel):
    """
    Final structured response returned by the LangGraph Supervisor.
    Ready to be consumed directly by FastAPI API endpoints or UI.
    """
    query: str = Field(description="Original user query.")
    intent: IntentCategory = Field(description="Classified intent category.")
    selected_agents: List[str] = Field(description="Agents executed during this request.")
    summary: str = Field(description="Comprehensive executive summary merging all agent outputs.")
    answer: str = Field(description="Detailed response synthesizing findings across invoked agents.")
    findings: List[MergedFinding] = Field(default_factory=list, description="Key findings from executed agents.")
    recommendations: List[MergedRecommendation] = Field(default_factory=list, description="Consolidated recommendations.")
    citations_and_sources: List[str] = Field(default_factory=list, description="Policy and document sources cited (if RAG invoked).")
    raw_agent_outputs: Dict[str, Any] = Field(default_factory=dict, description="Structured outputs from each invoked agent.")
    confidence: float = Field(description="Overall confidence score (0.0 to 1.0) calculated from multi-agent outputs.", ge=0.0, le=1.0)
    execution_metadata: ExecutionMetadata = Field(default_factory=ExecutionMetadata)
