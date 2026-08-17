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
