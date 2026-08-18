from typing import Optional
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date

from models import Shipment, PurchaseOrder, Supplier, Warehouse
from backend.app.ai.tools.common import tool_error_handler, format_response

@tool_error_handler
async def get_all_shipments(limit: int = 50, session: AsyncSession = None) -> dict:
    """
    Get all shipments with basic info.
    """
    stmt = select(Shipment).limit(limit)
    result = await session.execute(stmt)
    shipments = result.scalars().all()
    
    data = [
        {
            "id": s.id,
            "purchase_order_id": s.purchase_order_id,
            "carrier": s.carrier,
            "current_status": s.current_status,
            "current_location": s.current_location,
            "expected_arrival": str(s.expected_arrival) if s.expected_arrival else None
        }
        for s in shipments
    ]
    return format_response(True, "Shipments retrieved successfully.", data)

@tool_error_handler
async def get_shipment(shipment_id: str, session: AsyncSession = None) -> dict:
    """
    Get detailed information about a specific shipment.
    """
    stmt = (
        select(Shipment)
        .options(selectinload(Shipment.purchase_order))
        .where(Shipment.id == shipment_id)
    )
    result = await session.execute(stmt)
    shipment = result.scalar_one_or_none()
    
    if not shipment:
        return format_response(False, f"Shipment {shipment_id} not found.")
        
    data = {
        "id": shipment.id,
        "purchase_order_id": shipment.purchase_order_id,
        "po_status": shipment.purchase_order.status if shipment.purchase_order else None,
        "carrier": shipment.carrier,
        "vehicle_number": shipment.vehicle_number,
        "current_status": shipment.current_status,
        "current_location": shipment.current_location,
        "dispatch_date": str(shipment.dispatch_date) if shipment.dispatch_date else None,
        "expected_arrival": str(shipment.expected_arrival) if shipment.expected_arrival else None,
        "actual_arrival": str(shipment.actual_arrival) if shipment.actual_arrival else None,
        "delay_days": shipment.delay_days,
        "delay_reason": shipment.delay_reason
    }
    return format_response(True, "Shipment details retrieved.", data)

@tool_error_handler
async def get_delayed_shipments(session: AsyncSession = None) -> dict:
    """
    Get all shipments that are delayed.
    """
    stmt = (
        select(Shipment)
        .where(Shipment.delay_days > 0)
        .where(Shipment.current_status != 'Delivered')
    )
    result = await session.execute(stmt)
    shipments = result.scalars().all()
    
    data = [
        {
            "id": s.id,
            "purchase_order_id": s.purchase_order_id,
            "current_status": s.current_status,
            "expected_arrival": str(s.expected_arrival) if s.expected_arrival else None,
            "delay_days": s.delay_days,
            "delay_reason": s.delay_reason
        }
        for s in shipments
    ]
    return format_response(True, f"Found {len(data)} delayed shipments.", data)

@tool_error_handler
async def get_pending_shipments(session: AsyncSession = None) -> dict:
    """
    Get all shipments that have not yet been delivered.
    """
    stmt = (
        select(Shipment)
        .where(Shipment.current_status.in_(['Pending', 'In Transit', 'Dispatched']))
    )
    result = await session.execute(stmt)
    shipments = result.scalars().all()
    
    data = [
        {
            "id": s.id,
            "purchase_order_id": s.purchase_order_id,
            "carrier": s.carrier,
            "current_status": s.current_status,
            "expected_arrival": str(s.expected_arrival) if s.expected_arrival else None
        }
        for s in shipments
    ]
    return format_response(True, f"Found {len(data)} pending shipments.", data)

@tool_error_handler
async def get_shipments_by_supplier(supplier_id: str, session: AsyncSession = None) -> dict:
    """
    Get all shipments originating from a specific supplier.
    """
    stmt = (
        select(Shipment)
        .join(PurchaseOrder)
        .where(PurchaseOrder.supplier_id == supplier_id)
    )
    result = await session.execute(stmt)
    shipments = result.scalars().all()
    
    data = [
        {
            "id": s.id,
            "purchase_order_id": s.purchase_order_id,
            "current_status": s.current_status,
            "dispatch_date": str(s.dispatch_date) if s.dispatch_date else None,
            "expected_arrival": str(s.expected_arrival) if s.expected_arrival else None
        }
        for s in shipments
    ]
    return format_response(True, f"Found {len(data)} shipments for supplier.", data)

@tool_error_handler
async def get_shipments_by_warehouse(warehouse_id: str, session: AsyncSession = None) -> dict:
    """
    Get all shipments destined for a specific warehouse.
    """
    stmt = (
        select(Shipment)
        .join(PurchaseOrder)
        .where(PurchaseOrder.warehouse_id == warehouse_id)
    )
    result = await session.execute(stmt)
    shipments = result.scalars().all()
    
    data = [
        {
            "id": s.id,
            "purchase_order_id": s.purchase_order_id,
            "current_status": s.current_status,
            "expected_arrival": str(s.expected_arrival) if s.expected_arrival else None,
            "delay_days": s.delay_days
        }
        for s in shipments
    ]
    return format_response(True, f"Found {len(data)} shipments for warehouse.", data)

@tool_error_handler
async def get_recent_shipments(limit: int = 10, session: AsyncSession = None) -> dict:
    """
    Get the most recently dispatched shipments.
    """
    stmt = (
        select(Shipment)
        .where(Shipment.dispatch_date != None)
        .order_by(desc(Shipment.dispatch_date))
        .limit(limit)
    )
    result = await session.execute(stmt)
    shipments = result.scalars().all()
    
    data = [
        {
            "id": s.id,
            "purchase_order_id": s.purchase_order_id,
            "current_status": s.current_status,
            "dispatch_date": str(s.dispatch_date) if s.dispatch_date else None
        }
        for s in shipments
    ]
    return format_response(True, "Recent shipments retrieved.", data)

@tool_error_handler
async def calculate_average_delay(session: AsyncSession = None) -> dict:
    """
    Calculate the average delay of all shipments in days.
    """
    stmt = select(func.avg(Shipment.delay_days).label("avg_delay")).where(Shipment.delay_days > 0)
    result = await session.execute(stmt)
    avg_delay = result.scalar() or 0.0
    
    return format_response(True, "Average shipment delay calculated.", {"average_delay_days": float(avg_delay)})
