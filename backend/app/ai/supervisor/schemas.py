"""
SupplySense — LangGraph Supervisor Schemas
Pydantic models for intent classification, routing decisions,
merged multi-agent outputs, and final supervisor response.
"""

from typing import List, Dict, Any, Optional, Union
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


class ExecutionMode(str, Enum):
    """Execution modes for query processing."""
    DIRECT_TOOL = "direct_tool"
    AGENT = "agent"
    RAG = "rag"
    UNSUPPORTED_HYBRID = "unsupported_hybrid"
    UNKNOWN = "unknown"


class RouterIntent(str, Enum):
    """Specific intent identifiers for fast routing."""
    INVENTORY_LOOKUP = "inventory_lookup"
    INVENTORY_ANALYSIS = "inventory_analysis"
    SHIPMENT_LOOKUP = "shipment_lookup"
    SHIPMENT_ANALYSIS = "shipment_analysis"
    SUPPLIER_LOOKUP = "supplier_lookup"
    SUPPLIER_ANALYSIS = "supplier_analysis"
    PURCHASE_ORDER_LOOKUP = "purchase_order_lookup"
    WAREHOUSE_LOOKUP = "warehouse_lookup"
    FORECAST = "forecast"
    RISK_ANALYSIS = "risk_analysis"
    EXECUTIVE_SUMMARY = "executive_summary"
    KNOWLEDGE_QUERY = "knowledge_query"
    UNSUPPORTED_HYBRID = "unsupported_hybrid"
    UNKNOWN = "unknown"



class RouterDecision(BaseModel):
    """
    Structured output from the Fast Intent Router.
    Determines execution mode, primary intent, agents/tool selection, and entities.
    """
    query_type: ExecutionMode = Field(
        description="The target execution path for this query."
    )
    intent: str = Field(
        description="Specific query intent string (e.g. 'inventory_lookup', 'knowledge_query')."
    )
    agent: Optional[str] = Field(
        default=None,
        description="Primary target agent name if query_type is 'agent' or 'rag'."
    )
    selected_agents: List[AgentType] = Field(
        default_factory=list,
        description="Full list of agents required for execution."
    )
    tool: Optional[str] = Field(
        default=None,
        description="Direct tool name to invoke if query_type is 'direct_tool'."
    )
    entities: Dict[str, Any] = Field(
        default_factory=dict,
        description="Extracted query parameters (e.g. {'product': 'MacBook', 'warehouse': 'A'})."
    )
    explanation: str = Field(
        default="",
        description="Reasoning for the routing choice."
    )
    confidence: float = Field(
        default=1.0,
        description="Router confidence score (0.0 to 1.0).",
        ge=0.0,
        le=1.0,
    )
    requires_parallel_execution: bool = Field(
        default=False,
        description="True if multiple operational agents can run in parallel."
    )
    requires_sequential_synthesis: bool = Field(
        default=False,
        description="True if Risk or Executive agents depend on output from operational agents."
    )


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
    llm_calls_made: int = 0


class SupervisorResponse(BaseModel):
    """
    Final structured response returned by the LangGraph Supervisor.
    Ready to be consumed directly by FastAPI API endpoints or UI.
    """
    status: str = Field(default="success", description="Status: 'success', 'unsupported_workflow', 'clarification_needed', 'error'.")
    query: str = Field(description="Original user query.")
    query_type: str = Field(default="agent", description="Execution path: 'direct_tool', 'agent', 'rag', 'unsupported_hybrid', 'unknown'.")
    intent: Union[IntentCategory, str] = Field(description="Classified intent category or specific intent string.")
    selected_agents: List[str] = Field(default_factory=list, description="Agents executed during this request.")
    agent_used: Optional[str] = Field(default=None, description="Primary agent used if single agent.")
    tool_used: Optional[str] = Field(default=None, description="Direct tool invoked if query_type is 'direct_tool'.")
    source: Optional[str] = Field(default=None, description="Data source identifier.")
    summary: str = Field(description="Comprehensive executive summary merging all outputs.")
    answer: str = Field(description="Detailed response synthesizing findings across invoked tools/agents.")
    findings: List[MergedFinding] = Field(default_factory=list, description="Key findings from executed agents.")
    recommendations: List[MergedRecommendation] = Field(default_factory=list, description="Consolidated recommendations.")
    citations_and_sources: List[str] = Field(default_factory=list, description="Policy and document sources cited (if RAG invoked).")
    raw_agent_outputs: Dict[str, Any] = Field(default_factory=dict, description="Structured outputs from each invoked agent or direct tool.")
    confidence: float = Field(description="Overall confidence score (0.0 to 1.0).", ge=0.0, le=1.0)
    execution_metadata: ExecutionMetadata = Field(default_factory=ExecutionMetadata)

