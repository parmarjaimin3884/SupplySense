"""
SupplySense — Supplier Intelligence Pydantic v2 Schemas
========================================================
"""

from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class SupplierResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Supplier ID.")
    company_name: str = Field(..., description="Company name.")
    city: Optional[str] = Field(default=None, description="City.")
    country: Optional[str] = Field(default=None, description="Country.")
    contact_person: Optional[str] = Field(default=None, description="Contact person.")
    email: Optional[str] = Field(default=None, description="Email address.")
    phone: Optional[str] = Field(default=None, description="Phone number.")
    lead_time: Optional[int] = Field(default=0, description="Lead time in days.")
    payment_terms: Optional[str] = Field(default=None, description="Payment terms.")
    reliability_score: Optional[Decimal] = Field(default=Decimal("90.0"), description="Reliability score (0-100).")
    quality_score: Optional[Decimal] = Field(default=Decimal("90.0"), description="Quality score (0-100).")
    risk_rating: str = Field(default="LOW", description="LOW, MODERATE, HIGH_RISK, CRITICAL.")
    average_delay: Optional[Decimal] = Field(default=Decimal("0.0"), description="Average delivery delay in days.")


class SupplierPerformanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Performance record ID.")
    supplier_id: str = Field(..., description="Supplier ID.")
    supplier_name: Optional[str] = Field(default=None, description="Supplier name.")
    month: int = Field(..., description="Month (1-12).")
    year: int = Field(..., description="Year.")
    delivery_percentage: Decimal = Field(..., description="On-time delivery %.")
    average_delay: Decimal = Field(..., description="Avg delay in days.")
    complaint_count: int = Field(..., description="Number of reported quality complaints.")
    quality_score: Decimal = Field(..., description="Quality score.")
    risk_score: Decimal = Field(..., description="Risk composite score.")


class SupplierScorecardResponse(BaseModel):
    supplier_id: str = Field(..., description="Supplier ID.")
    company_name: str = Field(..., description="Supplier company name.")
    overall_grade: str = Field(..., description="A+, A, B, C, F.")
    on_time_delivery_rate: float = Field(..., description="Delivery SLA compliance %.")
    quality_defect_rate: float = Field(..., description="Defect rate %.")
    lead_time_compliance: float = Field(..., description="Lead time SLA adherence %.")
    active_po_count: int = Field(..., description="Count of open purchase orders.")
