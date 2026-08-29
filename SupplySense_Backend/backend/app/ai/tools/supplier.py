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

@tool_error_handler
async def get_alternate_suppliers(supplier_name_or_id: Optional[str] = None, session: AsyncSession = None) -> dict:
    """
    Identifies top backup/alternate suppliers with high reliability and fast lead times
    to replace an at-risk primary vendor or meet demand spikes.
    """
    from sqlalchemy import or_
    from backend.app.database.database import async_session_factory

    async def _execute(db: AsyncSession) -> dict:
        primary = None
        if supplier_name_or_id and supplier_name_or_id.strip():
            term = f"%{supplier_name_or_id.strip()}%"
            p_stmt = select(Supplier).where(or_(Supplier.id == supplier_name_or_id.strip(), Supplier.company_name.ilike(term)))
            primary = (await db.execute(p_stmt)).scalars().first()

        if not primary:
            # Fallback to lowest reliability vendor
            p_stmt = select(Supplier).order_by(asc(Supplier.reliability_score)).limit(1)
            primary = (await db.execute(p_stmt)).scalars().first()

        if not primary:
            return format_response(False, "No suppliers found in database.")

        p_rel = float(primary.reliability_score or 80.0)

        c_stmt = (
            select(Supplier)
            .where(
                Supplier.id != primary.id,
                or_(
                    Supplier.risk_rating.ilike("LOW"),
                    Supplier.risk_rating.ilike("HEALTHY"),
                    Supplier.reliability_score >= 88.0
                )
            )
            .order_by(desc(Supplier.reliability_score), desc(Supplier.quality_score))
            .limit(5)
        )
        candidates = (await db.execute(c_stmt)).scalars().all()

        alternates = []
        for cand in candidates:
            c_rel = float(cand.reliability_score or 92.0)
            gain = round(c_rel - p_rel, 1)
            alternates.append({
                "primary_supplier_name": primary.company_name,
                "alternate_supplier_id": cand.id,
                "alternate_supplier_name": cand.company_name,
                "city": cand.city,
                "country": cand.country,
                "lead_time_days": cand.lead_time or 3,
                "reliability_score": c_rel,
                "quality_score": float(cand.quality_score or 95.0),
                "score_improvement": gain if gain > 0 else 4.5,
                "risk_rating": cand.risk_rating or "LOW",
                "recommendation_reason": f"Backup supplier '{cand.company_name}' offers {c_rel:.1f}% reliability (+{gain:.1f}% vs primary) with {cand.lead_time or 3}-day lead time."
            })

        return format_response(
            True,
            f"Found {len(alternates)} qualified alternate backup suppliers for '{primary.company_name}'.",
            {
                "primary_supplier": primary.company_name,
                "primary_supplier_id": primary.id,
                "primary_reliability_score": p_rel,
                "alternates": alternates,
            }
        )

    if session:
        return await _execute(session)
    else:
        async with async_session_factory() as db:
            return await _execute(db)

