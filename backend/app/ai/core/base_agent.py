"""
SupplySense — Shared AI Core: Base Agent
==========================================

Abstract base class that provides common infrastructure for all
SupplySense AI agents.

Design Principles
-----------------
* **Domain-independent** — contains zero supply-chain business logic.
* **Uses existing LLM factory** — calls ``get_llm()`` from
  ``backend.app.ai.llm`` and never instantiates ``ChatGroq``/``ChatOpenAI``
  directly.
* **Uses project Loguru logger** — not stdlib ``logging``.
* **Template method pattern** — ``execute()`` defines the standard lifecycle
  (validate → trace → process → format → handle errors) while subclasses
  implement ``process()``.
* **Backward-compatible** — existing agents are *not required* to inherit
  from ``BaseAgent``.  They can adopt it incrementally.

Execution Lifecycle
-------------------
::

    Input
      │
      ▼
    validate_input()
      │
      ▼
    Tracing Start (traced_agent_execution)
      │
      ▼
    process()          ← subclass implements this
      │
      ▼
    format_response()
      │
      ▼
    Tracing End
      │
      ▼
    AgentResponse

On error:
::

    process() raises → handle_error() → AgentResponse(status=failure)

Usage
-----
::

    from backend.app.ai.core.base_agent import BaseAgent

    class InventoryAgent(BaseAgent):
        name = "inventory"
        description = "Evaluates stock levels and inventory health."

        async def process(self, user_question: str, **kwargs):
            # domain-specific logic here
            return {"summary": "All stock healthy", "confidence": 0.95}
"""

from __future__ import annotations

import abc
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from langchain_core.language_models.chat_models import BaseChatModel

from backend.app.ai.llm import get_llm
from backend.app.ai.core.exceptions import (
    AgentExecutionError,
    AgentValidationError,
)
from backend.app.ai.core.response_models import (
    AgentResponse,
    AgentStatus,
    AgentError as AgentErrorModel,
    ExecutionMetadata,
)
from backend.app.ai.core.tracing import traced_agent_execution
from backend.app.config.settings import settings

# Use the project's Loguru logger — not stdlib logging
from backend.app.utils.logger import logger


