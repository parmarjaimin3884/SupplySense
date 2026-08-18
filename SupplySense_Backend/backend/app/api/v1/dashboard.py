"""
SupplySense — Dashboard API v1 Router
====================================
"""

from typing import List
from decimal import Decimal
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from backend.app.schemas.dashboard import DashboardSummaryResponse, KPICardResponse, AlertResponse
from backend.app.schemas.common import BaseResponse
from backend.app.api.deps import get_db, get_current_user

router = APIRouter(prefix="/dashboard", tags=["Executive Dashboard"])


@router.get(
    "/summary",
    response_model=BaseResponse[DashboardSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Executive Dashboard Summary",
    description="Returns high-level supply chain telemetry metrics.",
)
async def get_summary(db: AsyncSession = Depends(get_db)) -> BaseResponse[DashboardSummaryResponse]:
    """Returns dashboard summary indicators."""
    summary = DashboardSummaryResponse(
        total_inventory_value=Decimal("14250890.50"),
        stockout_risk_count=14,
        active_shipments_count=18,
        supplier_risk_count=6,
        forecast_accuracy_pct=94.2,
        critical_alerts_count=3,
        avg_warehouse_utilization_pct=81.5,
        open_purchase_orders_count=12,
    )
    return BaseResponse(success=True, message="Dashboard summary retrieved.", data=summary)


@router.get(
    "/kpis",
    response_model=BaseResponse[List[KPICardResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get KPI Telemetry Cards",
    description="Returns list of telemetry KPI cards with trend percentages.",
)
async def get_kpis() -> BaseResponse[List[KPICardResponse]]:
    """Returns telemetry KPI cards."""
    kpis = [
        KPICardResponse(id="kpi-1", title="Total Inventory Value", metric_value="$14.25M", trend_percentage=4.2, trend_direction="UP", status_badge="HEALTHY"),
        KPICardResponse(id="kpi-2", title="Stockout Vulnerability", metric_value="14 SKUs", trend_percentage=-8.5, trend_direction="DOWN", status_badge="WARNING"),
        KPICardResponse(id="kpi-3", title="Active In-Transit Freight", metric_value="18 Shipments", trend_percentage=2.1, trend_direction="UP", status_badge="HEALTHY"),
        KPICardResponse(id="kpi-4", title="Supplier Risk Exposure", metric_value="6 Vendors", trend_percentage=12.0, trend_direction="UP", status_badge="CRITICAL"),
        KPICardResponse(id="kpi-5", title="Demand Forecast Accuracy", metric_value="94.2%", trend_percentage=1.4, trend_direction="UP", status_badge="HEALTHY"),
    ]
    return BaseResponse(success=True, message="KPI cards retrieved.", data=kpis)


@router.get(
    "/alerts",
    response_model=BaseResponse[List[AlertResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Real-Time Critical Supply Chain Alerts",
    description="Returns live active alerts requiring operational attention.",
)
async def get_alerts() -> BaseResponse[List[AlertResponse]]:
    """Returns active risk alerts."""
    alerts = [
        AlertResponse(id="alt-101", alert_type="INVENTORY", message="MacBook Pro M4 stock level breached critical safety threshold in Surat warehouse.", severity="CRITICAL", created_at="2026-08-16T10:30:00Z", is_resolved=False),
        AlertResponse(id="alt-102", alert_type="SHIPMENT", message="Ocean vessel MV-Maersk Star customs delay +4 days at Oakland Port.", severity="HIGH", created_at="2026-08-16T11:15:00Z", is_resolved=False),
        AlertResponse(id="alt-103", alert_type="SUPPLIER", message="EuroPower Lithium on-time delivery score dropped below 75% penalty threshold.", severity="HIGH", created_at="2026-08-16T12:00:00Z", is_resolved=False),
    ]
    return BaseResponse(success=True, message="Active alerts retrieved.", data=alerts)
