"""
SupplySense — Dashboard Pydantic v2 Schemas
============================================
"""

from typing import List, Dict, Any, Optional
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class DashboardSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_inventory_value: Decimal = Field(..., description="Total dollar valuation of on-hand stock.")
    stockout_risk_count: int = Field(..., description="SKUs currently in CRITICAL or LOW_STOCK state.")
    active_shipments_count: int = Field(..., description="Active in-transit ocean and air freight shipments.")
    supplier_risk_count: int = Field(..., description="Suppliers in HIGH_RISK or CRITICAL rating tier.")
    forecast_accuracy_pct: float = Field(..., description="Composite 30-day demand forecast accuracy %.")
    critical_alerts_count: int = Field(..., description="Unresolved AI risk alerts.")
    avg_warehouse_utilization_pct: float = Field(..., description="Average utilization % across distribution hubs.")
    open_purchase_orders_count: int = Field(..., description="Pending or approved open purchase orders.")


class KPICardResponse(BaseModel):
    id: str = Field(..., description="KPI identifier.")
    title: str = Field(..., description="Display title.")
    metric_value: str = Field(..., description="Formated metric display value.")
    trend_percentage: float = Field(..., description="Percentage change (+/-).")
    trend_direction: str = Field(..., description="UP, DOWN, STABLE.")
    status_badge: str = Field(..., description="HEALTHY, WARNING, CRITICAL.")


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Alert ID.")
    alert_type: str = Field(..., description="Risk category slug.")
    message: str = Field(..., description="Alert detail text.")
    severity: str = Field(..., description="CRITICAL, HIGH, MEDIUM, LOW.")
    created_at: str = Field(..., description="ISO creation date.")
    is_resolved: bool = Field(default=False, description="Resolution status.")
