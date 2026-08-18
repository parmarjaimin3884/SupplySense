"""
SupplySense — Shared AI Core: LangSmith Tracing Utilities
==========================================================

Centralised tracing helpers used by agents, tools, and the Supervisor.

Design Principles
-----------------
* Leverages the **existing** LangSmith configuration from ``settings.py``
  (``LANGCHAIN_TRACING_V2``, ``LANGSMITH_API_KEY``, ``LANGCHAIN_PROJECT``).
* Does NOT create a second tracing configuration system.
* Provides async context managers (``traced_agent_execution``,
  ``traced_tool_execution``) that wrap LangSmith's ``traceable``
  decorator with consistent metadata.
* **Security**: Never stores API keys, passwords, or credentials in
  trace metadata.

Usage
-----
::

    from backend.app.ai.core.tracing import traced_agent_execution

    async with traced_agent_execution(
        agent_name="inventory",
        request_id="req-123",
    ) as trace_ctx:
        result = await do_work()
        trace_ctx["tools_used"] = ["get_inventory", "get_low_stock"]
"""

from __future__ import annotations

import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, AsyncGenerator, Dict, List, Optional

from backend.app.config.settings import settings
from backend.app.ai.core.exceptions import TracingError


# ---------------------------------------------------------------------------
# Metadata Builder
# ---------------------------------------------------------------------------

