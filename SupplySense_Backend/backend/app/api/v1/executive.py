"""
SupplySense — C-Suite Executive API v1 Router
==============================================
Restricted C-suite briefings and board reports accessible only by CSCO_EXECUTIVE role.
"""

from decimal import Decimal
from fastapi import APIRouter, Depends, status

from backend.app.schemas.executive import ExecutiveSummaryResponse, BoardReportResponse, BusinessHealthResponse
from backend.app.schemas.common import BaseResponse
from backend.app.api.deps import require_role
from backend.app.schemas.auth import UserResponse

router = APIRouter(prefix="/executive", tags=["C-Suite Executive Briefings"])


@router.get(
    "/summary",
    response_model=BaseResponse[ExecutiveSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get 2-Minute C-Suite Executive Briefing",
    description="Returns high-level strategic narrative and capital risk exposure. Restricted to CSCO_EXECUTIVE.",
)
async def get_executive_summary(
    current_user: UserResponse = Depends(require_role("CSCO_EXECUTIVE"))
) -> BaseResponse[ExecutiveSummaryResponse]:
    """Returns 2-minute strategic C-suite narrative."""
    summary = ExecutiveSummaryResponse(
        briefing_title="C-Suite Executive Supply Chain Briefing (2026-Q3)",
        executive_narrative="Overall enterprise supply chain resilience remains STABLE at 81.5% health score. Primary capital exposure (₹1.42 Cr) stems from semiconductor lead-time extensions (+4 days) and ocean port congestion at Oakland. Immediate PO approval for depleted MacBook Pro M4 stock is recommended to protect Q3 retail revenue targets.",
        top_strategic_risks=[
            "Semiconductor component shortage impacting laptop manufacturing lead times (+4 days).",
            "Ocean freight customs bottleneck at Oakland Port exposing ₹45 Lakh in delay penalties.",
            "Surat warehouse capacity reaching 88% due to slow-moving legacy SKU accumulation."
        ],
        capital_at_risk=Decimal("14250000.00"),
        key_recommendations=[
            "Authorize ₹32 Lakh Purchase Order for high-demand laptop replenishment.",
            "Reallocate 20% order volume to backup European component supplier Apex Semi.",
            "Initiate inter-depot stock transfer of 150 units from Surat to Mumbai distribution hub."
        ]
    )
    return BaseResponse(success=True, message="Executive summary retrieved.", data=summary)


@router.get(
    "/board-report",
    response_model=BaseResponse[BoardReportResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Quarterly Board Report Brief",
    description="Returns strategic board deck analytics. Restricted to CSCO_EXECUTIVE.",
)
async def get_board_report(
    current_user: UserResponse = Depends(require_role("CSCO_EXECUTIVE"))
) -> BaseResponse[BoardReportResponse]:
    """Returns quarterly board report."""
    report = BoardReportResponse(
        report_title="Quarterly Board Supply Chain Intelligence Brief",
        quarter="2026-Q3",
        financial_exposure=Decimal("1425000.00"),
        inventory_health_index=88.4,
        vendor_sla_compliance_rate=92.1,
        freight_on_time_rate=90.5,
        strategic_action_items=[
            {"item": "Multi-sourcing initiative for tier-1 semiconductor vendors", "status": "IN_PROGRESS", "target_date": "2026-09-30"},
            {"item": "Warehouse automation & spatial rebalancing across 50 hubs", "status": "APPROVED", "target_date": "2026-10-15"},
        ]
    )
    return BaseResponse(success=True, message="Board report retrieved.", data=report)


@router.get(
    "/business-health",
    response_model=BaseResponse[BusinessHealthResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Enterprise Business Health Index",
    description="Returns composite business health score across domain dimensions. Restricted to CSCO_EXECUTIVE.",
)
async def get_business_health(
    current_user: UserResponse = Depends(require_role("CSCO_EXECUTIVE"))
) -> BaseResponse[BusinessHealthResponse]:
    """Returns composite enterprise business health index."""
    health = BusinessHealthResponse(
        composite_health_score=84.5,
        status="STABLE",
        domain_scores={
            "inventory_health": 88.4,
            "supplier_reliability": 92.1,
            "freight_telematics": 90.5,
            "demand_forecast_accuracy": 94.2,
            "risk_mitigation": 72.5
        }
    )
    return BaseResponse(success=True, message="Business health index retrieved.", data=health)
