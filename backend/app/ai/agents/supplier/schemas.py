"""
SupplySense — Supplier Intelligence Agent Schemas
Pydantic models for structured agent output.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class SupplierHealthDetail(BaseModel):
    """
    Detailed health assessment for an individual supplier.
    """
    supplier_id: Optional[str] = Field(
        default=None,
        description="UUID of the supplier."
    )
    company_name: str = Field(
        description="Name of the supplier company."
    )
    reliability_score: Optional[float] = Field(
        default=None,
        description="Reliability score (0-100)."
    )
    quality_score: Optional[float] = Field(
        default=None,
        description="Quality score (0-100)."
    )
    lead_time_days: Optional[int] = Field(
        default=None,
        description="Standard lead time in days."
    )
    average_delay_days: Optional[float] = Field(
        default=None,
        description="Average shipment delay in days."
    )
    delivery_percentage: Optional[float] = Field(
        default=None,
        description="On-time delivery percentage from the most recent performance period."
    )
    risk_rating: Optional[str] = Field(
        default=None,
        description="Risk classification: Low, Medium, High, Critical."
    )
    health_verdict: str = Field(
        description="Short textual verdict — e.g. 'Healthy', 'Degrading', 'At Risk', 'Critical'."
    )


class SupplierRiskAssessment(BaseModel):
    """
    A single risk finding tied to a specific supplier.
    """
    supplier_name: str = Field(
        description="Company name of the affected supplier."
    )
    risk_category: str = Field(
        description="Category of risk — e.g. 'Delivery', 'Quality', 'Lead Time', 'Fulfillment', 'Financial'."
    )
    severity: str = Field(
        description="Severity level — Low, Medium, High, Critical."
    )
    description: str = Field(
        description="Detailed explanation of the risk with supporting evidence."
    )


class SupplierRecommendation(BaseModel):
    """
    A single actionable recommendation from the agent.
    """
    action: str = Field(
        description="The recommended action — e.g. 'Switch Supplier', 'Escalate', 'Increase Rating', "
                    "'Decrease Procurement', 'Emergency Procurement', 'Multi-Supplier Strategy'."
    )
    supplier_name: Optional[str] = Field(
        default=None,
        description="Supplier this recommendation targets."
    )
    rationale: str = Field(
        description="Why this action is recommended, backed by data."
    )
    priority: str = Field(
        description="Priority level — Low, Medium, High, Urgent."
    )


class SupplierAnalysisResponse(BaseModel):
    """
    Top-level structured output returned by the Supplier Intelligence Agent.
    """
    summary: str = Field(
        description="A clear, high-level summary of the supplier landscape based on the user's question."
    )
    supplier_health: List[SupplierHealthDetail] = Field(
        default_factory=list,
        description="Per-supplier health assessments."
    )
    best_suppliers: List[str] = Field(
        default_factory=list,
        description="Names of the top-performing suppliers."
    )
    risky_suppliers: List[str] = Field(
        default_factory=list,
        description="Names of suppliers flagged as risky."
    )
    risk_assessments: List[SupplierRiskAssessment] = Field(
        default_factory=list,
        description="Detailed risk findings across suppliers."
    )
    recommendations: List[SupplierRecommendation] = Field(
        default_factory=list,
        description="Actionable business recommendations."
    )
    confidence: float = Field(
        description="Confidence score between 0.0 and 1.0 based on data completeness and consistency.",
        ge=0.0,
        le=1.0
    )
