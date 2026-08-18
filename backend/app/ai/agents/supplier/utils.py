"""
SupplySense — Supplier Intelligence Agent Utils
Wraps existing tool-layer functions as LangChain tools for agent consumption.
"""

from typing import Dict, Any, List
from langchain_core.tools import tool

# --- Supplier Tools ---
from backend.app.ai.tools.supplier import (
    get_supplier,
    get_supplier_orders,
    get_supplier_shipments,
    get_supplier_performance,
    get_supplier_reliability,
    get_supplier_lead_time,
    get_best_suppliers,
    get_risky_suppliers,
)

# --- Shipment Tools ---
from backend.app.ai.tools.shipment import (
    get_shipments_by_supplier,
    calculate_average_delay,
)

# --- Purchase Order Tools ---
from backend.app.ai.tools.purchase_order import (
    get_purchase_orders_by_supplier,
    get_pending_purchase_orders,
)

# --- Analytics Tools ---
from backend.app.ai.tools.analytics import (
    get_supplier_summary,
    get_dashboard_metrics,
)


# =========================================================================
# Supplier Tool Wrappers
# =========================================================================

@tool
async def tool_get_supplier(supplier_id: str) -> Dict[str, Any]:
    """Get detailed information about a specific supplier including reliability score, quality score, lead time, MOQ, and risk rating."""
    return await get_supplier(supplier_id)


@tool
async def tool_get_supplier_orders(supplier_id: str) -> Dict[str, Any]:
    """Get all purchase orders for a specific supplier, ordered by most recent first. Useful for evaluating order history and fulfillment trends."""
    return await get_supplier_orders(supplier_id)


@tool
async def tool_get_supplier_shipments(supplier_id: str) -> Dict[str, Any]:
    """Get all shipments associated with a specific supplier's purchase orders. Useful for analyzing delivery performance and delays."""
    return await get_supplier_shipments(supplier_id)


@tool
async def tool_get_supplier_performance(supplier_id: str) -> Dict[str, Any]:
    """Get monthly performance history (KPIs) for a specific supplier including delivery percentage, average delay, complaint count, quality score, and risk score."""
    return await get_supplier_performance(supplier_id)


@tool
async def tool_get_supplier_reliability(supplier_id: str) -> Dict[str, Any]:
    """Get the reliability score of a specific supplier. Score ranges from 0 to 100."""
    return await get_supplier_reliability(supplier_id)


@tool
async def tool_get_supplier_lead_time(supplier_id: str) -> Dict[str, Any]:
    """Get the standard lead time in days for a specific supplier."""
    return await get_supplier_lead_time(supplier_id)


@tool
async def tool_get_best_suppliers(limit: int = 10) -> Dict[str, Any]:
    """Get the top-performing suppliers ranked by reliability and quality scores. Use this to identify the best vendors in the supply chain."""
    return await get_best_suppliers(limit)


@tool
async def tool_get_risky_suppliers(limit: int = 10) -> Dict[str, Any]:
    """Get the most risky suppliers based on low reliability scores. Use this to identify vendors that may cause supply chain disruptions."""
    return await get_risky_suppliers(limit)


# =========================================================================
# Shipment Tool Wrappers
# =========================================================================

@tool
async def tool_get_shipments_by_supplier(supplier_id: str) -> Dict[str, Any]:
    """Get all shipments originating from a specific supplier. Useful for evaluating supplier delivery patterns."""
    return await get_shipments_by_supplier(supplier_id)


@tool
async def tool_calculate_average_delay() -> Dict[str, Any]:
    """Calculate the average delay of all shipments in days across the entire supply chain. Useful as a benchmark for comparing individual supplier delays."""
    return await calculate_average_delay()


# =========================================================================
# Purchase Order Tool Wrappers
# =========================================================================

@tool
async def tool_get_purchase_orders_by_supplier(supplier_id: str) -> Dict[str, Any]:
    """Get purchase orders for a specific supplier. Useful for analyzing order volume, fulfillment rate, and procurement spend."""
    return await get_purchase_orders_by_supplier(supplier_id)


@tool
async def tool_get_pending_purchase_orders() -> Dict[str, Any]:
    """Get all pending or unfulfilled purchase orders across all suppliers. Useful for identifying bottlenecks and supplier fulfillment gaps."""
    return await get_pending_purchase_orders()


# =========================================================================
# Analytics Tool Wrappers
# =========================================================================

@tool
async def tool_get_supplier_summary() -> Dict[str, Any]:
    """Get an aggregated summary of supplier metrics including total suppliers, average reliability, average quality, and count of risky suppliers."""
    return await get_supplier_summary()


@tool
async def tool_get_dashboard_metrics() -> Dict[str, Any]:
    """Get high-level dashboard metrics including total products, warehouses, and suppliers. Provides system-wide context for analysis."""
    return await get_dashboard_metrics()


# =========================================================================
# Tool Registry
# =========================================================================

def get_supplier_agent_tools() -> List[Any]:
    """
    Returns the comprehensive list of LangChain tools available
    to the Supplier Intelligence Agent.
    """
    return [
        # Supplier Tools
        tool_get_supplier,
        tool_get_supplier_orders,
        tool_get_supplier_shipments,
        tool_get_supplier_performance,
        tool_get_supplier_reliability,
        tool_get_supplier_lead_time,
        tool_get_best_suppliers,
        tool_get_risky_suppliers,
        # Shipment Tools
        tool_get_shipments_by_supplier,
        tool_calculate_average_delay,
        # Purchase Order Tools
        tool_get_purchase_orders_by_supplier,
        tool_get_pending_purchase_orders,
        # Analytics Tools
        tool_get_supplier_summary,
        tool_get_dashboard_metrics,
    ]
