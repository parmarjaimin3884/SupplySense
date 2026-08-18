"""
SupplySense — Risk Analysis Agent Schemas
Pydantic models for structured risk assessment output.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class RiskFinding(BaseModel):
    """
    A single risk finding identified by cross-correlating upstream agent outputs.
    """
    risk_id: str = Field(
        description="Short identifier — e.g. 'RISK-001', 'RISK-INV-002'."
    )
    category: str = Field(
        description="Risk category — 'Inventory', 'Shipment', 'Supplier', 'Demand', "
                    "'Warehouse', 'Operational', 'Business Continuity', 'Stockout', "
                    "'Overstock', 'Procurement'."
    )
    severity: str = Field(
        description="Severity level — 'Very Low', 'Low', 'Medium', 'High', 'Critical'."
    )
    title: str = Field(
        description="Short, descriptive title of the risk."
    )
    description: str = Field(
        description="Detailed explanation of the risk with supporting evidence from agent findings."
    )
    source_agents: List[str] = Field(
        description="Which upstream agents contributed evidence — "
                    "e.g. ['Inventory Agent', 'Forecast Agent']."
    )
    business_impact: str = Field(
        description="Expected business impact if this risk materializes."
    )


class PriorityAction(BaseModel):
    """
    A prioritized action that operations should execute immediately.
    """
    rank: int = Field(
        description="Priority rank (1 = most urgent)."
    )
    action: str = Field(
        description="Recommended action — e.g. 'Emergency Procurement', 'Warehouse Transfer', "
                    "'Escalate Supplier', 'Increase Safety Stock', 'Delay Purchase', "
                    "'Alternative Supplier', 'Inventory Redistribution', 'Operational Escalation'."
    )
    target: Optional[str] = Field(
        default=None,
        description="The entity this action targets — product name, supplier name, or warehouse."
    )
    rationale: str = Field(
        description="Data-backed reasoning for why this action is prioritized."
    )
    urgency: str = Field(
        description="Urgency level — 'Immediate', 'Within 24 Hours', 'This Week', 'This Month'."
    )


class RiskRecommendation(BaseModel):
    """
    A strategic recommendation produced by correlating multiple risk findings.
    """
    action: str = Field(
        description="Recommended strategic action."
    )
    category: str = Field(
        description="Category — 'Emergency Procurement', 'Warehouse Transfer', "
                    "'Increase Safety Stock', 'Escalate Supplier', 'Delay Purchase', "
                    "'Increase Purchase', 'Alternative Supplier', 'Inventory Redistribution', "
                    "'Operational Escalation'."
    )
    target: Optional[str] = Field(
        default=None,
        description="Entity targeted by this recommendation."
    )
    rationale: str = Field(
        description="Justification backed by evidence from upstream agents."
    )
    priority: str = Field(
        description="Priority — 'Low', 'Medium', 'High', 'Urgent'."
    )


class RiskAnalysisResponse(BaseModel):
    """
    Top-level structured output returned by the Risk Analysis Agent.
    Represents the enterprise-level operational risk assessment.
    """
    summary: str = Field(
        description="Executive-level summary of the overall operational risk posture."
    )
    overall_risk: str = Field(
        description="Composite risk assessment narrative synthesizing all domains."
    )
    risk_level: str = Field(
        description="Overall risk level — 'Very Low', 'Low', 'Medium', 'High', 'Critical'."
    )
    critical_findings: List[RiskFinding] = Field(
        default_factory=list,
        description="All identified risk findings, ordered by severity."
    )
    affected_products: List[str] = Field(
        default_factory=list,
        description="Names of products affected by the identified risks."
    )
    affected_suppliers: List[str] = Field(
        default_factory=list,
        description="Names of suppliers contributing to risk."
    )
    affected_warehouses: List[str] = Field(
        default_factory=list,
        description="Warehouse names or IDs affected by operational risks."
    )
    recommendations: List[RiskRecommendation] = Field(
        default_factory=list,
        description="Strategic recommendations derived from cross-agent analysis."
    )
    priority_actions: List[PriorityAction] = Field(
        default_factory=list,
        description="Ranked list of immediate priority actions for operations."
    )
    confidence: float = Field(
        description="Confidence score between 0.0 and 1.0. Based on how many upstream "
                    "agents provided data and the consistency of their findings.",
        ge=0.0,
        le=1.0,
    )
