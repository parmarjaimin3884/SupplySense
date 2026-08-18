"""
SupplySense — Shared AI Core: Exception Hierarchy
====================================================

Centralised, domain-independent exception classes used by all AI agents,
tools, the LangGraph Supervisor, and tracing utilities.

Design Principles
-----------------
* Every exception carries structured context (``agent_name``, ``tool_name``,
  ``operation``, ``request_id``, ``retryable``) so that callers can make
  informed recovery decisions.
* Exceptions are classified by *origin* (agent, tool, LLM, routing, state,
  RAG, tracing) and by *nature* (validation, configuration, execution,
  timeout, rate-limit).
* **Security**: No exception stores API keys, database passwords, or other
  secrets.  ``__repr__`` and ``__str__`` only emit safe metadata.

Hierarchy
---------
::

    AIError
    ├── AgentError
    │   ├── AgentExecutionError
    │   └── AgentValidationError
    ├── ToolError
    │   └── ToolExecutionError
    ├── LLMError
    │   ├── LLMConfigurationError
    │   ├── LLMRateLimitError
    │   └── LLMTimeoutError
    ├── RoutingError
    ├── StateError
    ├── ResponseValidationError
    ├── RAGError
    └── TracingError
"""

from __future__ import annotations

from typing import Optional


# ---------------------------------------------------------------------------
# Base
# ---------------------------------------------------------------------------

class AIError(Exception):
    """
    Root exception for all AI-related errors in SupplySense.

    Attributes:
        message: Human-readable description of the error.
        agent_name: Name of the agent where the error originated (if applicable).
        tool_name: Name of the tool involved (if applicable).
        operation: High-level operation that was being performed.
        request_id: Correlation identifier for the current request/run.
        original_exception: The underlying exception, if this wraps one.
        retryable: Whether the caller should consider retrying the operation.
    """

    def __init__(
        self,
        message: str = "An AI error occurred.",
        *,
        agent_name: Optional[str] = None,
        tool_name: Optional[str] = None,
        operation: Optional[str] = None,
        request_id: Optional[str] = None,
        original_exception: Optional[BaseException] = None,
        retryable: bool = False,
    ) -> None:
        self.message = message
        self.agent_name = agent_name
        self.tool_name = tool_name
        self.operation = operation
        self.request_id = request_id
        self.original_exception = original_exception
        self.retryable = retryable
        super().__init__(self.message)

    def __repr__(self) -> str:
        parts = [f"{self.__class__.__name__}({self.message!r}"]
        if self.agent_name:
            parts.append(f", agent_name={self.agent_name!r}")
        if self.tool_name:
            parts.append(f", tool_name={self.tool_name!r}")
        if self.operation:
            parts.append(f", operation={self.operation!r}")
        if self.request_id:
            parts.append(f", request_id={self.request_id!r}")
        parts.append(f", retryable={self.retryable}")
        parts.append(")")
        return "".join(parts)

    def to_dict(self) -> dict:
        """Serialise error context to a plain dictionary (safe for logging)."""
        return {
            "error_type": self.__class__.__name__,
            "message": self.message,
            "agent_name": self.agent_name,
            "tool_name": self.tool_name,
            "operation": self.operation,
            "request_id": self.request_id,
            "retryable": self.retryable,
            "original_error": (
                str(self.original_exception)
                if self.original_exception
                else None
            ),
        }


# ---------------------------------------------------------------------------
# Agent Errors
# ---------------------------------------------------------------------------

class AgentError(AIError):
    """Base exception for errors originating within an AI agent."""

    def __init__(
        self,
        message: str = "An agent error occurred.",
        *,
        agent_name: Optional[str] = None,
        **kwargs,
    ) -> None:
        super().__init__(message, agent_name=agent_name, **kwargs)


class AgentExecutionError(AgentError):
    """Raised when an agent's ``process()`` or ``execute()`` method fails."""

    def __init__(
        self,
        message: str = "Agent execution failed.",
        **kwargs,
    ) -> None:
        super().__init__(message, **kwargs)


class AgentValidationError(AgentError):
    """Raised when agent input validation fails."""

    def __init__(
        self,
        message: str = "Agent input validation failed.",
        **kwargs,
    ) -> None:
        super().__init__(message, retryable=False, **kwargs)


# ---------------------------------------------------------------------------
# Tool Errors
# ---------------------------------------------------------------------------

class ToolError(AIError):
    """Base exception for errors originating from AI tool layer functions."""

    def __init__(
        self,
        message: str = "A tool error occurred.",
        *,
        tool_name: Optional[str] = None,
        **kwargs,
    ) -> None:
        super().__init__(message, tool_name=tool_name, **kwargs)


class ToolExecutionError(ToolError):
    """Raised when a registered tool fails during execution."""

    def __init__(
        self,
        message: str = "Tool execution failed.",
        **kwargs,
    ) -> None:
        super().__init__(message, retryable=True, **kwargs)


# ---------------------------------------------------------------------------
# LLM Errors
# ---------------------------------------------------------------------------

class LLMError(AIError):
    """Base exception for errors related to LLM invocation."""

    def __init__(
        self,
        message: str = "An LLM error occurred.",
        **kwargs,
    ) -> None:
        super().__init__(message, **kwargs)


class LLMConfigurationError(LLMError):
    """Raised when LLM provider configuration is invalid or missing."""

    def __init__(
        self,
        message: str = "LLM configuration error.",
        **kwargs,
    ) -> None:
        super().__init__(message, retryable=False, **kwargs)


class LLMRateLimitError(LLMError):
    """Raised when the LLM provider returns a rate-limit / quota error."""

    def __init__(
        self,
        message: str = "LLM rate limit exceeded.",
        **kwargs,
    ) -> None:
        super().__init__(message, retryable=True, **kwargs)


class LLMTimeoutError(LLMError):
    """Raised when an LLM request exceeds the configured timeout."""

    def __init__(
        self,
        message: str = "LLM request timed out.",
        **kwargs,
    ) -> None:
        super().__init__(message, retryable=True, **kwargs)


# ---------------------------------------------------------------------------
# Routing, State, Response, RAG, Tracing
# ---------------------------------------------------------------------------

class RoutingError(AIError):
    """Raised when intent classification or agent routing fails."""

    def __init__(
        self,
        message: str = "Routing error occurred.",
        **kwargs,
    ) -> None:
        super().__init__(message, **kwargs)


class StateError(AIError):
    """Raised when there is an issue with agent or supervisor state management."""

    def __init__(
        self,
        message: str = "State management error.",
        **kwargs,
    ) -> None:
        super().__init__(message, **kwargs)


class ResponseValidationError(AIError):
    """Raised when an agent response fails Pydantic validation."""

    def __init__(
        self,
        message: str = "Response validation failed.",
        **kwargs,
    ) -> None:
        super().__init__(message, retryable=False, **kwargs)


class RAGError(AIError):
    """Raised when retrieval-augmented generation encounters an error."""

    def __init__(
        self,
        message: str = "RAG error occurred.",
        **kwargs,
    ) -> None:
        super().__init__(message, **kwargs)


class TracingError(AIError):
    """Raised when LangSmith tracing operations fail (non-fatal)."""

    def __init__(
        self,
        message: str = "Tracing error occurred.",
        **kwargs,
    ) -> None:
        # Tracing errors should never block execution
        super().__init__(message, retryable=False, **kwargs)
