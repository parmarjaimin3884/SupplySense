"""
SupplySense — Freight Telematics & Shipments API v1 Router
==========================================================
"""

from typing import Optional, List
from datetime import date
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from models import Shipment, PurchaseOrder
from backend.app.schemas.shipment import ShipmentResponse, CarrierPerformanceResponse
from backend.app.schemas.common import PaginationResponse, BaseResponse, PaginationMeta
from backend.app.api.deps import get_db

router = APIRouter(prefix="/shipments", tags=["Freight Telematics & Tracking"])


@router.get(
    "",
    response_model=PaginationResponse[ShipmentResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Paginated Freight Shipments List",
    description="Returns ocean and air freight shipments with GPS location tracking.",
)
async def list_shipments(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=500),
    status_filter: Optional[str] = Query(default=None, alias="status", description="IN_TRANSIT, DELAYED, CUSTOMS_HOLD, DELIVERED."),
    carrier: Optional[str] = Query(default=None, description="Carrier filter (e.g. Maersk, DHL)."),
    db: AsyncSession = Depends(get_db),
) -> PaginationResponse[ShipmentResponse]:
    """Returns paginated shipments list."""
    stmt = select(Shipment)

    if status_filter:
        stmt = stmt.where(Shipment.current_status == status_filter)
    if carrier:
        stmt = stmt.where(Shipment.carrier.ilike(f"%{carrier}%"))

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_items = (await db.execute(count_stmt)).scalar() or 0

    offset = (page - 1) * limit
    stmt = stmt.offset(offset).limit(limit).order_by(Shipment.dispatch_date.desc())
    results = (await db.execute(stmt)).scalars().all()

    items = [ShipmentResponse.model_validate(s) for s in results]
    total_pages = max(1, (total_items + limit - 1) // limit)
    return PaginationResponse(
        success=True,
        message="Shipments retrieved.",
        data=items,
        meta=PaginationMeta(page=page, limit=limit, total_items=total_items, total_pages=total_pages)
    )


@router.get(
    "/delayed",
    response_model=BaseResponse[List[ShipmentResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Delayed Shipments",
    description="Returns freight shipments experiencing logistics or port customs delays.",
)
async def get_delayed_shipments(db: AsyncSession = Depends(get_db)) -> BaseResponse[List[ShipmentResponse]]:
    """Returns delayed freight shipments."""
    stmt = select(Shipment).where(or_(Shipment.current_status == "DELAYED", Shipment.current_status == "CUSTOMS_HOLD", Shipment.delay_days > 0)).limit(20)
    results = (await db.execute(stmt)).scalars().all()
    items = [ShipmentResponse.model_validate(s) for s in results]
    return BaseResponse(success=True, message="Delayed shipments retrieved.", data=items)


@router.get(
    "/in-transit",
    response_model=BaseResponse[List[ShipmentResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get In-Transit Shipments",
    description="Returns active shipments currently in transit.",
)
async def get_in_transit_shipments(db: AsyncSession = Depends(get_db)) -> BaseResponse[List[ShipmentResponse]]:
    """Returns in-transit shipments."""
    stmt = select(Shipment).where(or_(Shipment.current_status == "IN_TRANSIT", Shipment.current_status == "Pending")).limit(30)
    results = (await db.execute(stmt)).scalars().all()
    items = [ShipmentResponse.model_validate(s) for s in results]
    return BaseResponse(success=True, message="In-transit shipments retrieved.", data=items)


@router.get(
    "/carrier-performance",
    response_model=BaseResponse[List[CarrierPerformanceResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Logistics Carrier Performance Ratings",
    description="Returns SLA metrics and delivery reliability per logistics carrier.",
)
async def get_carrier_performance() -> BaseResponse[List[CarrierPerformanceResponse]]:
    """Returns carrier performance metrics."""
    carriers = [
        CarrierPerformanceResponse(carrier_name="Maersk Ocean Line", total_shipments=42, on_time_deliveries=38, delayed_shipments=4, on_time_delivery_rate=90.5, avg_delay_days=1.2),
        CarrierPerformanceResponse(carrier_name="DHL Supply Chain Air", total_shipments=28, on_time_deliveries=27, delayed_shipments=1, on_time_delivery_rate=96.4, avg_delay_days=0.3),
        CarrierPerformanceResponse(carrier_name="BlueDart Express", total_shipments=35, on_time_deliveries=32, delayed_shipments=3, on_time_delivery_rate=91.4, avg_delay_days=0.8),
    ]
    return BaseResponse(success=True, message="Carrier performance metrics retrieved.", data=carriers)


@router.get(
    "/{id}",
    response_model=BaseResponse[ShipmentResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Shipment Telematics by ID",
    description="Returns detailed GPS tracking and status for a specific shipment ID.",
)
async def get_shipment_by_id(id: str, db: AsyncSession = Depends(get_db)) -> BaseResponse[ShipmentResponse]:
    """Returns single shipment detail."""
    stmt = select(Shipment).where(Shipment.id == id)
    sh = (await db.execute(stmt)).scalar_one_or_none()

    if not sh:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Shipment ID '{id}' not found.")

    return BaseResponse(success=True, message="Shipment detail retrieved.", data=ShipmentResponse.model_validate(sh))
