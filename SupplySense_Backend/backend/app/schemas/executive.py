"""
SupplySense — C-Suite Executive Pydantic v2 Schemas
====================================================
"""

from typing import List, Dict, Any, Optional
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class ExecutiveSummaryResponse(BaseModel):
    briefing_title: str = Field(default="C-Suite Executive Supply Chain Briefing", description="Briefing title.")
    executive_narrative: str = Field(..., description="High-level 2-minute strategic narrative.")
    top_strategic_risks: List[str] = Field(default_factory=list, description="Key strategic risks.")
    capital_at_risk: Decimal = Field(..., description="Dollar capital exposed to supply chain risk.")
    key_recommendations: List[str] = Field(default_factory=list, description="Priority C-suite actions.")


class BoardReportResponse(BaseModel):
    report_title: str = Field(default="Quarterly Board Supply Chain Intelligence Brief", description="Report title.")
    quarter: str = Field(..., description="Reporting quarter (e.g. 2026-Q3).")
    financial_exposure: Decimal = Field(..., description="Total financial exposure.")
    inventory_health_index: float = Field(..., description="Inventory health index %.")
    vendor_sla_compliance_rate: float = Field(..., description="Vendor SLA compliance %.")
    freight_on_time_rate: float = Field(..., description="Ocean & air freight on-time %.")
    strategic_action_items: List[Dict[str, Any]] = Field(default_factory=list, description="Board action items.")


class BusinessHealthResponse(BaseModel):
    composite_health_score: float = Field(..., description="Overall enterprise business health index (0-100).")
    status: str = Field(..., description="HEALTHY, STABLE, AT_RISK, CRITICAL.")
    domain_scores: Dict[str, float] = Field(..., description="Breakdown by Inventory, Supplier, Shipment, Forecast.")
