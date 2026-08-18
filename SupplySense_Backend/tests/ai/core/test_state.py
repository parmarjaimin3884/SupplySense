"""
Tests for backend.app.ai.core.state
"""

import pytest

from backend.app.ai.core.state import BaseAgentState, BaseExecutionMetadata


# ---------------------------------------------------------------------------
# BaseExecutionMetadata
# ---------------------------------------------------------------------------

class TestBaseExecutionMetadata:

    def test_defaults(self):
        m = BaseExecutionMetadata()
        assert m.duration_ms == 0.0
        assert m.tokens_used == 0
        assert m.tools_called == 0
        assert m.agents_received == 0
        assert m.retrieval_method is None
        assert m.documents_retrieved == 0

    def test_mutable_fields(self):
        m = BaseExecutionMetadata()
        m.duration_ms = 512.3
        m.tools_called = 3
        assert m.duration_ms == 512.3
        assert m.tools_called == 3


# ---------------------------------------------------------------------------
# BaseAgentState — Construction
# ---------------------------------------------------------------------------

class TestBaseAgentStateConstruction:

    def test_minimal_construction(self):
        s = BaseAgentState(user_question="What is the stock level?")
        assert s.user_question == "What is the stock level?"
        assert s.conversation_history == []
        assert s.detected_intent is None
        assert s.selected_tools == []
        assert s.tool_outputs == {}
        assert s.confidence_score == 0.0
        assert s.final_response is None
        assert s.error is None

    def test_with_conversation_history(self):
        history = [{"role": "user", "content": "hello"}]
        s = BaseAgentState(
            user_question="follow up",
            conversation_history=history,
        )
        assert len(s.conversation_history) == 1


# ---------------------------------------------------------------------------
# BaseAgentState — record_tool_call
# ---------------------------------------------------------------------------

class TestRecordToolCall:

    def test_single_tool_call(self):
        s = BaseAgentState(user_question="test")
        s.record_tool_call("get_inventory", {"data": [1, 2, 3]})

        assert "get_inventory" in s.selected_tools
        assert s.tool_outputs["get_inventory"] == {"data": [1, 2, 3]}
        assert s.execution_metadata.tools_called == 1

    def test_multiple_tool_calls(self):
        s = BaseAgentState(user_question="test")
        s.record_tool_call("tool_a", "output_a")
        s.record_tool_call("tool_b", "output_b")
        s.record_tool_call("tool_c", "output_c")

        assert len(s.selected_tools) == 3
        assert s.execution_metadata.tools_called == 3

    def test_same_tool_twice_overwrites_output(self):
        s = BaseAgentState(user_question="test")
        s.record_tool_call("get_stock", {"qty": 10})
        s.record_tool_call("get_stock", {"qty": 20})

        # Tool name appears twice in selected_tools (audit trail)
        assert s.selected_tools.count("get_stock") == 2
        # Output is overwritten (last call wins)
        assert s.tool_outputs["get_stock"] == {"qty": 20}
        assert s.execution_metadata.tools_called == 2


# ---------------------------------------------------------------------------
# BaseAgentState — record_agent_input
# ---------------------------------------------------------------------------

class TestRecordAgentInput:

    def test_record_upstream_agent(self):
        s = BaseAgentState(user_question="test")
        s.record_agent_input("inventory", {"summary": "healthy"})

        assert s.tool_outputs["inventory"] == {"summary": "healthy"}
        assert s.execution_metadata.agents_received == 1

    def test_multiple_upstream_agents(self):
        s = BaseAgentState(user_question="test")
        s.record_agent_input("inventory", {"summary": "ok"})
        s.record_agent_input("shipment", {"summary": "delayed"})
        s.record_agent_input("supplier", {"summary": "risky"})

        assert s.execution_metadata.agents_received == 3


# ---------------------------------------------------------------------------
# BaseAgentState — record_retrieval
# ---------------------------------------------------------------------------

class TestRecordRetrieval:

    def test_record_retrieval(self):
        s = BaseAgentState(user_question="test")
        chunks = [
            {"content": "policy text", "source": "doc.pdf"},
            {"content": "sop text", "source": "sop.pdf"},
        ]
        s.record_retrieval(chunks, method="similarity")

        assert s.tool_outputs["retrieved_chunks"] == chunks
        assert s.execution_metadata.documents_retrieved == 2
        assert s.execution_metadata.retrieval_method == "similarity"


# ---------------------------------------------------------------------------
# BaseAgentState — Serialisation
# ---------------------------------------------------------------------------

class TestBaseAgentStateSerialization:

    def test_model_dump(self):
        s = BaseAgentState(user_question="test")
        s.record_tool_call("tool_a", {"result": True})
        d = s.model_dump()

        assert d["user_question"] == "test"
        assert "tool_a" in d["selected_tools"]
        assert d["execution_metadata"]["tools_called"] == 1

    def test_round_trip(self):
        s = BaseAgentState(user_question="test question")
        s.record_tool_call("my_tool", "my_output")
        s.error = "something went wrong"

        d = s.model_dump()
        restored = BaseAgentState(**d)

        assert restored.user_question == "test question"
        assert restored.error == "something went wrong"
        assert restored.execution_metadata.tools_called == 1


# ---------------------------------------------------------------------------
# Subclassing
# ---------------------------------------------------------------------------

class TestSubclassing:
    """Verify that BaseAgentState can be subclassed with domain fields."""

    def test_subclass_with_extra_fields(self):
        class InventoryState(BaseAgentState):
            inventory_status: str = "Unknown"
            low_stock_count: int = 0

        s = InventoryState(user_question="stock check")
        s.inventory_status = "Healthy"
        s.low_stock_count = 5
        s.record_tool_call("get_low_stock", {"items": 5})

        assert s.inventory_status == "Healthy"
        assert s.low_stock_count == 5
        assert s.execution_metadata.tools_called == 1
