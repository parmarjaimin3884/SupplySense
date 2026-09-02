"""
SupplySense — Risk Intelligence Pydantic v2 Schemas
====================================================
"""

from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field, ConfigDict


class AIRiskAlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Alert ID.")
    alert_type: str = Field(..., description="Alert domain category slug.")
    message: str = Field(..., description="Alert message.")
    severity: str = Field(..., description="CRITICAL, HIGH, MEDIUM, LOW.")
    created_at: date = Field(..., description="Alert creation date.")
    is_resolved: bool = Field(default=False, description="Resolution status.")
    product_name: Optional[str] = Field(default=None, description="Affected product name.")
    sku: Optional[str] = Field(default=None, description="Affected SKU.")
    supplier_name: Optional[str] = Field(default=None, description="Associated supplier.")
    warehouse_name: Optional[str] = Field(default="Surat Central Warehouse", description="Target facility.")
    impact_summary: Optional[str] = Field(default=None, description="Quantified risk impact summary.")


class RiskMatrixPoint(BaseModel):
    id: str = Field(..., description="Risk item ID.")
    title: str = Field(..., description="Short risk title.")
    domain: str = Field(..., description="INVENTORY, SHIPMENT, SUPPLIER, FORECAST.")
    likelihood: int = Field(..., ge=1, le=3, description="Likelihood score (1=Low, 2=Med, 3=High).")
    impact: int = Field(..., ge=1, le=3, description="Impact score (1=Low, 2=Med, 3=High).")
    composite_score: float = Field(..., description="Risk score out of 100.")
    root_cause: str = Field(..., description="Identified root cause.")
    recommended_action: str = Field(..., description="Prescribed mitigation action.")


class RiskSummaryResponse(BaseModel):
    overall_composite_risk_score: float = Field(..., description="Network composite risk score out of 100.")
    risk_level: str = Field(..., description="LOW, MODERATE, HIGH, SEVERE.")
    critical_threats_count: int = Field(..., description="Count of critical severity risks.")
    matrix_points: List[RiskMatrixPoint] = Field(default_factory=list, description="3x3 threat matrix points.")


class DemandAnomalyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_id: str = Field(..., description="Product ID.")
    product_name: str = Field(..., description="Product name.")
    sku: str = Field(..., description="SKU code.")
    warehouse_id: str = Field(..., description="Warehouse ID.")
    warehouse_name: str = Field(..., description="Warehouse name.")
    warehouse_code: str = Field(..., description="Warehouse code.")
    current_daily_sales: float = Field(..., description="Observed current daily sales consumption rate.")
    historical_mean: float = Field(..., description="30-day historical mean daily consumption rate (mu).")
    historical_std_dev: float = Field(..., description="Consumption standard deviation (sigma).")
    z_score: float = Field(..., description="Calculated statistical Z-score = (x - mu) / sigma.")
    spike_percentage: float = Field(..., description="Percentage surge above historical baseline.")
    available_quantity: int = Field(..., description="Available inventory count.")
    stockout_days_remaining: float = Field(..., description="Estimated days until total stockout at current surge rate.")
    recommended_buffer_increase: int = Field(..., description="Recommended safety buffer expansion in units.")
    severity: str = Field(default="HIGH", description="CRITICAL if Z >= 3.0 else HIGH.")
    anomaly_reason: str = Field(..., description="Statistical explanation of the consumption surge.")


class BufferAdjustmentRequest(BaseModel):
    product_id: str = Field(..., description="Product ID.")
    warehouse_id: str = Field(..., description="Warehouse ID.")
    additional_buffer_units: int = Field(..., ge=1, description="Number of additional safety buffer units to allocate.")
    reason: Optional[str] = Field(default=None, description="Reason for buffer expansion.")

