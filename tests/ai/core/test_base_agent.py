"""
Tests for backend.app.ai.core.base_agent

Since BaseAgent depends on ``get_llm()`` (which requires the full LLM
factory and potentially API keys), these tests mock the LLM to avoid
external dependencies.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from typing import Any

from backend.app.ai.core.base_agent import BaseAgent
from backend.app.ai.core.response_models import AgentResponse, AgentStatus
from backend.app.ai.core.exceptions import AgentValidationError


# ---------------------------------------------------------------------------
# Concrete subclass for testing
# ---------------------------------------------------------------------------

class _TestAgent(BaseAgent):
    """Minimal concrete agent for testing."""

    name = "test_agent"
    version = "1.0.0"
    description = "A test agent."

    async def process(self, user_question: str, **kwargs: Any) -> dict:
        return {
            "summary": f"Processed: {user_question}",
            "confidence": 0.85,
        }


class _FailingAgent(BaseAgent):
    """Agent whose process() always raises."""

    name = "failing_agent"

    async def process(self, user_question: str, **kwargs: Any) -> dict:
        raise RuntimeError("something went wrong")


class _CustomValidationAgent(BaseAgent):
    """Agent with custom validation logic."""

    name = "custom_validation"

    async def validate_input(self, user_question: str) -> None:
        await super().validate_input(user_question)
        if "forbidden" in user_question.lower():
            raise AgentValidationError(
                message="Question contains forbidden content.",
                agent_name=self.name,
            )

    async def process(self, user_question: str, **kwargs: Any) -> dict:
        return {"summary": "ok", "confidence": 1.0}


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_llm():
    """Provide a mock LLM so we don't need real API keys."""
    llm = MagicMock()
    llm.ainvoke = AsyncMock(return_value=MagicMock(content="mock response"))
    return llm


@pytest.fixture
def agent(mock_llm):
    """Create a test agent with mocked LLM."""
    return _TestAgent(llm=mock_llm)


@pytest.fixture
def failing_agent(mock_llm):
    return _FailingAgent(llm=mock_llm)


@pytest.fixture
def validation_agent(mock_llm):
    return _CustomValidationAgent(llm=mock_llm)


# ---------------------------------------------------------------------------
# Initialisation
# ---------------------------------------------------------------------------

class TestBaseAgentInit:

    def test_init_with_custom_llm(self, mock_llm):
        agent = _TestAgent(llm=mock_llm)
        assert agent.name == "test_agent"
        assert agent.version == "1.0.0"
        assert agent.description == "A test agent."
        assert agent.llm is mock_llm

    def test_init_with_overrides(self, mock_llm):
        agent = _TestAgent(
            llm=mock_llm,
            name="custom_name",
            version="2.0.0",
            description="custom desc",
        )
        assert agent.name == "custom_name"
        assert agent.version == "2.0.0"
        assert agent.description == "custom desc"

    @patch("backend.app.ai.core.base_agent.get_llm")
    def test_init_uses_factory_when_no_llm(self, mock_get_llm):
        mock_get_llm.return_value = MagicMock()
        agent = _TestAgent()
        mock_get_llm.assert_called_once()
        assert agent.llm is mock_get_llm.return_value


# ---------------------------------------------------------------------------
# execute() — success path
# ---------------------------------------------------------------------------

