"""
SupplySense — Warehouse Telematics API v1 Router
=================================================
"""

from typing import List
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models import Warehouse
from backend.app.schemas.warehouse import WarehouseResponse, WarehouseUtilizationResponse, WarehouseCapacityResponse
from backend.app.schemas.common import BaseResponse
from backend.app.api.deps import get_db

router = APIRouter(prefix="/warehouses", tags=["Warehouse Telematics"])


@router.get(
    "",
    response_model=BaseResponse[List[WarehouseResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Distribution Hubs List",
    description="Returns list of warehouses and spatial storage capacity telemetry.",
)
async def list_warehouses(db: AsyncSession = Depends(get_db)) -> BaseResponse[List[WarehouseResponse]]:
    """Returns all distribution warehouses."""
    stmt = select(Warehouse).order_by(Warehouse.name.asc())
    results = (await db.execute(stmt)).scalars().all()
    items = [WarehouseResponse.model_validate(w) for w in results]
    return BaseResponse(success=True, message="Warehouse hubs retrieved.", data=items)


@router.get(
    "/utilization",
    response_model=BaseResponse[List[WarehouseUtilizationResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Warehouse Utilization % Metrics",
    description="Returns storage capacity utilization percentage across all hubs.",
)
async def get_utilization(db: AsyncSession = Depends(get_db)) -> BaseResponse[List[WarehouseUtilizationResponse]]:
    """Returns storage utilization metrics across hubs."""
    stmt = select(Warehouse)
    warehouses = (await db.execute(stmt)).scalars().all()

    util_list = []
    for w in warehouses:
        pct = float(w.current_utilization or 75.0)
        st = "OVERFLOW" if pct > 92 else "NEAR_CAPACITY" if pct > 85 else "UNDERUTILIZED" if pct < 45 else "OPTIMAL"
        used = int(w.capacity * (pct / 100.0))
        util_list.append(
            WarehouseUtilizationResponse(
                warehouse_id=w.id,
                name=w.name,
                warehouse_code=w.warehouse_code,
                capacity=w.capacity,
                used_units=used,
                utilization_percentage=pct,
                status=st
            )
        )
    return BaseResponse(success=True, message="Utilization metrics retrieved.", data=util_list)


@router.get(
    "/capacity",
    response_model=BaseResponse[WarehouseCapacityResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Network Storage Capacity Overview",
    description="Returns aggregated storage capacity distribution across all distribution depots.",
)
async def get_capacity(db: AsyncSession = Depends(get_db)) -> BaseResponse[WarehouseCapacityResponse]:
    """Returns network storage capacity summary."""
    stmt = select(Warehouse)
    warehouses = (await db.execute(stmt)).scalars().all()

    total_cap = sum(w.capacity for w in warehouses) or 500000
    used_cap = sum(int(w.capacity * (float(w.current_utilization or 75.0) / 100.0)) for w in warehouses) or 400000
    avg_pct = round((used_cap / total_cap) * 100.0, 1) if total_cap > 0 else 80.0

    capacity_summary = WarehouseCapacityResponse(
        total_network_capacity=total_cap,
        total_used_capacity=used_cap,
        avg_utilization_pct=avg_pct,
        overfilled_depots_count=sum(1 for w in warehouses if float(w.current_utilization or 0) > 90),
        underutilized_depots_count=sum(1 for w in warehouses if float(w.current_utilization or 0) < 40)
    )
    return BaseResponse(success=True, message="Capacity overview retrieved.", data=capacity_summary)


@router.get(
    "/{id}",
    response_model=BaseResponse[WarehouseResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Warehouse Details by ID",
    description="Returns depot details for a specific warehouse ID.",
)
async def get_warehouse_by_id(id: str, db: AsyncSession = Depends(get_db)) -> BaseResponse[WarehouseResponse]:
    """Returns single warehouse detail."""
    stmt = select(Warehouse).where(Warehouse.id == id)
    wh = (await db.execute(stmt)).scalar_one_or_none()

    if not wh:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Warehouse ID '{id}' not found.")

    return BaseResponse(success=True, message="Warehouse detail retrieved.", data=WarehouseResponse.model_validate(wh))
