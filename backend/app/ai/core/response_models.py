"""
SupplySense — Shared AI Core: Response Models
===============================================

Standardised Pydantic models that provide a uniform response contract
across all AI agents and the LangGraph Supervisor merger.

Design Principles
-----------------
* **Domain-independent** — models carry structural metadata, not supply-chain
  business logic.
* **Supervisor-compatible** — ``AgentResponse`` can be serialised into the
  ``agent_outputs`` dict consumed by the merger node.
* **Extensible** — domain agents return their own specific schemas (e.g.
  ``InventoryAnalysisResponse``) but can wrap them inside ``AgentResponse``
  for consistent metadata and error propagation.

Usage
-----
::

    from backend.app.ai.core.response_models import AgentResponse, AgentFinding

    response = AgentResponse(
        agent_name="inventory",
        status="success",
        summary="All stock levels are healthy.",
        confidence=0.92,
    )
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class AgentStatus(str, Enum):
    """Execution outcome for an agent run."""
    SUCCESS = "success"
    PARTIAL_SUCCESS = "partial_success"
    FAILURE = "failure"


class Severity(str, Enum):
    """Standard severity levels used across findings and risks."""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class Priority(str, Enum):
    """Standard priority levels used across recommendations."""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"


# ---------------------------------------------------------------------------
# Evidence
# ---------------------------------------------------------------------------

class Evidence(BaseModel):
    """
    Identifies where a finding came from.

    Attributes:
        source_type: The type of data source (e.g. 'Database Tool',
                     'RAG Document', 'Upstream Agent').
        source_name: Specific tool or document name.
        detail: Brief description of the evidence.
        data: Optional raw data excerpt supporting the evidence.
    """
    source_type: str = Field(
        description="Type of source — e.g. 'Database Tool', 'RAG Document', "
                    "'Upstream Agent', 'Shipment Tool', 'Inventory Tool'."
    )
    source_name: Optional[str] = Field(
        default=None,
        description="Specific tool or document name."
    )
    detail: str = Field(
        default="",
        description="Brief description of the evidence."
    )
    data: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional raw data excerpt."
    )


# ---------------------------------------------------------------------------
# Finding
# ---------------------------------------------------------------------------

class AgentFinding(BaseModel):
    """
    A single actionable finding produced by an agent.

    Attributes:
        title: Short summary title.
        description: Detailed explanation of the finding.
        severity: Severity classification.
        category: Domain category (e.g. 'Inventory', 'Shipment', 'Supplier').
        evidence: Supporting evidence for this finding.
        confidence: Confidence in this specific finding (0.0–1.0).
        affected_entities: Names of products, suppliers, warehouses, etc.
    """
    title: str = Field(description="Short summary title.")
    description: str = Field(description="Detailed explanation of the finding.")
    severity: Optional[str] = Field(
        default=None,
        description="Severity level — Low, Medium, High, Critical."
    )
    category: Optional[str] = Field(
        default=None,
        description="Domain category — e.g. 'Inventory', 'Shipment', 'Risk'."
    )
    evidence: List[Evidence] = Field(
        default_factory=list,
        description="Supporting evidence."
    )
    confidence: float = Field(
        default=1.0,
        description="Confidence in this finding (0.0–1.0).",
        ge=0.0,
        le=1.0,
    )
    affected_entities: List[str] = Field(
        default_factory=list,
        description="Names of affected products, suppliers, warehouses, etc."
    )


# ---------------------------------------------------------------------------
# Recommendation
# ---------------------------------------------------------------------------

class Recommendation(BaseModel):
    """
    An actionable recommendation produced by an agent.

    Attributes:
        action: The recommended action.
        priority: Priority level.
        reason: Why this action is recommended.
        expected_impact: Expected business impact.
        related_finding: Title of the related finding, if any.
    """
    action: str = Field(description="The recommended action.")
    priority: str = Field(
        default="Medium",
        description="Priority level — Low, Medium, High, Urgent."
    )
    reason: str = Field(
        default="",
        description="Data-backed reason for the recommendation."
    )
    expected_impact: Optional[str] = Field(
        default=None,
        description="Expected business impact if actioned."
    )
    related_finding: Optional[str] = Field(
        default=None,
        description="Title of the related finding."
    )


# ---------------------------------------------------------------------------
# Agent Error (response-level)
# ---------------------------------------------------------------------------

class AgentError(BaseModel):
    """
    Structured representation of an error within an agent response.
    This is for serialisation into the response — not a Python exception.

    Attributes:
        error_type: Classification of the error.
        message: Human-readable error message.
        retryable: Whether the caller should retry.
        agent_name: Agent where the error occurred.
        operation: Operation that failed.
    """
    error_type: str = Field(description="Classification — e.g. 'ExecutionError', 'ValidationError'.")
    message: str = Field(description="Human-readable error message.")
    retryable: bool = Field(default=False)
    agent_name: Optional[str] = Field(default=None)
    operation: Optional[str] = Field(default=None)


# ---------------------------------------------------------------------------
# Execution Metadata
# ---------------------------------------------------------------------------

class ExecutionMetadata(BaseModel):
    """
    Per-agent execution metadata for observability.

    This is the agent-level metadata (distinct from the Supervisor-level
    ``ExecutionMetadata`` in ``supervisor/schemas.py`` which tracks the
    full graph execution).

    Attributes:
        request_id: Correlation identifier for the request.
        run_id: Unique identifier for this specific agent run.
        agent_name: Name of the agent.
        agent_version: Version of the agent.
        started_at: ISO timestamp when execution started.
        completed_at: ISO timestamp when execution completed.
        duration_ms: Total execution duration in milliseconds.
        tools_used: List of tool names invoked during execution.
        llm_provider: LLM provider used (e.g. 'groq', 'openai').
        llm_model: Specific model used.
        token_usage: Token usage breakdown if available.
        retry_count: Number of retries performed.
        status: Final execution status.
    """
    request_id: Optional[str] = Field(default=None)
    run_id: Optional[str] = Field(default=None)
    agent_name: Optional[str] = Field(default=None)
    agent_version: Optional[str] = Field(default=None)
    started_at: Optional[str] = Field(default=None)
    completed_at: Optional[str] = Field(default=None)
    duration_ms: float = Field(default=0.0)
    tools_used: List[str] = Field(default_factory=list)
    llm_provider: Optional[str] = Field(default=None)
    llm_model: Optional[str] = Field(default=None)
    token_usage: Optional[Dict[str, int]] = Field(default=None)
    retry_count: int = Field(default=0)
    status: str = Field(default="pending")


# ---------------------------------------------------------------------------
# Agent Response (top-level wrapper)
# ---------------------------------------------------------------------------

class AgentResponse(BaseModel):
    """
    Standardised top-level response wrapper for any AI agent.

    This model wraps domain-specific outputs (which remain in their own
    agent schemas) with consistent metadata, status tracking, and error
    propagation.  The Supervisor merger can consume ``AgentResponse``
    instances uniformly.

    Attributes:
        agent_name: Name of the agent that produced this response.
        agent_version: Version of the agent.
        status: Execution outcome — success, partial_success, failure.
        summary: Brief textual summary of the result.
        findings: Structured findings (domain-agnostic).
        recommendations: Structured recommendations.
        evidence: Top-level evidence items.
        confidence: Overall confidence score (0.0–1.0).
        domain_data: The original domain-specific response data (dict).
        metadata: Execution metadata for observability.
        errors: Structured error records, if any.
        timestamp: ISO timestamp when the response was created.
    """
    agent_name: str = Field(description="Name of the agent.")
    agent_version: str = Field(default="1.0.0", description="Version of the agent.")
    status: AgentStatus = Field(
        default=AgentStatus.SUCCESS,
        description="Execution outcome."
    )
    summary: str = Field(
        default="",
        description="Brief textual summary."
    )
    findings: List[AgentFinding] = Field(
        default_factory=list,
        description="Structured findings."
    )
    recommendations: List[Recommendation] = Field(
        default_factory=list,
        description="Structured recommendations."
    )
    evidence: List[Evidence] = Field(
        default_factory=list,
        description="Top-level evidence items."
    )
    confidence: float = Field(
        default=0.0,
        description="Overall confidence (0.0–1.0).",
        ge=0.0,
        le=1.0,
    )
    domain_data: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Original domain-specific response serialised as dict."
    )
    metadata: ExecutionMetadata = Field(
        default_factory=ExecutionMetadata,
        description="Execution metadata."
    )
    errors: List[AgentError] = Field(
        default_factory=list,
        description="Structured error records."
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO timestamp."
    )

    @field_validator("confidence", mode="before")
    @classmethod
    def _clamp_confidence(cls, v: Any) -> float:
        """Ensure confidence is always within [0.0, 1.0]."""
        try:
            val = float(v)
        except (TypeError, ValueError):
            return 0.0
        return max(0.0, min(1.0, val))
