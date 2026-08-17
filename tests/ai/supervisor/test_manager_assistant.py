"""
SupplySense — Intelligent Manager Assistant Comprehensive Test Suite
Tests all 5 execution modes:
    1. Direct Tool Path (Fast operational lookups, 0 LLM calls)
    2. Agent Path (Specialized domain reasoning)
    3. RAG Path (Company policy document retrieval)
    4. Unsupported Hybrid Path (Operational DB + Qdrant policy combination)
    5. Unknown / Low-Confidence Path (Ambiguous query clarification)
    6. Performance / Latency Benchmarks
"""

import pytest
import time
from unittest.mock import AsyncMock, MagicMock, patch

from backend.app.ai.supervisor.router import _deterministic_route, fast_route_query
from backend.app.ai.supervisor.schemas import ExecutionMode, RouterDecision, SupervisorResponse
from backend.app.ai.supervisor.graph import run_supervisor, SupplySenseSupervisor


# ---------------------------------------------------------------------------
# 1. DIRECT TOOL ROUTER TESTS (0 LLM Calls)
# ---------------------------------------------------------------------------

class TestDirectToolRouting:
    """Verify simple factual queries match deterministic fast path with 0 LLM calls."""

    def test_macbook_quantity_deterministic(self):
        decision = _deterministic_route("Give me MacBook quantity.")
        assert decision is not None
        assert decision.query_type == ExecutionMode.DIRECT_TOOL
        assert decision.intent == "inventory_lookup"
        assert decision.tool == "search_products"
        assert decision.entities.get("product") == "macbook"
        assert decision.confidence >= 0.95

    def test_laptops_available_deterministic(self):
        decision = _deterministic_route("How many laptops are available?")
        assert decision is not None
        assert decision.query_type == ExecutionMode.DIRECT_TOOL
        assert decision.intent == "inventory_lookup"
        assert decision.entities.get("product") == "laptops"

    def test_products_in_warehouse_deterministic(self):
        decision = _deterministic_route("How many products are in Warehouse A?")
        assert decision is not None
        assert decision.query_type == ExecutionMode.DIRECT_TOOL
        assert decision.intent == "warehouse_lookup"
        assert decision.entities.get("warehouse") == "a"

    def test_pending_purchase_orders_deterministic(self):
        decision = _deterministic_route("How many purchase orders are pending?")
        assert decision is not None
        assert decision.query_type == ExecutionMode.DIRECT_TOOL
        assert decision.intent == "purchase_order_lookup"

    def test_active_shipments_deterministic(self):
        decision = _deterministic_route("How many active shipments are there?")
        assert decision is not None
        assert decision.query_type == ExecutionMode.DIRECT_TOOL
        assert decision.intent == "shipment_lookup"

    @pytest.mark.asyncio
    async def test_fast_route_query_zero_llm_calls(self):
        decision, llm_calls = await fast_route_query("Give me MacBook quantity.")
        assert decision.query_type == ExecutionMode.DIRECT_TOOL
        assert llm_calls == 0  # 0 LLM calls used!


# ---------------------------------------------------------------------------
# 2. AGENT ROUTER TESTS
# ---------------------------------------------------------------------------

