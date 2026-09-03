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
from backend.app.ai.supervisor import SupplySenseSupervisor
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
        assert data["success"] is True
        assert data["data"]["status"] == "online"
        assert "llm_provider" in data["data"]
        assert "qdrant_collection" in data["data"]


class TestRequestValidation:
    """Verify HTTP request payload validation."""

    def test_missing_query_returns_422(self):
        response = client.post("/api/v1/ai/chat", json={})
        assert response.status_code == 422

    def test_empty_query_returns_422(self):
        response = client.post("/api/v1/ai/chat", json={"query": ""})
        assert response.status_code == 422

    def test_whitespace_query_returns_422(self):
        response = client.post("/api/v1/ai/chat", json={"query": "    "})
        assert response.status_code == 422


class TestOperationalDirectToolQuery:
    """Verify direct operational queries (0 LLM calls, direct database tool path)."""

    @patch.object(SupplySenseSupervisor, "run", new_callable=AsyncMock)
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
            json={"query": "Give me MacBook quantity"},
        )
        assert response.status_code == 200
        data = response.json()

        assert data["success"] is True
        assert data["execution_mode"] == "direct_tool"
        assert "150 units" in data["response"]


class TestAgentAnalyticalQuery:
    """Verify multi-agent analytical queries."""

    @patch.object(SupplySenseSupervisor, "run", new_callable=AsyncMock)
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
            json={"query": "Which products have the highest stockout risk?"},
        )
        assert response.status_code == 200
        data = response.json()

        assert data["success"] is True
        assert data["execution_mode"] == "agent"
        assert len(data["findings"]) == 1
        assert len(data["recommendations"]) == 1


class TestRAGKnowledgeQuery:
    """Verify RAG policy SOP knowledge queries."""

    @patch.object(SupplySenseSupervisor, "run", new_callable=AsyncMock)
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
            json={"query": "What is our emergency procurement process?"},
        )
        assert response.status_code == 200
        data = response.json()

        assert data["success"] is True
        assert data["execution_mode"] == "rag"
        assert len(data["sources"]) == 1
        assert "SSE-EMG-POL-001" in data["sources"][0]


class TestErrorHandlingAndSecurity:
    """Verify safe error responses without leaking sensitive internal details."""

    @patch.object(SupplySenseSupervisor, "run", new_callable=AsyncMock)
    def test_agent_execution_error_returns_500(self, mock_run):
        mock_run.side_effect = AgentExecutionError("Inventory agent failed execution.")

        response = client.post("/api/v1/ai/chat", json={"query": "Check inventory"})
        assert response.status_code == 500
        data = response.json()
        assert "detail" in data

    @patch.object(SupplySenseSupervisor, "run", new_callable=AsyncMock)
    def test_unexpected_exception_masks_secrets(self, mock_run):
        # Simulate unexpected exception containing database credentials
        mock_run.side_effect = Exception("postgresql://user:secret_pass@db.host/db failed")

        response = client.post("/api/v1/ai/chat", json={"query": "Test error"})
        assert response.status_code == 500
        data = response.json()
        # Verify secret password or connection string is NOT leaked in client response
        assert "secret_pass" not in str(data)


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