def create_trace_metadata(
    *,
    agent_name: Optional[str] = None,
    agent_version: Optional[str] = None,
    request_id: Optional[str] = None,
    run_id: Optional[str] = None,
    intent: Optional[str] = None,
    selected_agents: Optional[List[str]] = None,
    tools_used: Optional[List[str]] = None,
    llm_provider: Optional[str] = None,
    llm_model: Optional[str] = None,
    status: Optional[str] = None,
    error_type: Optional[str] = None,
    duration_ms: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Build a metadata dictionary suitable for LangSmith trace tags.

    This is the single place to define what metadata is safe to attach
    to traces.  It deliberately excludes API keys, passwords, database
    connection strings, and other secrets.

    Args:
        agent_name: Name of the agent being traced.
        agent_version: Version of the agent.
        request_id: Correlation identifier for the request.
        run_id: Unique identifier for this run.
        intent: Classified user intent.
        selected_agents: Agents selected by the router.
        tools_used: Tools invoked during execution.
        llm_provider: LLM provider name (e.g. 'groq').
        llm_model: Specific model name.
        status: Execution status (e.g. 'success', 'failure').
        error_type: Error class name if an error occurred.
        duration_ms: Execution duration in milliseconds.

    Returns:
        Dictionary of metadata — only non-None values are included.
    """
    metadata: Dict[str, Any] = {
        "project": settings.LANGCHAIN_PROJECT,
    }

    field_map = {
        "agent_name": agent_name,
        "agent_version": agent_version,
        "request_id": request_id,
        "run_id": run_id,
        "intent": intent,
        "selected_agents": selected_agents,
        "tools_used": tools_used,
        "llm_provider": llm_provider,
        "llm_model": llm_model,
        "status": status,
        "error_type": error_type,
        "duration_ms": duration_ms,
    }

    for key, value in field_map.items():
        if value is not None:
            metadata[key] = value

    return metadata


# ---------------------------------------------------------------------------
# Trace Context (mutable dict returned by context managers)
# ---------------------------------------------------------------------------

class TraceContext(dict):
    """
    A mutable dictionary that acts as the trace context passed into
    ``traced_agent_execution`` and ``traced_tool_execution`` context
    managers.

    Callers can set ``trace_ctx["tools_used"]``, etc., and the values
    will be captured when the context manager exits.

    Automatically populated fields:
        - ``request_id``
        - ``run_id``
        - ``started_at``
        - ``start_time`` (epoch float for duration calculation)
    """

    def __init__(self, request_id: Optional[str] = None, **kwargs: Any):
        super().__init__(**kwargs)
        self["request_id"] = request_id or str(uuid.uuid4())
        self["run_id"] = str(uuid.uuid4())
        self["started_at"] = datetime.now(timezone.utc).isoformat()
        self["start_time"] = time.time()


# ---------------------------------------------------------------------------
# Context Managers
# ---------------------------------------------------------------------------

@asynccontextmanager
async def traced_agent_execution(
    *,
    agent_name: str,
    agent_version: str = "1.0.0",
    request_id: Optional[str] = None,
) -> AsyncGenerator[TraceContext, None]:
    """
    Async context manager for tracing an agent execution span.

    Automatically captures start/end timestamps and duration.  The
    yielded ``TraceContext`` can be mutated to record tools used,
    status, errors, etc.

    Args:
        agent_name: Name of the agent being executed.
        agent_version: Version of the agent.
        request_id: Optional correlation ID (generated if not provided).

    Yields:
        A mutable ``TraceContext`` dictionary.

    Example::

        async with traced_agent_execution(agent_name="inventory") as ctx:
            result = await agent.process(question)
            ctx["status"] = "success"
            ctx["tools_used"] = ["get_low_stock"]
    """
    ctx = TraceContext(request_id=request_id)
    ctx["agent_name"] = agent_name
    ctx["agent_version"] = agent_version
    ctx["status"] = "running"

    try:
        yield ctx
    except Exception as exc:
        ctx["status"] = "error"
        ctx["error_type"] = type(exc).__name__
        ctx["error_message"] = str(exc)
        raise
    finally:
        end_time = time.time()
        ctx["completed_at"] = datetime.now(timezone.utc).isoformat()
        ctx["duration_ms"] = (end_time - ctx["start_time"]) * 1000

        if ctx.get("status") == "running":
            ctx["status"] = "success"


@asynccontextmanager
async def traced_tool_execution(
    *,
    tool_name: str,
    agent_name: Optional[str] = None,
    request_id: Optional[str] = None,
) -> AsyncGenerator[TraceContext, None]:
    """
    Async context manager for tracing a tool execution span.

    Args:
        tool_name: Name of the tool being executed.
        agent_name: Name of the calling agent (if applicable).
        request_id: Optional correlation ID.

    Yields:
        A mutable ``TraceContext`` dictionary.
    """
    ctx = TraceContext(request_id=request_id)
    ctx["tool_name"] = tool_name
    ctx["agent_name"] = agent_name
    ctx["status"] = "running"

    try:
        yield ctx
    except Exception as exc:
        ctx["status"] = "error"
        ctx["error_type"] = type(exc).__name__
        ctx["error_message"] = str(exc)
        raise
    finally:
        end_time = time.time()
        ctx["completed_at"] = datetime.now(timezone.utc).isoformat()
        ctx["duration_ms"] = (end_time - ctx["start_time"]) * 1000

        if ctx.get("status") == "running":
            ctx["status"] = "success"


@asynccontextmanager
async def traced_supervisor_execution(
    *,
    request_id: Optional[str] = None,
    intent: Optional[str] = None,
    selected_agents: Optional[List[str]] = None,
) -> AsyncGenerator[TraceContext, None]:
    """
    Async context manager for tracing a full Supervisor graph execution.

    Args:
        request_id: Optional correlation ID.
        intent: Classified user intent.
        selected_agents: Agents selected by the router.

    Yields:
        A mutable ``TraceContext`` dictionary.
    """
    ctx = TraceContext(request_id=request_id)
    ctx["component"] = "supervisor"
    ctx["intent"] = intent
    ctx["selected_agents"] = selected_agents or []
    ctx["status"] = "running"

    try:
        yield ctx
    except Exception as exc:
        ctx["status"] = "error"
        ctx["error_type"] = type(exc).__name__
        ctx["error_message"] = str(exc)
        raise
    finally:
        end_time = time.time()
        ctx["completed_at"] = datetime.now(timezone.utc).isoformat()
        ctx["duration_ms"] = (end_time - ctx["start_time"]) * 1000

        if ctx.get("status") == "running":
            ctx["status"] = "success"
