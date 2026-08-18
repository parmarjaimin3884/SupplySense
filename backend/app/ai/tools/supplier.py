from typing import Optional
from sqlalchemy import select, desc, asc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from models import Supplier, PurchaseOrder, Shipment, SupplierPerformance
from backend.app.ai.tools.common import tool_error_handler, format_response

@tool_error_handler
async def get_supplier(supplier_id: str, session: AsyncSession = None) -> dict:
    """
    Get detailed information about a specific supplier.
    """
    stmt = select(Supplier).where(Supplier.id == supplier_id)
    result = await session.execute(stmt)
    supplier = result.scalar_one_or_none()
    
    if not supplier:
        return format_response(False, f"Supplier {supplier_id} not found.")
        
    data = {
        "id": supplier.id,
        "company_name": supplier.company_name,
        "contact_person": supplier.contact_person,
        "email": supplier.email,
        "phone": supplier.phone,
        "lead_time": supplier.lead_time,
        "moq": supplier.moq,
        "reliability_score": float(supplier.reliability_score) if supplier.reliability_score else None,
        "quality_score": float(supplier.quality_score) if supplier.quality_score else None,
        "risk_rating": supplier.risk_rating
    }
    return format_response(True, "Supplier details retrieved successfully.", data)

@tool_error_handler
async def get_supplier_orders(supplier_id: str, limit: int = 50, session: AsyncSession = None) -> dict:
    """
    Get all purchase orders for a specific supplier.
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
            "order_date": str(po.order_date),
            "expected_delivery_date": str(po.expected_delivery_date) if po.expected_delivery_date else None,
            "status": po.status,
            "total_amount": float(po.total_amount)
        }
        for po in orders
    ]
    return format_response(True, f"Found {len(data)} orders for supplier.", data)

@tool_error_handler
async def get_supplier_shipments(supplier_id: str, limit: int = 50, session: AsyncSession = None) -> dict:
    """
    Get all shipments associated with a specific supplier's purchase orders.
    """
    stmt = (
        select(Shipment)
        .join(PurchaseOrder)
        .where(PurchaseOrder.supplier_id == supplier_id)
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
            "expected_arrival": str(s.expected_arrival) if s.expected_arrival else None,
            "delay_days": s.delay_days
        }
        for s in shipments
    ]
    return format_response(True, f"Found {len(data)} shipments for supplier.", data)

@tool_error_handler
async def get_supplier_performance(supplier_id: str, limit: int = 12, session: AsyncSession = None) -> dict:
    """
    Get performance history (e.g. monthly KPIs) for a specific supplier.
    """
    stmt = (
        select(SupplierPerformance)
        .where(SupplierPerformance.supplier_id == supplier_id)
        .order_by(desc(SupplierPerformance.year), desc(SupplierPerformance.month))
        .limit(limit)
    )
    result = await session.execute(stmt)
    performances = result.scalars().all()
    
    data = [
        {
            "id": sp.id,
            "month": sp.month,
            "year": sp.year,
            "delivery_percentage": float(sp.delivery_percentage) if sp.delivery_percentage else None,
            "average_delay": float(sp.average_delay) if sp.average_delay else None,
            "complaint_count": sp.complaint_count,
            "quality_score": float(sp.quality_score) if sp.quality_score else None,
            "risk_score": float(sp.risk_score) if sp.risk_score else None
        }
        for sp in performances
    ]
    return format_response(True, "Supplier performance history retrieved.", data)

@tool_error_handler
async def get_supplier_reliability(supplier_id: str, session: AsyncSession = None) -> dict:
    """
    Get the reliability score of a specific supplier.
    """
    stmt = select(Supplier.reliability_score).where(Supplier.id == supplier_id)
    result = await session.execute(stmt)
    score = result.scalar()
    
    if score is None:
        return format_response(False, "Supplier not found or has no reliability score.")
        
    return format_response(True, "Supplier reliability retrieved.", {"reliability_score": float(score)})

@tool_error_handler
async def get_supplier_lead_time(supplier_id: str, session: AsyncSession = None) -> dict:
    """
    Get the standard lead time for a specific supplier.
    """
    stmt = select(Supplier.lead_time).where(Supplier.id == supplier_id)
    result = await session.execute(stmt)
    lead_time = result.scalar()
    
    if lead_time is None:
        return format_response(False, "Supplier not found or has no lead time set.")
        
    return format_response(True, "Supplier lead time retrieved.", {"lead_time_days": lead_time})

@tool_error_handler
async def get_best_suppliers(limit: int = 10, session: AsyncSession = None) -> dict:
    """
    Get top performing suppliers based on reliability and quality scores.
    """
    stmt = (
        select(Supplier)
        .order_by(desc(Supplier.reliability_score), desc(Supplier.quality_score))
        .limit(limit)
    )
    result = await session.execute(stmt)
    suppliers = result.scalars().all()
    
    data = [
        {
            "id": s.id,
            "company_name": s.company_name,
            "reliability_score": float(s.reliability_score) if s.reliability_score else None,
            "quality_score": float(s.quality_score) if s.quality_score else None
        }
        for s in suppliers
    ]
    return format_response(True, "Best suppliers retrieved successfully.", data)

@tool_error_handler
async def get_risky_suppliers(limit: int = 10, session: AsyncSession = None) -> dict:
    """
    Get the most risky suppliers based on risk rating or low reliability.
    """
    stmt = (
        select(Supplier)
        .order_by(asc(Supplier.reliability_score))
        .limit(limit)
    )
    result = await session.execute(stmt)
    suppliers = result.scalars().all()
    
    data = [
        {
            "id": s.id,
            "company_name": s.company_name,
            "risk_rating": s.risk_rating,
            "reliability_score": float(s.reliability_score) if s.reliability_score else None,
            "quality_score": float(s.quality_score) if s.quality_score else None
        }
        for s in suppliers
    ]
    return format_response(True, "Risky suppliers retrieved successfully.", data)