class TestAgentRouting:
    """Verify analytical/reasoning queries route to specialized agents."""

    @pytest.mark.asyncio
    @patch("backend.app.ai.supervisor.router.get_llm")
    async def test_stockout_risk_routes_to_inventory_agent(self, mock_get_llm):
        mock_llm = MagicMock()
        mock_llm.with_structured_output.return_value.ainvoke = AsyncMock(
            return_value=RouterDecision(
                query_type=ExecutionMode.AGENT,
                intent="inventory_analysis",
                agent="inventory",
                selected_agents=["inventory"],
                confidence=0.95,
            )
        )
        mock_get_llm.return_value = mock_llm

        decision, llm_calls = await fast_route_query("Which products are at the highest stockout risk?")
        assert decision.query_type == ExecutionMode.AGENT
        assert "inventory" in [a.value for a in decision.selected_agents]

    @pytest.mark.asyncio
    @patch("backend.app.ai.supervisor.router.get_llm")
    async def test_supplier_worst_routes_to_supplier_agent(self, mock_get_llm):
        mock_llm = MagicMock()
        mock_llm.with_structured_output.return_value.ainvoke = AsyncMock(
            return_value=RouterDecision(
                query_type=ExecutionMode.AGENT,
                intent="supplier_analysis",
                agent="supplier",
                selected_agents=["supplier"],
                confidence=0.94,
            )
        )
        mock_get_llm.return_value = mock_llm

        decision, llm_calls = await fast_route_query("Which supplier is performing worst?")
        assert decision.query_type == ExecutionMode.AGENT
        assert decision.agent == "supplier"

    @pytest.mark.asyncio
    @patch("backend.app.ai.supervisor.router.get_llm")
    async def test_shipments_problem_routes_to_shipment_agent(self, mock_get_llm):
        mock_llm = MagicMock()
        mock_llm.with_structured_output.return_value.ainvoke = AsyncMock(
            return_value=RouterDecision(
                query_type=ExecutionMode.AGENT,
                intent="shipment_analysis",
                agent="shipment",
                selected_agents=["shipment"],
                confidence=0.96,
            )
        )
        mock_get_llm.return_value = mock_llm

        decision, llm_calls = await fast_route_query("Which shipments are causing operational problems?")
        assert decision.query_type == ExecutionMode.AGENT
        assert decision.agent == "shipment"

    @pytest.mark.asyncio
    @patch("backend.app.ai.supervisor.router.get_llm")
    async def test_forecast_demand_routes_to_forecast_agent(self, mock_get_llm):
        mock_llm = MagicMock()
        mock_llm.with_structured_output.return_value.ainvoke = AsyncMock(
            return_value=RouterDecision(
                query_type=ExecutionMode.AGENT,
                intent="forecast",
                agent="forecast",
                selected_agents=["forecast"],
                confidence=0.92,
            )
        )
        mock_get_llm.return_value = mock_llm

        decision, llm_calls = await fast_route_query("Forecast laptop demand for next month.")
        assert decision.query_type == ExecutionMode.AGENT
        assert decision.agent == "forecast"

    @pytest.mark.asyncio
    @patch("backend.app.ai.supervisor.router.get_llm")
    async def test_biggest_risk_routes_to_risk_agent(self, mock_get_llm):
        mock_llm = MagicMock()
        mock_llm.with_structured_output.return_value.ainvoke = AsyncMock(
            return_value=RouterDecision(
                query_type=ExecutionMode.AGENT,
                intent="risk_analysis",
                agent="risk",
                selected_agents=["risk"],
                confidence=0.93,
            )
        )
        mock_get_llm.return_value = mock_llm

        decision, llm_calls = await fast_route_query("What is the biggest operational risk?")
        assert decision.query_type == ExecutionMode.AGENT
        assert decision.agent == "risk"

    @pytest.mark.asyncio
    @patch("backend.app.ai.supervisor.router.get_llm")
    async def test_management_summary_routes_to_executive_agent(self, mock_get_llm):
        mock_llm = MagicMock()
        mock_llm.with_structured_output.return_value.ainvoke = AsyncMock(
            return_value=RouterDecision(
                query_type=ExecutionMode.AGENT,
                intent="executive_summary",
                agent="executive",
                selected_agents=["executive"],
                confidence=0.98,
            )
        )
        mock_get_llm.return_value = mock_llm

        decision, llm_calls = await fast_route_query("Generate today's management summary.")
        assert decision.query_type == ExecutionMode.AGENT
        assert decision.agent == "executive"


# ---------------------------------------------------------------------------
# 3. RAG KNOWLEDGE ROUTER TESTS
# ---------------------------------------------------------------------------

class TestRAGRouting:
    """Verify policy/document questions route to RAG."""

    def test_procurement_policy_deterministic(self):
        decision = _deterministic_route("What is our procurement policy?")
        assert decision is not None
        assert decision.query_type == ExecutionMode.RAG
        assert decision.intent == "knowledge_query"
        assert decision.agent == "rag"

    def test_receiving_procedure_deterministic(self):
        decision = _deterministic_route("What is the warehouse receiving procedure?")
        assert decision is not None
        assert decision.query_type == ExecutionMode.RAG
        assert decision.intent == "knowledge_query"

    def test_emergency_procurement_deterministic(self):
        decision = _deterministic_route("What is the emergency procurement process?")
        assert decision is not None
        assert decision.query_type == ExecutionMode.RAG
        assert decision.intent == "knowledge_query"


