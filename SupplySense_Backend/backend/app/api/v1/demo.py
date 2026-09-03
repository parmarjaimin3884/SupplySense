"""
SupplySense — Cloud Demo & Live ERP Simulation API Router
==========================================================
Provides management endpoints for live presentation simulations, on-demand event triggers,
and baseline data reset.
"""

from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, status, Body

from backend.app.schemas.common import BaseResponse
from backend.app.services.erp_simulator import (
    start_simulation,
    stop_simulation,
    get_simulation_status,
    trigger_event,
    reset_demo_baseline,
)

router = APIRouter(prefix="/demo", tags=["Demo & Simulation Controls"])


class TriggerEventRequest(BaseModel):
    event_type: Optional[str] = Field(
        default="random",
        description="Type of event: 'SALES_DISPATCH', 'SHIPMENT_TRANSIT', 'STOCK_INFLOW', 'ROP_CHECK', or 'random'",
    )


class StartSimulationRequest(BaseModel):
    interval_seconds: Optional[float] = Field(
        default=6.0,
        ge=1.0,
        le=60.0,
        description="Interval in seconds between simulation events",
    )


@router.get(
    "/status",
    summary="Get Simulation Feed Status",
    description="Returns whether the background live ERP feed is running, the interval, and recent event logs.",
)
async def get_status():
    status_data = get_simulation_status()
    return BaseResponse(
        success=True,
        message="Simulator status retrieved.",
        data=status_data,
    )


@router.post(
    "/start",
    summary="Start Live Simulation Feed",
    description="Starts the background continuous ERP transaction loop.",
)
async def start_feed(payload: Optional[StartSimulationRequest] = Body(default=None)):
    interval = payload.interval_seconds if payload else 6.0
    start_simulation(interval_seconds=interval)
    return BaseResponse(
        success=True,
        message=f"Live ERP simulation feed active (Event interval: {interval}s).",
        data=get_simulation_status(),
    )


@router.post(
    "/stop",
    summary="Pause Live Simulation Feed",
    description="Pauses the background continuous ERP transaction loop.",
)
async def stop_feed():
    stop_simulation()
    return BaseResponse(
        success=True,
        message="Live ERP simulation feed paused.",
        data=get_simulation_status(),
    )


@router.post(
    "/trigger",
    summary="Trigger On-Demand Supply Chain Event",
    description="Immediately fires a customer order, truck GPS movement, dock receipt, or safety buffer check.",
)
async def trigger_single_event(payload: Optional[TriggerEventRequest] = Body(default=None)):
    event_type = payload.event_type if payload else "random"
    event_result = await trigger_event(event_type=event_type)
    return BaseResponse(
        success=True,
        message=f"Event '{event_result.get('event_type')}' triggered successfully.",
        data=event_result,
    )


@router.post(
    "/reset",
    summary="Reset Baseline Demo Data",
    description="Restores inventory stock levels and shipment statuses back to clean starting defaults.",
)
async def reset_data():
    res = await reset_demo_baseline()
    return BaseResponse(
        success=res.get("success", True),
        message=res.get("message", "Demo data reset."),
        data=res,
    )
