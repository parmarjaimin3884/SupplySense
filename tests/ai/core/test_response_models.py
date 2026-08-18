"""
Tests for backend.app.ai.core.response_models
"""

import pytest
from datetime import datetime

from backend.app.ai.core.response_models import (
    AgentResponse,
    AgentFinding,
    Recommendation,
    Evidence,
    ExecutionMetadata,
    AgentError,
    AgentStatus,
    Severity,
    Priority,
)


# ---------------------------------------------------------------------------
# AgentStatus Enum
# ---------------------------------------------------------------------------

class TestAgentStatus:

    def test_success_value(self):
        assert AgentStatus.SUCCESS == "success"

    def test_partial_success_value(self):
        assert AgentStatus.PARTIAL_SUCCESS == "partial_success"

    def test_failure_value(self):
        assert AgentStatus.FAILURE == "failure"


# ---------------------------------------------------------------------------
# Evidence
# ---------------------------------------------------------------------------

class TestEvidence:

    def test_minimal_evidence(self):
        e = Evidence(source_type="Database Tool")
        assert e.source_type == "Database Tool"
        assert e.source_name is None
        assert e.detail == ""

    def test_full_evidence(self):
        e = Evidence(
            source_type="RAG Document",
            source_name="Procurement Policy v2.1",
            detail="Section 3.2 states...",
            data={"page": 12},
        )
        assert e.source_name == "Procurement Policy v2.1"
        assert e.data == {"page": 12}


# ---------------------------------------------------------------------------
# AgentFinding
# ---------------------------------------------------------------------------

class TestAgentFinding:

    def test_minimal_finding(self):
        f = AgentFinding(title="Low Stock", description="Widget below reorder.")
        assert f.title == "Low Stock"
        assert f.severity is None
        assert f.confidence == 1.0
        assert f.affected_entities == []

    def test_finding_with_evidence(self):
        ev = Evidence(source_type="Inventory Tool", detail="qty=5")
        f = AgentFinding(
            title="Stockout Risk",
            description="Critical shortage.",
            severity="Critical",
            category="Inventory",
            evidence=[ev],
            confidence=0.95,
            affected_entities=["Widget-A"],
        )
        assert len(f.evidence) == 1
        assert f.affected_entities == ["Widget-A"]

    def test_confidence_bounds(self):
        with pytest.raises(Exception):
            AgentFinding(title="t", description="d", confidence=1.5)


# ---------------------------------------------------------------------------
# Recommendation
# ---------------------------------------------------------------------------

class TestRecommendation:

    def test_minimal_recommendation(self):
        r = Recommendation(action="Reorder Widget-A")
        assert r.action == "Reorder Widget-A"
        assert r.priority == "Medium"
        assert r.expected_impact is None

    def test_full_recommendation(self):
        r = Recommendation(
            action="Increase safety stock",
            priority="Urgent",
            reason="Historical stockouts Q4",
            expected_impact="Reduce stockout risk by 40%",
            related_finding="Stockout Risk",
        )
        assert r.priority == "Urgent"
        assert r.related_finding == "Stockout Risk"


# ---------------------------------------------------------------------------
# AgentError (response-level)
# ---------------------------------------------------------------------------

class TestAgentErrorModel:

    def test_basic_error(self):
        e = AgentError(
            error_type="ExecutionError",
            message="Tool timeout",
        )
        assert e.error_type == "ExecutionError"
        assert e.retryable is False

    def test_retryable_error(self):
        e = AgentError(
            error_type="RateLimitError",
            message="429",
            retryable=True,
            agent_name="inventory",
        )
        assert e.retryable is True
        assert e.agent_name == "inventory"


# ---------------------------------------------------------------------------
# ExecutionMetadata
# ---------------------------------------------------------------------------

class TestExecutionMetadata:

    def test_defaults(self):
        m = ExecutionMetadata()
        assert m.duration_ms == 0.0
        assert m.tools_used == []
        assert m.retry_count == 0
        assert m.status == "pending"

    def test_populated(self):
        m = ExecutionMetadata(
            request_id="req-1",
            agent_name="shipment",
            duration_ms=523.4,
            tools_used=["get_shipments"],
            llm_provider="groq",
            llm_model="llama-3.3-70b-versatile",
            status="success",
        )
        assert m.request_id == "req-1"
        assert m.agent_name == "shipment"
        assert m.llm_provider == "groq"


# ---------------------------------------------------------------------------
# AgentResponse
# ---------------------------------------------------------------------------

class TestAgentResponse:

    def test_minimal_response(self):
        r = AgentResponse(agent_name="test")
        assert r.agent_name == "test"
        assert r.status == AgentStatus.SUCCESS
        assert r.confidence == 0.0
        assert r.findings == []
        assert r.errors == []
        assert r.timestamp  # auto-populated

    def test_success_response(self):
        r = AgentResponse(
            agent_name="inventory",
            agent_version="2.0.0",
            status=AgentStatus.SUCCESS,
            summary="All stock healthy.",
            confidence=0.92,
            domain_data={"inventory_status": "Healthy"},
        )
        assert r.status == AgentStatus.SUCCESS
        assert r.summary == "All stock healthy."
        assert r.domain_data["inventory_status"] == "Healthy"

    def test_failure_response(self):
        r = AgentResponse(
            agent_name="shipment",
            status=AgentStatus.FAILURE,
            errors=[AgentError(error_type="Timeout", message="LLM timed out")],
            confidence=0.0,
        )
        assert r.status == AgentStatus.FAILURE
        assert len(r.errors) == 1

    def test_confidence_clamp_high(self):
        r = AgentResponse(agent_name="test", confidence=1.5)
        assert r.confidence == 1.0

    def test_confidence_clamp_low(self):
        r = AgentResponse(agent_name="test", confidence=-0.5)
        assert r.confidence == 0.0

    def test_confidence_clamp_invalid(self):
        r = AgentResponse(agent_name="test", confidence="not_a_number")
        assert r.confidence == 0.0

    def test_serialisation_round_trip(self):
        r = AgentResponse(
            agent_name="supplier",
            status=AgentStatus.SUCCESS,
            summary="Vendor health OK",
            confidence=0.88,
            findings=[AgentFinding(title="All Good", description="No issues.")],
        )
        d = r.model_dump()
        restored = AgentResponse(**d)
        assert restored.agent_name == "supplier"
        assert restored.findings[0].title == "All Good"

    def test_timestamp_is_iso_format(self):
        r = AgentResponse(agent_name="test")
        # Should not raise
        datetime.fromisoformat(r.timestamp)
