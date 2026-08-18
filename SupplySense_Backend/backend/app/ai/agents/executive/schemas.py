"""
SupplySense - Executive Summary Agent Schemas
Pydantic models for structured executive reporting output.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class CriticalIssue(BaseModel):
    """
    A single critical issue that management must be aware of.
    Written in plain business language, not technical jargon.
    """
    issue: str = Field(
        description="Clear, non-technical description of the critical issue."
    )
    impact: str = Field(
        description="Business impact in plain language "
                    "(e.g., 'Revenue at risk', 'Customer delivery delays')."
    )
    urgency: str = Field(
        description="Urgency level - 'Immediate', 'Today', 'This Week', 'This Month'."
    )


class ManagementRecommendation(BaseModel):
    """
    A single actionable recommendation for management.
    Written for a CEO or Operations Director audience.
    """
    action: str = Field(
        description="What management should do - clear, one-line directive."
    )
    reason: str = Field(
        description="Why this action matters, in business terms."
    )
    priority: str = Field(
        description="Priority level - 'Low', 'Medium', 'High', 'Urgent'."
    )
    owner: Optional[str] = Field(
        default=None,
        description="Suggested owner - e.g., 'Procurement Manager', "
                    "'Warehouse Manager', 'Operations Director'."
    )


class ExecutiveSummaryResponse(BaseModel):
    """
    Top-level structured output returned by the Executive Summary Agent.
    Designed for a 2-minute read by C-suite executives.
    """
    executive_summary: str = Field(
        description="A concise, 3-5 sentence executive summary of today's operational "
                    "status. Written for a CEO. No technical jargon."
    )
    overall_health: str = Field(
        description="Overall operational health label - 'Excellent', 'Good', "
                    "'Needs Attention', 'Concerning', 'Critical'."
    )
    todays_highlights: List[str] = Field(
        default_factory=list,
        description="Top 3-5 positive highlights or key facts for the day."
    )
    critical_issues: List[CriticalIssue] = Field(
        default_factory=list,
        description="Critical issues requiring management attention, ordered by urgency."
    )
    business_impact: str = Field(
        description="Plain-language summary of the overall business impact of current operations."
    )
    top_risks: List[str] = Field(
        default_factory=list,
        description="Top 3-5 risks in plain business language."
    )
    recommended_actions: List[ManagementRecommendation] = Field(
        default_factory=list,
        description="Actionable recommendations for management, ordered by priority."
    )
    immediate_priorities: List[str] = Field(
        default_factory=list,
        description="The top 3 things management should address immediately."
    )
    confidence: float = Field(
        description="Confidence score between 0.0 and 1.0 based on how much upstream "
                    "analysis was available.",
        ge=0.0,
        le=1.0,
    )
