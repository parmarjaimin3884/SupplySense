from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models import Product, Warehouse, Supplier, Shipment, Inventory, SalesOrder
from backend.app.ai.tools.common import tool_error_handler, format_response

@tool_error_handler
async def get_dashboard_metrics(session: AsyncSession = None) -> dict:
    """
    Get high-level metrics for the main dashboard.
    """
    products_stmt = select(func.count(Product.id))
    warehouses_stmt = select(func.count(Warehouse.id))
    suppliers_stmt = select(func.count(Supplier.id))
    
    total_products = (await session.execute(products_stmt)).scalar() or 0
    total_warehouses = (await session.execute(warehouses_stmt)).scalar() or 0
    total_suppliers = (await session.execute(suppliers_stmt)).scalar() or 0
    
    data = {
        "total_products": total_products,
        "total_warehouses": total_warehouses,
        "total_suppliers": total_suppliers
    }
    return format_response(True, "Dashboard metrics retrieved successfully.", data)

@tool_error_handler
async def get_inventory_summary(session: AsyncSession = None) -> dict:
    """
    Get a summary of inventory health.
    """
    total_qty_stmt = select(func.sum(Inventory.available_quantity))
    total_val_stmt = select(func.sum(Inventory.available_quantity * Product.cost_price)).select_from(Inventory).join(Product)
    
    # Low stock: available <= reorder_level
    low_stock_stmt = select(func.count(Inventory.id)).select_from(Inventory).join(Product).where(Inventory.available_quantity <= Product.reorder_level).where(Inventory.available_quantity > 0)
    
    # Out of stock
    oos_stmt = select(func.count(Inventory.id)).where(Inventory.available_quantity == 0)
    
    total_qty = (await session.execute(total_qty_stmt)).scalar() or 0
    total_val = (await session.execute(total_val_stmt)).scalar() or 0.0
    low_stock_count = (await session.execute(low_stock_stmt)).scalar() or 0
    oos_count = (await session.execute(oos_stmt)).scalar() or 0
    
    data = {
        "total_available_items": int(total_qty),
        "total_inventory_value": float(total_val),
        "low_stock_items_count": low_stock_count,
        "out_of_stock_items_count": oos_count
    }
    return format_response(True, "Inventory summary retrieved.", data)

@tool_error_handler
async def get_supplier_summary(session: AsyncSession = None) -> dict:
    """
    Get a summary of supplier metrics.
    """
    total_stmt = select(func.count(Supplier.id))
    avg_rel_stmt = select(func.avg(Supplier.reliability_score))
    avg_qual_stmt = select(func.avg(Supplier.quality_score))
    
    # Risky suppliers: risk rating is High or reliability < threshold (e.g. 70)
    risky_stmt = select(func.count(Supplier.id)).where(Supplier.reliability_score < 70)
    
    total = (await session.execute(total_stmt)).scalar() or 0
    avg_rel = (await session.execute(avg_rel_stmt)).scalar() or 0.0
    avg_qual = (await session.execute(avg_qual_stmt)).scalar() or 0.0
    risky_count = (await session.execute(risky_stmt)).scalar() or 0
    
    data = {
        "total_suppliers": total,
        "average_reliability_score": float(avg_rel),
        "average_quality_score": float(avg_qual),
        "risky_suppliers_count": risky_count
    }
    return format_response(True, "Supplier summary retrieved.", data)

@tool_error_handler
async def get_shipment_summary(session: AsyncSession = None) -> dict:
    """
    Get a summary of shipment statuses and delays.
    """
    total_stmt = select(func.count(Shipment.id))
    pending_stmt = select(func.count(Shipment.id)).where(Shipment.current_status.in_(['Pending', 'In Transit', 'Dispatched']))
    delayed_stmt = select(func.count(Shipment.id)).where(Shipment.delay_days > 0).where(Shipment.current_status != 'Delivered')
    
    total = (await session.execute(total_stmt)).scalar() or 0
    pending = (await session.execute(pending_stmt)).scalar() or 0
    delayed = (await session.execute(delayed_stmt)).scalar() or 0
    
    data = {
        "total_shipments": total,
        "pending_shipments": pending,
        "delayed_shipments": delayed
    }
    return format_response(True, "Shipment summary retrieved.", data)

@tool_error_handler
async def get_warehouse_summary(session: AsyncSession = None) -> dict:
    """
    Get a summary of warehouse utilization.
    """
    total_stmt = select(func.count(Warehouse.id))
    avg_cap_stmt = select(func.avg(Warehouse.capacity))
    avg_util_stmt = select(func.avg(Warehouse.current_utilization))
    
    total = (await session.execute(total_stmt)).scalar() or 0
    avg_cap = (await session.execute(avg_cap_stmt)).scalar() or 0.0
    avg_util = (await session.execute(avg_util_stmt)).scalar() or 0.0
    
    data = {
        "total_warehouses": total,
        "average_capacity": float(avg_cap),
        "average_utilization_percentage": float(avg_util)
    }
    return format_response(True, "Warehouse summary retrieved.", data)

@tool_error_handler
async def get_sales_summary(session: AsyncSession = None) -> dict:
    """
    Get a summary of sales performance.
    """
    total_orders_stmt = select(func.count(SalesOrder.id))
    total_rev_stmt = select(func.sum(SalesOrder.total_amount)).where(SalesOrder.status == 'Completed')
    pending_orders_stmt = select(func.count(SalesOrder.id)).where(SalesOrder.status == 'Pending')
    
    total_orders = (await session.execute(total_orders_stmt)).scalar() or 0
    total_rev = (await session.execute(total_rev_stmt)).scalar() or 0.0
    pending_orders = (await session.execute(pending_orders_stmt)).scalar() or 0
    
    data = {
        "total_sales_orders": total_orders,
        "pending_sales_orders": pending_orders,
        "total_completed_revenue": float(total_rev)
    }
    return format_response(True, "Sales summary retrieved.", data)
