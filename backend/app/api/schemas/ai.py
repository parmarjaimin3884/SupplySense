"""
SupplySense — API Schemas for AI Manager Assistant
===================================================

Pydantic request and response models for HTTP API communication with the
SupplySense Manager Assistant & LangGraph Supervisor.
"""

import uuid
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator
from backend.app.ai.supervisor.schemas import SupervisorResponse, IntentCategory


class AIChatRequest(BaseModel):
    """
    HTTP Request payload for manager natural-language supply chain queries.
    """
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Manager natural-language supply chain query string.",
        examples=["Give me MacBook quantity"],
    )
    conversation_id: Optional[str] = Field(
        default=None,
        description="Optional conversation identifier for turn tracking.",
        examples=["conv_12345"],
    )
    request_id: Optional[str] = Field(
        default=None,
        description="Optional client-provided correlation ID. Generated if omitted.",
        examples=["req_67890"],
    )
    user_id: Optional[str] = Field(
        default=None,
        description="Optional user identifier.",
        examples=["mgr_john_doe"],
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Optional request metadata context.",
    )

    @field_validator("message")
    @classmethod
    def validate_message_not_empty(cls, value: str) -> str:
        """Ensures query message is not empty or whitespace-only."""
        stripped = value.strip()
        if not stripped:
            raise ValueError("Message cannot be empty or whitespace-only.")
        return stripped


class AIChatErrorDetail(BaseModel):
    """Structured error context within an error response."""
    code: str = Field(description="Machine-readable error code.", examples=["SERVICE_UNAVAILABLE"])
    message: str = Field(description="Human-readable safe error message.", examples=["The AI service is temporarily unavailable."])
    details: Optional[Dict[str, Any]] = Field(default=None, description="Safe optional error metadata context.")


class AIChatErrorResponse(BaseModel):
    """Standardized HTTP Error Response payload."""
    status: str = Field(default="error", description="Response status indicator.")
    request_id: str = Field(description="Correlation ID for tracing.")
    error: AIChatErrorDetail = Field(description="Error details payload.")


class AIChatResponse(BaseModel):
    """
    Structured HTTP response returned by the SupplySense Manager Assistant.
    Serializes and exposes fields from the internal SupervisorResponse object.
    """
    status: str = Field(
        default="success",
        description="Execution status: 'success', 'unsupported_workflow', 'clarification_needed', or 'error'.",
        examples=["success"],
    )
    request_id: str = Field(
        description="Unique correlation request ID for tracing and observability.",
        examples=["9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"],
    )
    query: str = Field(
        description="Original user query.",
        examples=["Give me MacBook quantity"],
    )
    query_type: str = Field(
        description="Execution path: 'direct_tool', 'agent', 'rag', 'unsupported_hybrid', or 'unknown'.",
        examples=["direct_tool"],
    )
    intent: str = Field(
        description="Classified intent or intent category string.",
        examples=["inventory_lookup"],
    )
    answer: str = Field(
        description="Detailed response answer synthesizing results across tools, agents, or knowledge documents.",
        examples=["There are 150 units of MacBook Pro available in Warehouse A."],
    )
    summary: Optional[str] = Field(
        default=None,
        description="Comprehensive executive summary.",
    )
    agent_used: Optional[str] = Field(
        default=None,
        description="Primary agent invoked if single-agent execution.",
    )
    tool_used: Optional[str] = Field(
        default=None,
        description="Direct tool invoked if query_type is 'direct_tool'.",
        examples=["search_products"],
    )
    selected_agents: List[str] = Field(
        default_factory=list,
        description="List of agents executed during request processing.",
    )
    findings: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Key findings returned by executed agents.",
    )
    recommendations: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Consolidated recommendations.",
    )
    citations_and_sources: List[str] = Field(
        default_factory=list,
        description="Document sources cited (if RAG or knowledge agent invoked).",
    )
    confidence: float = Field(
        default=1.0,
        description="Overall confidence score (0.0 to 1.0).",
        ge=0.0,
        le=1.0,
    )
    execution_metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Execution duration, token usage, and node latency metrics.",
    )
    raw_agent_outputs: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Structured outputs from invoked agents or direct tools.",
    )

    @classmethod
    def from_supervisor_response(
        cls,
        response: SupervisorResponse,
        request_id: str,
    ) -> "AIChatResponse":
        """
        Factory helper to convert an internal SupervisorResponse into an HTTP AIChatResponse.
        """
        intent_str = (
            response.intent.value
            if isinstance(response.intent, IntentCategory)
            else str(response.intent)
        )

        findings_list = [
            f.model_dump() if hasattr(f, "model_dump") else dict(f)
            for f in response.findings
        ]
        recs_list = [
            r.model_dump() if hasattr(r, "model_dump") else dict(r)
            for r in response.recommendations
        ]
        exec_meta = (
            response.execution_metadata.model_dump()
            if hasattr(response.execution_metadata, "model_dump")
            else dict(response.execution_metadata or {})
        )

        return cls(
            status=response.status,
            request_id=request_id,
            query=response.query,
            query_type=response.query_type,
            intent=intent_str,
            answer=response.answer,
            summary=response.summary,
            agent_used=response.agent_used,
            tool_used=response.tool_used,
            selected_agents=response.selected_agents or [],
            findings=findings_list,
            recommendations=recs_list,
            citations_and_sources=response.citations_and_sources or [],
            confidence=response.confidence,
            execution_metadata=exec_meta,
            raw_agent_outputs=response.raw_agent_outputs or {},
        )
