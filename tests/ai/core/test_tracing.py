"""
Tests for backend.app.ai.core.tracing
"""

import pytest
import time

from backend.app.ai.core.tracing import (
    create_trace_metadata,
    traced_agent_execution,
    traced_tool_execution,
    traced_supervisor_execution,
    TraceContext,
)


# ---------------------------------------------------------------------------
# create_trace_metadata
# ---------------------------------------------------------------------------

class TestCreateTraceMetadata:

    def test_minimal_metadata(self):
        m = create_trace_metadata()
        assert "project" in m
        # Only project should be present when no args provided
        assert "agent_name" not in m

    def test_full_metadata(self):
        m = create_trace_metadata(
            agent_name="inventory",
            agent_version="1.0.0",
            request_id="req-1",
            run_id="run-1",
            intent="Inventory",
            selected_agents=["inventory", "shipment"],
            tools_used=["get_stock"],
            llm_provider="groq",
            llm_model="llama-3.3-70b-versatile",
            status="success",
            duration_ms=512.0,
        )
        assert m["agent_name"] == "inventory"
        assert m["llm_provider"] == "groq"
        assert m["duration_ms"] == 512.0
        assert "project" in m

    def test_none_values_excluded(self):
        m = create_trace_metadata(agent_name="test", error_type=None)
        assert "agent_name" in m
        assert "error_type" not in m


# ---------------------------------------------------------------------------
# TraceContext
# ---------------------------------------------------------------------------

class TestTraceContext:

    def test_auto_populated_fields(self):
        ctx = TraceContext()
        assert "request_id" in ctx
        assert "run_id" in ctx
        assert "started_at" in ctx
        assert "start_time" in ctx

    def test_custom_request_id(self):
        ctx = TraceContext(request_id="custom-123")
        assert ctx["request_id"] == "custom-123"

    def test_is_dict_subclass(self):
        ctx = TraceContext()
        assert isinstance(ctx, dict)

    def test_mutable(self):
        ctx = TraceContext()
        ctx["tools_used"] = ["get_stock"]
        assert ctx["tools_used"] == ["get_stock"]


# ---------------------------------------------------------------------------
# traced_agent_execution
# ---------------------------------------------------------------------------

class TestTracedAgentExecution:

    @pytest.mark.asyncio
    async def test_success_path(self):
        async with traced_agent_execution(
            agent_name="inventory",
            agent_version="2.0.0",
            request_id="req-42",
        ) as ctx:
            # Simulate some work
            ctx["tools_used"] = ["get_inventory"]

        assert ctx["agent_name"] == "inventory"
        assert ctx["agent_version"] == "2.0.0"
        assert ctx["request_id"] == "req-42"
        assert ctx["status"] == "success"
        assert ctx["duration_ms"] >= 0
        assert "completed_at" in ctx

    @pytest.mark.asyncio
    async def test_error_path(self):
        with pytest.raises(ValueError, match="boom"):
            async with traced_agent_execution(
                agent_name="shipment"
            ) as ctx:
                raise ValueError("boom")

        assert ctx["status"] == "error"
        assert ctx["error_type"] == "ValueError"
        assert ctx["error_message"] == "boom"
        assert ctx["duration_ms"] >= 0

    @pytest.mark.asyncio
    async def test_auto_generated_request_id(self):
        async with traced_agent_execution(agent_name="test") as ctx:
            pass
        assert len(ctx["request_id"]) > 0
        assert len(ctx["run_id"]) > 0


# ---------------------------------------------------------------------------
# traced_tool_execution
# ---------------------------------------------------------------------------

class TestTracedToolExecution:

    @pytest.mark.asyncio
    async def test_success(self):
        async with traced_tool_execution(
            tool_name="get_stock",
            agent_name="inventory",
        ) as ctx:
            pass

        assert ctx["tool_name"] == "get_stock"
        assert ctx["agent_name"] == "inventory"
        assert ctx["status"] == "success"

    @pytest.mark.asyncio
    async def test_error(self):
        with pytest.raises(RuntimeError):
            async with traced_tool_execution(
                tool_name="broken_tool"
            ) as ctx:
                raise RuntimeError("db down")

        assert ctx["status"] == "error"
        assert ctx["error_type"] == "RuntimeError"


# ---------------------------------------------------------------------------
# traced_supervisor_execution
# ---------------------------------------------------------------------------

class TestTracedSupervisorExecution:

    @pytest.mark.asyncio
    async def test_success(self):
        async with traced_supervisor_execution(
            request_id="sup-1",
            intent="Inventory",
            selected_agents=["inventory", "risk"],
        ) as ctx:
            pass

        assert ctx["component"] == "supervisor"
        assert ctx["intent"] == "Inventory"
        assert ctx["selected_agents"] == ["inventory", "risk"]
        assert ctx["status"] == "success"

    @pytest.mark.asyncio
    async def test_error(self):
        with pytest.raises(Exception):
            async with traced_supervisor_execution() as ctx:
                raise Exception("graph failure")

        assert ctx["status"] == "error"