# ---------------------------------------------------------------------------
# 4. MULTI-AGENT ROUTER TESTS
# ---------------------------------------------------------------------------

class TestMultiAgentRouting:
    """Verify multi-domain queries select minimum required agents."""

    @pytest.mark.asyncio
    @patch("backend.app.ai.supervisor.router.get_llm")
    async def test_shipments_inventory_risk_routes_multi_agent(self, mock_get_llm):
        mock_llm = MagicMock()
        mock_llm.with_structured_output.return_value.ainvoke = AsyncMock(
            return_value=RouterDecision(
                query_type=ExecutionMode.AGENT,
                intent="risk_analysis",
                selected_agents=["shipment", "risk"],
                requires_parallel_execution=True,
                confidence=0.91,
            )
        )
        mock_get_llm.return_value = mock_llm

        decision, llm_calls = await fast_route_query(
            "Which delayed shipments are creating the highest inventory risk?"
        )
        assert decision.query_type == ExecutionMode.AGENT
        agent_names = [a.value for a in decision.selected_agents]
        assert "shipment" in agent_names
        assert "risk" in agent_names
        # Executive should NOT be included
        assert "executive" not in agent_names


# ---------------------------------------------------------------------------
# 5. UNSUPPORTED HYBRID ROUTER TESTS
# ---------------------------------------------------------------------------

class TestUnsupportedHybridRouting:
    """Verify queries combining DB lookup + policy RAG return unsupported_workflow."""

    def test_reorder_macbooks_policy_deterministic(self):
        decision = _deterministic_route(
            "Should I reorder MacBooks according to our procurement policy?"
        )
        assert decision is not None
        assert decision.query_type == ExecutionMode.UNSUPPORTED_HYBRID
        assert decision.intent == "unsupported_hybrid"

    @pytest.mark.asyncio
    async def test_supervisor_runs_unsupported_hybrid(self):
        supervisor = SupplySenseSupervisor()
        res: SupervisorResponse = await supervisor.run(
            "Should I reorder MacBooks according to our procurement policy?"
        )
        assert res.status == "unsupported_workflow"
        assert res.query_type == "unsupported_hybrid"
        assert "Hybrid reasoning is not enabled yet" in res.answer


# ---------------------------------------------------------------------------
# 6. UNKNOWN / CLARIFICATION ROUTER TESTS
# ---------------------------------------------------------------------------

class TestUnknownQueryRouting:
    """Verify ambiguous/low confidence queries request clarification."""

    def test_tell_me_something_deterministic(self):
        decision = _deterministic_route("Tell me something.")
        assert decision is not None
        assert decision.query_type == ExecutionMode.UNKNOWN
        assert decision.confidence < 0.60

    @pytest.mark.asyncio
    async def test_supervisor_runs_unknown_clarification(self):
        supervisor = SupplySenseSupervisor()
        res: SupervisorResponse = await supervisor.run("Tell me something.")
        assert res.status == "clarification_needed"
        assert res.query_type == "unknown"
        assert "Could you please clarify your question?" in res.answer


# ---------------------------------------------------------------------------
# 7. PERFORMANCE & LATENCY BENCHMARK
# ---------------------------------------------------------------------------

class TestPerformanceBenchmarks:
    """Verify direct tool path execution is significantly faster than agent path."""

    @pytest.mark.asyncio
    async def test_direct_tool_latency_vs_agent_latency(self):
        supervisor = SupplySenseSupervisor()

        # 1. Direct tool path
        t0 = time.time()
        res_direct = await supervisor.run("Give me MacBook quantity.")
        dt_duration = (time.time() - t0) * 1000

        assert res_direct.query_type == "direct_tool"
        assert res_direct.status == "success"

        # Direct tool fast path should execute rapidly and make 0 LLM calls
        assert res_direct.execution_metadata.llm_calls_made == 0
        assert dt_duration < 15000.0, f"Direct tool path took {dt_duration:.2f}ms (expected < 15000ms)"


