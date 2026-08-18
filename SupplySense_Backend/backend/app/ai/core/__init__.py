"""
SupplySense — Shared AI Core Package
=======================================

Provides common infrastructure for all AI agents and the LangGraph Supervisor:

* ``BaseAgent`` — abstract base class with standard execution lifecycle
* ``AgentResponse`` / ``AgentFinding`` / ``Recommendation`` — standardised response models
* ``BaseAgentState`` / ``BaseExecutionMetadata`` — shared state models
* ``ToolRegistry`` / ``tool_registry`` — centralised tool registration
* ``AIError`` hierarchy — structured exception classes
* Tracing utilities — ``traced_agent_execution``, ``traced_tool_execution``

Existing bridge exports (backward-compatible):

* ``create_llm_instance`` — delegates to ``backend.app.ai.llm.get_llm()``
* ``create_embeddings_instance`` — delegates to ``backend.app.ai.embeddings``
* ``create_vectorstore_instance`` — delegates to ``backend.app.ai.vectorstore``
"""

# --- Existing bridge exports (preserved for backward compatibility) ---
from backend.app.ai.core.llm_factory import create_llm_instance
from backend.app.ai.core.embeddings import create_embeddings_instance
from backend.app.ai.core.qdrant import create_vectorstore_instance

# --- Shared AI Core exports ---

# Base Agent
from backend.app.ai.core.base_agent import BaseAgent

# Response Models
from backend.app.ai.core.response_models import (
    AgentResponse,
    AgentFinding,
    Recommendation,
    Evidence,
    ExecutionMetadata,
    AgentError as AgentErrorModel,
    AgentStatus,
    Severity,
    Priority,
)

# State Models
from backend.app.ai.core.state import (
    BaseAgentState,
    BaseExecutionMetadata,
)

# Tool Registry
from backend.app.ai.core.tool_registry import (
    ToolRegistry,
    tool_registry,
)

# Exceptions
from backend.app.ai.core.exceptions import (
    AIError,
    AgentError,
    AgentExecutionError,
    AgentValidationError,
    ToolError,
    ToolExecutionError,
    LLMError,
    LLMConfigurationError,
    LLMRateLimitError,
    LLMTimeoutError,
    RoutingError,
    StateError,
    ResponseValidationError,
    RAGError,
    TracingError,
)

# Tracing
from backend.app.ai.core.tracing import (
    traced_agent_execution,
    traced_tool_execution,
    traced_supervisor_execution,
    create_trace_metadata,
    TraceContext,
)


__all__ = [
    # Existing bridges
    "create_llm_instance",
    "create_embeddings_instance",
    "create_vectorstore_instance",
    # Base Agent
    "BaseAgent",
    # Response Models
    "AgentResponse",
    "AgentFinding",
    "Recommendation",
    "Evidence",
    "ExecutionMetadata",
    "AgentErrorModel",
    "AgentStatus",
    "Severity",
    "Priority",
    # State
    "BaseAgentState",
    "BaseExecutionMetadata",
    # Tool Registry
    "ToolRegistry",
    "tool_registry",
    # Exceptions
    "AIError",
    "AgentError",
    "AgentExecutionError",
    "AgentValidationError",
    "ToolError",
    "ToolExecutionError",
    "LLMError",
    "LLMConfigurationError",
    "LLMRateLimitError",
    "LLMTimeoutError",
    "RoutingError",
    "StateError",
    "ResponseValidationError",
    "RAGError",
    "TracingError",
    # Tracing
    "traced_agent_execution",
    "traced_tool_execution",
    "traced_supervisor_execution",
    "create_trace_metadata",
    "TraceContext",
]
