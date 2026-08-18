from typing import Optional
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from models import PurchaseOrder, PurchaseOrderItem
from backend.app.ai.tools.common import tool_error_handler, format_response

@tool_error_handler
async def get_purchase_order(order_id: str, session: AsyncSession = None) -> dict:
    """
    Get detailed information about a specific purchase order, including items.
    """
    stmt = (
        select(PurchaseOrder)
        .options(
            selectinload(PurchaseOrder.supplier),
            selectinload(PurchaseOrder.warehouse),
            selectinload(PurchaseOrder.items).selectinload(PurchaseOrderItem.product)
        )
        .where(PurchaseOrder.id == order_id)
    )
    result = await session.execute(stmt)
    order = result.scalar_one_or_none()
    
    if not order:
        return format_response(False, f"Purchase order {order_id} not found.")
        
    items_data = [
        {
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product.name if item.product else None,
            "quantity": item.quantity,
            "unit_price": float(item.unit_price),
            "total_price": float(item.total_price)
        }
        for item in order.items
    ]
    
    data = {
        "id": order.id,
        "supplier_id": order.supplier_id,
        "supplier_name": order.supplier.company_name if order.supplier else None,
        "warehouse_id": order.warehouse_id,
        "warehouse_name": order.warehouse.name if order.warehouse else None,
        "order_date": str(order.order_date),
        "expected_delivery_date": str(order.expected_delivery_date) if order.expected_delivery_date else None,
        "status": order.status,
        "priority": order.priority,
        "total_amount": float(order.total_amount),
        "items": items_data
    }
    return format_response(True, "Purchase order details retrieved.", data)

@tool_error_handler
async def get_pending_purchase_orders(limit: int = 50, session: AsyncSession = None) -> dict:
    """
    Get all pending or unfulfilled purchase orders.
    """
    stmt = (
        select(PurchaseOrder)
        .where(PurchaseOrder.status.in_(['Pending', 'Approved', 'Processing']))
        .order_by(desc(PurchaseOrder.order_date))
        .limit(limit)
    )
    result = await session.execute(stmt)
    orders = result.scalars().all()
    
    data = [
        {
            "id": po.id,
            "supplier_id": po.supplier_id,
            "status": po.status,
            "order_date": str(po.order_date),
            "total_amount": float(po.total_amount)
        }
        for po in orders
    ]
    return format_response(True, f"Found {len(data)} pending purchase orders.", data)

@tool_error_handler
async def get_completed_purchase_orders(limit: int = 50, session: AsyncSession = None) -> dict:
    """
    Get completed purchase orders.
    """
    stmt = (
        select(PurchaseOrder)
        .where(PurchaseOrder.status == 'Completed')
        .order_by(desc(PurchaseOrder.order_date))
        .limit(limit)
    )
    result = await session.execute(stmt)
    orders = result.scalars().all()
    
    data = [
        {
            "id": po.id,
            "supplier_id": po.supplier_id,
            "status": po.status,
            "order_date": str(po.order_date),
            "total_amount": float(po.total_amount)
        }
        for po in orders
    ]
    return format_response(True, f"Found {len(data)} completed purchase orders.", data)

@tool_error_handler
async def get_purchase_orders_by_supplier(supplier_id: str, limit: int = 50, session: AsyncSession = None) -> dict:
    """
    Get purchase orders for a specific supplier.
    """
    stmt = (
        select(PurchaseOrder)
        .where(PurchaseOrder.supplier_id == supplier_id)
        .order_by(desc(PurchaseOrder.order_date))
        .limit(limit)
    )
    result = await session.execute(stmt)
    orders = result.scalars().all()
    
    data = [
        {
            "id": po.id,
            "status": po.status,
            "order_date": str(po.order_date),
            "expected_delivery_date": str(po.expected_delivery_date) if po.expected_delivery_date else None,
            "total_amount": float(po.total_amount)
        }
        for po in orders
    ]
    return format_response(True, f"Found {len(data)} purchase orders for supplier.", data)

@tool_error_handler
async def get_recent_purchase_orders(limit: int = 10, session: AsyncSession = None) -> dict:
    """
    Get the most recent purchase orders.
    """
    stmt = (
        select(PurchaseOrder)
        .order_by(desc(PurchaseOrder.order_date))
        .limit(limit)
    )
    result = await session.execute(stmt)
    orders = result.scalars().all()
    
    data = [
        {
            "id": po.id,
            "supplier_id": po.supplier_id,
            "status": po.status,
            "order_date": str(po.order_date),
            "total_amount": float(po.total_amount)
        }
        for po in orders
    ]
    return format_response(True, "Recent purchase orders retrieved.", data)