class TestExecuteSuccess:

    @pytest.mark.asyncio
    async def test_returns_agent_response(self, agent):
        result = await agent.execute("What is the stock level?")
        assert isinstance(result, AgentResponse)
        assert result.agent_name == "test_agent"
        assert result.status == AgentStatus.SUCCESS

    @pytest.mark.asyncio
    async def test_response_contains_domain_data(self, agent):
        result = await agent.execute("test question")
        assert result.domain_data is not None
        assert "summary" in result.domain_data
        assert result.domain_data["summary"] == "Processed: test question"

    @pytest.mark.asyncio
    async def test_response_confidence(self, agent):
        result = await agent.execute("test")
        assert result.confidence == 0.85

    @pytest.mark.asyncio
    async def test_response_metadata_populated(self, agent):
        result = await agent.execute("test", request_id="req-42")
        assert result.metadata.request_id == "req-42"
        assert result.metadata.agent_name == "test_agent"
        assert result.metadata.duration_ms >= 0
        assert result.metadata.status == "success"

    @pytest.mark.asyncio
    async def test_response_has_timestamp(self, agent):
        result = await agent.execute("test")
        assert result.timestamp  # non-empty

    @pytest.mark.asyncio
    async def test_auto_generated_request_id(self, agent):
        result = await agent.execute("test")
        assert result.metadata.request_id is not None
        assert len(result.metadata.request_id) > 0


# ---------------------------------------------------------------------------
# execute() — error path
# ---------------------------------------------------------------------------

class TestExecuteError:

    @pytest.mark.asyncio
    async def test_error_returns_failure_response(self, failing_agent):
        result = await failing_agent.execute("trigger error")
        assert isinstance(result, AgentResponse)
        assert result.status == AgentStatus.FAILURE
        assert result.confidence == 0.0
        assert len(result.errors) == 1

    @pytest.mark.asyncio
    async def test_error_metadata(self, failing_agent):
        result = await failing_agent.execute("trigger error")
        assert result.errors[0].error_type == "RuntimeError"
        assert "something went wrong" in result.errors[0].message
        assert result.metadata.status == "error"

    @pytest.mark.asyncio
    async def test_error_agent_name_in_summary(self, failing_agent):
        result = await failing_agent.execute("trigger error")
        assert "failing_agent" in result.summary


# ---------------------------------------------------------------------------
# validate_input()
# ---------------------------------------------------------------------------

class TestValidateInput:

    @pytest.mark.asyncio
    async def test_empty_question_raises(self, agent):
        with pytest.raises(AgentValidationError, match="must not be empty"):
            await agent.execute("")

    @pytest.mark.asyncio
    async def test_whitespace_only_raises(self, agent):
        with pytest.raises(AgentValidationError, match="must not be empty"):
            await agent.execute("   ")

    @pytest.mark.asyncio
    async def test_valid_question_passes(self, agent):
        # Should not raise
        result = await agent.execute("valid question")
        assert result.status == AgentStatus.SUCCESS

    @pytest.mark.asyncio
    async def test_custom_validation(self, validation_agent):
        with pytest.raises(AgentValidationError, match="forbidden"):
            await validation_agent.execute("This is forbidden content")


# ---------------------------------------------------------------------------
# format_response()
# ---------------------------------------------------------------------------

class TestFormatResponse:

    @pytest.mark.asyncio
    async def test_pydantic_model_serialisation(self, mock_llm):
        """Verify that a Pydantic model returned from process() is serialised."""
        from pydantic import BaseModel, Field

        class CustomResult(BaseModel):
            summary: str = "custom"
            confidence: float = 0.99

        class PydanticAgent(BaseAgent):
            name = "pydantic_test"
            async def process(self, user_question: str, **kwargs):
                return CustomResult()

        agent = PydanticAgent(llm=mock_llm)
        result = await agent.execute("test")
        assert result.domain_data["summary"] == "custom"
        assert result.confidence == 0.99

    @pytest.mark.asyncio
    async def test_dict_result(self, agent):
        """Default _TestAgent returns a dict."""
        result = await agent.execute("test")
        assert isinstance(result.domain_data, dict)

    @pytest.mark.asyncio
    async def test_string_result(self, mock_llm):
        class StringAgent(BaseAgent):
            name = "string_test"
            async def process(self, user_question: str, **kwargs):
                return "raw string result"

        agent = StringAgent(llm=mock_llm)
        result = await agent.execute("test")
        assert result.domain_data["raw"] == "raw string result"
