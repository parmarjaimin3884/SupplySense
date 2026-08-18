"""
SupplySense — API Layer Test Suite for AI Manager Assistant
============================================================

Tests FastAPI endpoints:
- POST /api/v1/ai/chat (Request validation, operational direct tools, multi-agent queries, RAG, errors)
- GET /api/v1/ai/health
- GET /health
- OpenAPI /docs specification
"""

import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from main import app
from backend.app.ai.supervisor.schemas import SupervisorResponse, ExecutionMetadata
from backend.app.ai.core.exceptions import (
    AgentExecutionError,
    RAGError,
    LLMTimeoutError,
    ToolExecutionError,
)

client = TestClient(app)


class TestHealthEndpoints:
    """Verify general and AI health endpoints."""

    def test_root_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_ai_health_check(self):
        response = client.get("/api/v1/ai/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert "llm_provider" in data
        assert "qdrant_collection" in data


class TestRequestValidation:
    """Verify HTTP request payload validation."""

    def test_missing_message_returns_422(self):
        response = client.post("/api/v1/ai/chat", json={})
        assert response.status_code == 422

    def test_empty_message_returns_422(self):
        response = client.post("/api/v1/ai/chat", json={"message": ""})
        assert response.status_code == 422

    def test_whitespace_message_returns_422(self):
        response = client.post("/api/v1/ai/chat", json={"message": "    "})
        assert response.status_code == 422


class TestOperationalDirectToolQuery:
    """Verify direct operational queries (0 LLM calls, direct database tool path)."""

    @patch("backend.app.api.routes.ai.SupplySenseSupervisor.run", new_callable=AsyncMock)
    def test_direct_operational_query(self, mock_run):
        mock_response = SupervisorResponse(
            status="success",
            query="Give me MacBook quantity",
            query_type="direct_tool",
            intent="inventory_lookup",
            tool_used="search_products",
            answer="150 units of MacBook Pro available in Warehouse A.",
            summary="Direct stock lookup completed.",
            confidence=1.0,
            execution_metadata=ExecutionMetadata(total_duration_ms=120.0, llm_calls_made=0),
        )
        mock_run.return_value = mock_response

        response = client.post(
            "/api/v1/ai/chat",
            json={"message": "Give me MacBook quantity"},
        )
        assert response.status_code == 200
        data = response.json()

        assert data["status"] == "success"
        assert data["query_type"] == "direct_tool"
        assert data["tool_used"] == "search_products"
        assert "150 units" in data["answer"]
        assert "request_id" in data
        mock_run.assert_called_once_with(user_question="Give me MacBook quantity")


class TestAgentAnalyticalQuery:
    """Verify multi-agent analytical queries."""

    @patch("backend.app.api.routes.ai.SupplySenseSupervisor.run", new_callable=AsyncMock)
    def test_agent_analytical_query(self, mock_run):
        mock_response = SupervisorResponse(
            status="success",
            query="Which products have the highest stockout risk?",
            query_type="agent",
            intent="inventory_analysis",
            agent_used="inventory",
            selected_agents=["inventory"],
            answer="Product MacBook Air has stockout risk level HIGH.",
            summary="Stockout risk analysis completed.",
            findings=[
                {
                    "category": "Risk",
                    "title": "Low Stock Alert",
                    "detail": "MacBook Air stock is below safety buffer.",
                    "source_agent": "inventory",
                    "severity": "High",
                }
            ],
            recommendations=[
                {
                    "action": "Reorder 50 units of MacBook Air",
                    "rationale": "Stock cover is under 5 days.",
                    "priority": "High",
                    "source_agents": ["inventory"],
                }
            ],
            confidence=0.95,
        )
        mock_run.return_value = mock_response

        response = client.post(
            "/api/v1/ai/chat",
            json={"message": "Which products have the highest stockout risk?"},
        )
        assert response.status_code == 200
        data = response.json()

        assert data["status"] == "success"
        assert data["query_type"] == "agent"
        assert data["agent_used"] == "inventory"
        assert len(data["findings"]) == 1
        assert len(data["recommendations"]) == 1


class TestRAGKnowledgeQuery:
    """Verify RAG policy SOP knowledge queries."""

    @patch("backend.app.api.routes.ai.SupplySenseSupervisor.run", new_callable=AsyncMock)
    def test_rag_knowledge_query(self, mock_run):
        mock_response = SupervisorResponse(
            status="success",
            query="What is our emergency procurement process?",
            query_type="rag",
            intent="knowledge_query",
            agent_used="rag",
            selected_agents=["rag"],
            answer="Emergency procurement requires VP approval for orders over $50,000.",
            summary="Emergency procurement policy summary.",
            citations_and_sources=[
                "emergency_procurement.pdf (ID: SSE-EMG-POL-001, Page 1)",
            ],
            confidence=0.98,
        )
        mock_run.return_value = mock_response

        response = client.post(
            "/api/v1/ai/chat",
            json={"message": "What is our emergency procurement process?"},
        )
        assert response.status_code == 200
        data = response.json()

        assert data["status"] == "success"
        assert data["query_type"] == "rag"
        assert len(data["citations_and_sources"]) == 1
        assert "SSE-EMG-POL-001" in data["citations_and_sources"][0]


class TestErrorHandlingAndSecurity:
    """Verify safe error responses without leaking sensitive internal details."""

    @patch("backend.app.api.routes.ai.SupplySenseSupervisor.run", new_callable=AsyncMock)
    def test_agent_execution_error_returns_500(self, mock_run):
        mock_run.side_effect = AgentExecutionError("Inventory agent failed execution.")

        response = client.post("/api/v1/ai/chat", json={"message": "Check inventory"})
        assert response.status_code == 500
        data = response.json()

        assert data["status"] == "error"
        assert data["error"]["code"] == "AI_EXECUTION_ERROR"

    @patch("backend.app.api.routes.ai.SupplySenseSupervisor.run", new_callable=AsyncMock)
    def test_rag_error_returns_503(self, mock_run):
        mock_run.side_effect = RAGError("Vector store unavailable.")

        response = client.post("/api/v1/ai/chat", json={"message": "Get procurement policy"})
        assert response.status_code == 503
        data = response.json()

        assert data["status"] == "error"
        assert data["error"]["code"] == "AI_SERVICE_UNAVAILABLE"

    @patch("backend.app.api.routes.ai.SupplySenseSupervisor.run", new_callable=AsyncMock)
    def test_llm_timeout_returns_504(self, mock_run):
        mock_run.side_effect = LLMTimeoutError("Groq request timed out.")

        response = client.post("/api/v1/ai/chat", json={"message": "Analyze demand"})
        assert response.status_code == 504
        data = response.json()

        assert data["status"] == "error"
        assert data["error"]["code"] == "LLM_TIMEOUT"

    @patch("backend.app.api.routes.ai.SupplySenseSupervisor.run", new_callable=AsyncMock)
    def test_unexpected_exception_masks_secrets(self, mock_run):
        # Simulate unexpected exception containing database credentials
        mock_run.side_effect = Exception("postgresql://user:secret_pass@db.host/db failed")

        response = client.post("/api/v1/ai/chat", json={"message": "Test error"})
        assert response.status_code == 500
        data = response.json()

        assert data["status"] == "error"
        assert data["error"]["code"] == "INTERNAL_SERVER_ERROR"
        # Verify secret password or string is NOT leaked in client response
        assert "secret_pass" not in str(data)


class TestRequestIdPreservation:
    """Verify request ID correlation tracking."""

    @patch("backend.app.api.routes.ai.SupplySenseSupervisor.run", new_callable=AsyncMock)
    def test_custom_request_id_preserved(self, mock_run):
        mock_run.return_value = SupervisorResponse(
            status="success",
            query="Test query",
            query_type="direct_tool",
            intent="test",
            summary="Test summary",
            answer="Test answer",
            confidence=1.0,
        )


        response = client.post(
            "/api/v1/ai/chat",
            json={"message": "Test query", "request_id": "req_custom_999"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["request_id"] == "req_custom_999"


class TestOpenAPISpecification:
    """Verify OpenAPI endpoint registration."""

    def test_openapi_docs_endpoint(self):
        response = client.get("/docs")
        assert response.status_code == 200

    def test_openapi_json_schema(self):
        response = client.get("/openapi.json")
        assert response.status_code == 200
        schema = response.json()

        assert "/api/v1/ai/chat" in schema["paths"]
        assert "post" in schema["paths"]["/api/v1/ai/chat"]
