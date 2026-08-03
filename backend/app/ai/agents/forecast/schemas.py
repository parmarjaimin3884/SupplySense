"""
SupplySense — Demand Forecast Agent Schemas
Pydantic models for structured agent output.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class ProductDemandForecast(BaseModel):
    """
    Demand forecast detail for an individual product.
    """
    product_id: Optional[str] = Field(
        default=None,
        description="UUID of the product."
    )
    product_name: str = Field(
        description="Name of the product."
    )
    current_daily_sales: Optional[int] = Field(
        default=None,
        description="Current average daily sales volume."
    )
    predicted_demand: str = Field(
        description="Predicted demand outlook — e.g. 'Increasing', 'Stable', 'Declining', 'Seasonal Spike'."
    )
    forecast_period: Optional[str] = Field(
        default=None,
        description="Time period for the forecast — e.g. 'Next 30 days', 'Q4 2026', 'Diwali Season'."
    )
    estimated_units: Optional[int] = Field(
        default=None,
        description="Estimated number of units expected to be demanded in the forecast period."
    )
    seasonality_factor: Optional[float] = Field(
        default=None,
        description="Seasonality multiplier if applicable (e.g., 1.5 for festive surge)."
    )
    reasoning: str = Field(
        description="Data-backed explanation for the demand prediction."
    )


class DemandRecommendation(BaseModel):
    """
    A single actionable recommendation from the Demand Forecast Agent.
    """
    action: str = Field(
        description="Recommended action — e.g. 'Increase Procurement', 'Reduce Procurement', "
                    "'Transfer Inventory', 'Increase Safety Stock', 'Launch Promotion', 'Clear Dead Stock'."
    )
    product_name: Optional[str] = Field(
        default=None,
        description="Product this recommendation applies to."
    )
    rationale: str = Field(
        description="Data-backed reasoning for the recommendation."
    )
    priority: str = Field(
        description="Priority level — Low, Medium, High, Urgent."
    )


class ForecastAnalysisResponse(BaseModel):
    """
    Top-level structured output returned by the Demand Forecast Agent.
    """
    summary: str = Field(
        description="A clear, high-level summary of the demand landscape based on the user's question."
    )
    forecast: List[ProductDemandForecast] = Field(
        default_factory=list,
        description="Per-product demand forecasts."
    )
    predicted_demand: str = Field(
        description="Overall demand outlook — e.g. 'Growing', 'Stable', 'Declining', 'Mixed'."
    )
    high_demand_products: List[str] = Field(
        default_factory=list,
        description="Names of products with high or increasing demand."
    )
    low_demand_products: List[str] = Field(
        default_factory=list,
        description="Names of products with low, declining, or zero demand."
    )
    recommendations: List[DemandRecommendation] = Field(
        default_factory=list,
        description="Actionable business recommendations based on the forecast."
    )
    confidence: float = Field(
        description="Confidence score between 0.0 and 1.0 based on data completeness and consistency.",
        ge=0.0,
        le=1.0,
    )
