from typing import Dict, Any, List
from langchain_core.tools import tool

from backend.app.ai.tools.shipment import (
    get_all_shipments, get_shipment, get_delayed_shipments,
    get_pending_shipments, get_shipments_by_supplier,
    get_shipments_by_warehouse, get_recent_shipments,
    calculate_average_delay
)
from backend.app.ai.tools.supplier import (
    get_supplier, get_supplier_performance,
    get_supplier_reliability, get_supplier_lead_time
)
from backend.app.ai.tools.purchase_order import (
    get_purchase_order, get_pending_purchase_orders, get_completed_purchase_orders
)
from backend.app.ai.tools.warehouse import (
    get_warehouse, get_warehouse_capacity
)
from backend.app.ai.tools.analytics import (
    get_shipment_summary, get_dashboard_metrics
)

# Wrapping Shipment Tools
@tool
async def tool_get_all_shipments() -> Dict[str, Any]:
    """Get all shipments with basic info."""
    return await get_all_shipments()

@tool
async def tool_get_shipment(shipment_id: str) -> Dict[str, Any]:
    """Get detailed information about a specific shipment."""
    return await get_shipment(shipment_id)

@tool
async def tool_get_delayed_shipments() -> Dict[str, Any]:
    """Get all shipments that are currently delayed."""
    return await get_delayed_shipments()

@tool
async def tool_get_pending_shipments() -> Dict[str, Any]:
    """Get all shipments that have not yet been delivered."""
    return await get_pending_shipments()

@tool
async def tool_get_shipments_by_supplier(supplier_id: str) -> Dict[str, Any]:
    """Get all shipments originating from a specific supplier."""
    return await get_shipments_by_supplier(supplier_id)

@tool
async def tool_get_shipments_by_warehouse(warehouse_id: str) -> Dict[str, Any]:
    """Get all shipments destined for a specific warehouse."""
    return await get_shipments_by_warehouse(warehouse_id)

@tool
async def tool_get_recent_shipments() -> Dict[str, Any]:
    """Get the most recently dispatched shipments."""
    return await get_recent_shipments()

@tool
async def tool_calculate_average_delay() -> Dict[str, Any]:
    """Calculate the average delay of all shipments in days."""
    return await calculate_average_delay()

# Wrapping Supplier Tools
@tool
async def tool_get_supplier(supplier_id: str) -> Dict[str, Any]:
    """Get detailed information about a specific supplier."""
    return await get_supplier(supplier_id)

@tool
async def tool_get_supplier_performance(supplier_id: str) -> Dict[str, Any]:
    """Get performance history (monthly KPIs) for a specific supplier."""
    return await get_supplier_performance(supplier_id)

@tool
async def tool_get_supplier_reliability(supplier_id: str) -> Dict[str, Any]:
    """Get the reliability score of a specific supplier."""
    return await get_supplier_reliability(supplier_id)

@tool
async def tool_get_supplier_lead_time(supplier_id: str) -> Dict[str, Any]:
    """Get the standard lead time for a specific supplier."""
    return await get_supplier_lead_time(supplier_id)

# Wrapping PO Tools
@tool
async def tool_get_purchase_order(order_id: str) -> Dict[str, Any]:
    """Get detailed information about a specific purchase order."""
    return await get_purchase_order(order_id)

@tool
async def tool_get_pending_purchase_orders() -> Dict[str, Any]:
    """Get all pending or unfulfilled purchase orders."""
    return await get_pending_purchase_orders()

@tool
async def tool_get_completed_purchase_orders() -> Dict[str, Any]:
    """Get completed purchase orders."""
    return await get_completed_purchase_orders()

# Wrapping Warehouse Tools
@tool
async def tool_get_warehouse(warehouse_id: str) -> Dict[str, Any]:
    """Get detailed information about a specific warehouse."""
    return await get_warehouse(warehouse_id)

@tool
async def tool_get_warehouse_capacity(warehouse_id: str) -> Dict[str, Any]:
    """Get the total capacity of a specific warehouse."""
    return await get_warehouse_capacity(warehouse_id)

# Wrapping Analytics Tools
@tool
async def tool_get_shipment_summary() -> Dict[str, Any]:
    """Get a summary of shipment statuses and delays."""
    return await get_shipment_summary()

@tool
async def tool_get_dashboard_metrics() -> Dict[str, Any]:
    """Get high-level metrics (total products, warehouses, suppliers)."""
    return await get_dashboard_metrics()

def get_shipment_agent_tools() -> List[Any]:
    """Returns the comprehensive list of tools for the Shipment Monitoring Agent."""
    return [
        tool_get_all_shipments, tool_get_shipment, tool_get_delayed_shipments,
        tool_get_pending_shipments, tool_get_shipments_by_supplier,
        tool_get_shipments_by_warehouse, tool_get_recent_shipments,
        tool_calculate_average_delay, tool_get_supplier,
        tool_get_supplier_performance, tool_get_supplier_reliability,
        tool_get_supplier_lead_time, tool_get_purchase_order,
        tool_get_pending_purchase_orders, tool_get_completed_purchase_orders,
        tool_get_warehouse, tool_get_warehouse_capacity,
        tool_get_shipment_summary, tool_get_dashboard_metrics
    ]
