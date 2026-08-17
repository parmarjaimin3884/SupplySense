"""
SupplySense — Risk Intelligence API v1 Router
==============================================
"""

from typing import List
from datetime import date
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models import AIRiskAlert
from backend.app.schemas.risk import AIRiskAlertResponse, RiskSummaryResponse, RiskMatrixPoint
from backend.app.schemas.common import BaseResponse
from backend.app.api.deps import get_db

router = APIRouter(prefix="/risks", tags=["Supply Chain Risk Center"])


@router.get(
    "",
    response_model=BaseResponse[List[AIRiskAlertResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Supply Chain Risk Alerts List",
    description="Returns active and historical AI supply chain risk alerts.",
)
async def list_risks(db: AsyncSession = Depends(get_db)) -> BaseResponse[List[AIRiskAlertResponse]]:
    """Returns active risk alerts."""
    stmt = select(AIRiskAlert).order_by(AIRiskAlert.created_at.desc()).limit(30)
    alerts = (await db.execute(stmt)).scalars().all()
    items = [AIRiskAlertResponse.model_validate(a) for a in alerts]
    return BaseResponse(success=True, message="Risk alerts retrieved.", data=items)


@router.get(
    "/critical",
    response_model=BaseResponse[List[AIRiskAlertResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Critical Severity Risks",
    description="Returns risks categorized under CRITICAL severity.",
)
async def get_critical_risks(db: AsyncSession = Depends(get_db)) -> BaseResponse[List[AIRiskAlertResponse]]:
    """Returns critical severity alerts."""
    stmt = select(AIRiskAlert).where(AIRiskAlert.severity == "CRITICAL", AIRiskAlert.is_resolved == False).limit(20)
    alerts = (await db.execute(stmt)).scalars().all()
    items = [AIRiskAlertResponse.model_validate(a) for a in alerts]
    return BaseResponse(success=True, message="Critical risk alerts retrieved.", data=items)


@router.get(
    "/summary",
    response_model=BaseResponse[RiskSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get 3x3 Threat Matrix & Composite Risk Score",
    description="Returns composite network risk score out of 100 and 3x3 Likelihood vs Impact threat points.",
)
async def get_risk_summary() -> BaseResponse[RiskSummaryResponse]:
    """Returns 3x3 Threat Matrix summary."""
    points = [
        RiskMatrixPoint(id="risk-1", title="Semiconductor Lead Time Spike", domain="SUPPLIER", likelihood=3, impact=3, composite_score=85.0, root_cause="Raw material shortage in Taiwan fabrication plants.", recommended_action="Pivot 20% order allocation to backup European supplier."),
        RiskMatrixPoint(id="risk-2", title="Port Clearance Customs Delay", domain="SHIPMENT", likelihood=2, impact=3, composite_score=72.0, root_cause="Oakland port ocean freight queue congestion.", recommended_action="Reroute priority air freight via Seattle depot."),
        RiskMatrixPoint(id="risk-3", title="Smart TV Buffer Depletion", domain="INVENTORY", likelihood=3, impact=2, composite_score=68.0, root_cause="High daily sales velocity exceeding safety stock.", recommended_action="Auto-issue PO draft to Samsung Electronics."),
    ]
    summary = RiskSummaryResponse(
        overall_composite_risk_score=72.5,
        risk_level="HIGH",
        critical_threats_count=3,
        matrix_points=points
    )
    return BaseResponse(success=True, message="Risk summary retrieved.", data=summary)
