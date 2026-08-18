"""
Tests for backend.app.ai.core.exceptions
"""

import pytest

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


# ---------------------------------------------------------------------------
# Hierarchy
# ---------------------------------------------------------------------------

class TestExceptionHierarchy:
    """Verify the inheritance chain is correct."""

    def test_all_inherit_from_ai_error(self):
        classes = [
            AgentError, AgentExecutionError, AgentValidationError,
            ToolError, ToolExecutionError,
            LLMError, LLMConfigurationError, LLMRateLimitError, LLMTimeoutError,
            RoutingError, StateError, ResponseValidationError,
            RAGError, TracingError,
        ]
        for cls in classes:
            assert issubclass(cls, AIError), f"{cls.__name__} must inherit AIError"

    def test_agent_errors_inherit_from_agent_error(self):
        assert issubclass(AgentExecutionError, AgentError)
        assert issubclass(AgentValidationError, AgentError)

    def test_tool_errors_inherit_from_tool_error(self):
        assert issubclass(ToolExecutionError, ToolError)

    def test_llm_errors_inherit_from_llm_error(self):
        assert issubclass(LLMConfigurationError, LLMError)
        assert issubclass(LLMRateLimitError, LLMError)
        assert issubclass(LLMTimeoutError, LLMError)

    def test_ai_error_is_exception(self):
        assert issubclass(AIError, Exception)


# ---------------------------------------------------------------------------
# Context Attributes
# ---------------------------------------------------------------------------

class TestAIErrorContext:
    """Verify structured context fields."""

    def test_default_values(self):
        err = AIError("test message")
        assert err.message == "test message"
        assert err.agent_name is None
        assert err.tool_name is None
        assert err.operation is None
        assert err.request_id is None
        assert err.original_exception is None
        assert err.retryable is False

    def test_custom_context(self):
        original = ValueError("root cause")
        err = AIError(
            "test",
            agent_name="inventory",
            tool_name="get_stock",
            operation="analyze",
            request_id="req-123",
            original_exception=original,
            retryable=True,
        )
        assert err.agent_name == "inventory"
        assert err.tool_name == "get_stock"
        assert err.operation == "analyze"
        assert err.request_id == "req-123"
        assert err.original_exception is original
        assert err.retryable is True

    def test_str_is_message(self):
        err = AIError("something failed")
        assert str(err) == "something failed"

    def test_repr_includes_context(self):
        err = AIError("fail", agent_name="test_agent", retryable=True)
        r = repr(err)
        assert "AIError" in r
        assert "test_agent" in r
        assert "retryable=True" in r


# ---------------------------------------------------------------------------
# to_dict Serialisation
# ---------------------------------------------------------------------------

class TestToDictSerialisation:
    """Verify safe serialisation."""

    def test_to_dict_basic(self):
        err = AIError("oops", agent_name="inv")
        d = err.to_dict()
        assert d["error_type"] == "AIError"
        assert d["message"] == "oops"
        assert d["agent_name"] == "inv"
        assert d["original_error"] is None

    def test_to_dict_with_original_exception(self):
        original = RuntimeError("boom")
        err = AgentExecutionError("fail", original_exception=original)
        d = err.to_dict()
        assert d["error_type"] == "AgentExecutionError"
        assert d["original_error"] == "boom"


# ---------------------------------------------------------------------------
# Retryable Classification
# ---------------------------------------------------------------------------

class TestRetryableClassification:
    """Verify default retryable flags."""

    def test_validation_not_retryable(self):
        assert AgentValidationError().retryable is False

    def test_config_not_retryable(self):
        assert LLMConfigurationError().retryable is False

    def test_rate_limit_retryable(self):
        assert LLMRateLimitError().retryable is True

    def test_timeout_retryable(self):
        assert LLMTimeoutError().retryable is True

    def test_tool_execution_retryable(self):
        assert ToolExecutionError().retryable is True

    def test_tracing_not_retryable(self):
        assert TracingError().retryable is False

    def test_response_validation_not_retryable(self):
        assert ResponseValidationError().retryable is False


# ---------------------------------------------------------------------------
# Catchability
# ---------------------------------------------------------------------------

class TestCatchability:
    """Verify exceptions can be caught at different levels."""

    def test_catch_ai_error_from_agent(self):
        with pytest.raises(AIError):
            raise AgentExecutionError("bad")

    def test_catch_agent_error_from_validation(self):
        with pytest.raises(AgentError):
            raise AgentValidationError("invalid")

    def test_catch_llm_error_from_timeout(self):
        with pytest.raises(LLMError):
            raise LLMTimeoutError("timed out")

    def test_catch_tool_error_from_execution(self):
        with pytest.raises(ToolError):
            raise ToolExecutionError("tool failed")