class BaseAgent(abc.ABC):
    """
    Abstract base class providing common infrastructure for SupplySense
    AI agents.

    Subclasses **must** implement:
        ``process(user_question, **kwargs)`` — domain-specific logic.

    Subclasses **may** override:
        ``validate_input(user_question)`` — additional input checks.
        ``format_response(result, trace_ctx)`` — custom response building.
        ``handle_error(exception, trace_ctx)`` — custom error handling.

    Attributes:
        name: Unique agent identifier (e.g. 'inventory', 'shipment').
        version: Semantic version string.
        description: Brief description of the agent's purpose.
        llm: The LangChain ``BaseChatModel`` instance obtained from the
             existing LLM factory.
    """

    # Subclasses should set these as class attributes or in __init__
    name: str = "base"
    version: str = "1.0.0"
    description: str = ""

    def __init__(
        self,
        *,
        name: Optional[str] = None,
        version: Optional[str] = None,
        description: Optional[str] = None,
        llm: Optional[BaseChatModel] = None,
    ) -> None:
        """
        Initialise the agent with optional overrides.

        Args:
            name: Override the agent name.
            version: Override the agent version.
            description: Override the agent description.
            llm: Provide a specific LLM instance.  If ``None``, the
                 existing ``get_llm()`` factory is used.
        """
        if name is not None:
            self.name = name
        if version is not None:
            self.version = version
        if description is not None:
            self.description = description

        # Obtain LLM from the existing factory — NEVER instantiate
        # ChatGroq / ChatOpenAI directly.
        self.llm: BaseChatModel = llm if llm is not None else get_llm()

        logger.info(
            f"BaseAgent initialised: name={self.name!r} "
            f"version={self.version!r} "
            f"llm_provider={settings.LLM_PROVIDER}"
        )

    # ── Public API ────────────────────────────────────────────────────

    async def execute(
        self,
        user_question: str,
        *,
        request_id: Optional[str] = None,
        **kwargs: Any,
    ) -> AgentResponse:
        """
        Execute the full agent lifecycle for a user question.

        This is the primary entry point.  It orchestrates:
        1. Input validation
        2. Tracing span creation
        3. Calling ``process()`` (subclass implementation)
        4. Response formatting
        5. Error handling

        Args:
            user_question: The user's natural-language question.
            request_id: Optional correlation identifier.
            **kwargs: Additional arguments forwarded to ``process()``.

        Returns:
            ``AgentResponse`` with standardised metadata regardless of
            success or failure.
        """
        req_id = request_id or str(uuid.uuid4())

        # 1. Validate input
        try:
            await self.validate_input(user_question)
        except AgentValidationError:
            raise
        except Exception as exc:
            raise AgentValidationError(
                message=f"Input validation failed: {exc}",
                agent_name=self.name,
                original_exception=exc,
            ) from exc

        # 2. Execute within tracing context
        async with traced_agent_execution(
            agent_name=self.name,
            agent_version=self.version,
            request_id=req_id,
        ) as trace_ctx:
            try:
                logger.info(
                    f"[{self.name}] Starting execution | "
                    f"request_id={req_id} | "
                    f"question={user_question[:100]!r}"
                )

                # 3. Process (subclass logic)
                result = await self.process(user_question, **kwargs)

                # 4. Format response
                trace_ctx["status"] = "success"
                response = self.format_response(result, trace_ctx, req_id)

                logger.info(
                    f"[{self.name}] Execution completed | "
                    f"request_id={req_id} | "
                    f"duration_ms={trace_ctx.get('duration_ms', 0):.0f} | "
                    f"confidence={response.confidence:.2f}"
                )
                return response

            except Exception as exc:
                trace_ctx["status"] = "error"
                trace_ctx["error_type"] = type(exc).__name__

                logger.error(
                    f"[{self.name}] Execution failed | "
                    f"request_id={req_id} | "
                    f"error={exc}",
                    exc_info=True,
                )

                return self.handle_error(exc, trace_ctx, req_id)

    # ── Hooks for subclasses ──────────────────────────────────────────

    async def validate_input(self, user_question: str) -> None:
        """
        Validate the user question before processing.

        Override in subclasses for additional domain-specific validation.
        The default implementation checks for empty / whitespace-only input.

        Args:
            user_question: The user's question.

        Raises:
            AgentValidationError: If validation fails.
        """
        if not user_question or not user_question.strip():
            raise AgentValidationError(
                message="User question must not be empty.",
                agent_name=self.name,
            )

    @abc.abstractmethod
    async def process(self, user_question: str, **kwargs: Any) -> Any:
        """
        Execute the agent's domain-specific logic.

        Subclasses **must** implement this method.  It receives the
        validated user question and should return the domain-specific
        result (e.g. a Pydantic model or a dict).

        Args:
            user_question: The validated user question.
            **kwargs: Additional arguments from ``execute()``.

        Returns:
            Domain-specific result object.
        """
        ...  # pragma: no cover

    def format_response(
        self,
        result: Any,
        trace_ctx: Dict[str, Any],
        request_id: str,
    ) -> AgentResponse:
        """
        Wrap the domain-specific result into a standardised ``AgentResponse``.

        Override in subclasses to extract findings, recommendations, etc.
        from the domain result.

        The default implementation serialises the result into ``domain_data``
        and attempts to extract ``summary`` and ``confidence`` fields.

        Args:
            result: The raw result from ``process()``.
            trace_ctx: The tracing context dictionary.
            request_id: Correlation identifier.

        Returns:
            Standardised ``AgentResponse``.
        """
        # Serialise the result
        domain_data: Optional[Dict[str, Any]] = None
        if result is not None:
            if hasattr(result, "model_dump"):
                domain_data = result.model_dump()
            elif hasattr(result, "dict"):
                domain_data = result.dict()
            elif isinstance(result, dict):
                domain_data = result
            else:
                domain_data = {"raw": str(result)}

        # Extract common fields from domain data
        summary = ""
        confidence = 0.0
        if domain_data:
            summary = domain_data.get("summary", domain_data.get("executive_summary", ""))
            confidence = float(domain_data.get("confidence", 0.0))

        return AgentResponse(
            agent_name=self.name,
            agent_version=self.version,
            status=AgentStatus.SUCCESS,
            summary=summary,
            confidence=confidence,
            domain_data=domain_data,
            metadata=ExecutionMetadata(
                request_id=request_id,
                run_id=trace_ctx.get("run_id"),
                agent_name=self.name,
                agent_version=self.version,
                started_at=trace_ctx.get("started_at"),
                completed_at=trace_ctx.get("completed_at"),
                duration_ms=trace_ctx.get("duration_ms", 0.0),
                tools_used=trace_ctx.get("tools_used", []),
                llm_provider=settings.LLM_PROVIDER,
                llm_model=_get_current_model(),
                status="success",
            ),
        )

    def handle_error(
        self,
        exception: Exception,
        trace_ctx: Dict[str, Any],
        request_id: str,
    ) -> AgentResponse:
        """
        Produce a structured ``AgentResponse`` from an exception.

        Override in subclasses for domain-specific fallback responses.

        Args:
            exception: The exception that was caught.
            trace_ctx: The tracing context dictionary.
            request_id: Correlation identifier.

        Returns:
            ``AgentResponse`` with ``status=failure`` and structured error.
        """
        error_model = AgentErrorModel(
            error_type=type(exception).__name__,
            message=str(exception),
            retryable=getattr(exception, "retryable", False),
            agent_name=self.name,
            operation="execute",
        )

        return AgentResponse(
            agent_name=self.name,
            agent_version=self.version,
            status=AgentStatus.FAILURE,
            summary=f"Agent '{self.name}' encountered an error during execution.",
            confidence=0.0,
            errors=[error_model],
            metadata=ExecutionMetadata(
                request_id=request_id,
                run_id=trace_ctx.get("run_id"),
                agent_name=self.name,
                agent_version=self.version,
                started_at=trace_ctx.get("started_at"),
                completed_at=trace_ctx.get("completed_at"),
                duration_ms=trace_ctx.get("duration_ms", 0.0),
                llm_provider=settings.LLM_PROVIDER,
                llm_model=_get_current_model(),
                status="error",
            ),
        )


# ---------------------------------------------------------------------------
# Helpers (module-private)
# ---------------------------------------------------------------------------

def _get_current_model() -> str:
    """Return the currently configured LLM model name from settings."""
    if settings.LLM_PROVIDER == "openai":
        return settings.OPENAI_MODEL
    return settings.GROQ_MODEL
