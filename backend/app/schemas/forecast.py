"""
SupplySense — Demand Forecasting Pydantic v2 Schemas
=====================================================
"""

from typing import Optional, List
from datetime import date as DateType
from pydantic import BaseModel, Field, ConfigDict


class DemandPointSchema(BaseModel):
    date: DateType = Field(..., description="Target forecast date.")
    actual_demand: Optional[int] = Field(default=None, description="Historical actual demand.")
    forecasted_demand: int = Field(..., description="AI projected demand.")
    lower_bound_95: int = Field(..., description="95% confidence lower bound.")
    upper_bound_95: int = Field(..., description="95% confidence upper bound.")


class DemandForecastResponse(BaseModel):
    product_id: str = Field(..., description="Product ID.")
    product_name: str = Field(..., description="Product name.")
    sku: str = Field(..., description="SKU code.")
    category_name: Optional[str] = Field(default=None, description="Category.")
    forecast_points: List[DemandPointSchema] = Field(default_factory=list, description="Monthly forecast series.")
    trend: str = Field(default="UPWARD", description="UPWARD, DOWNWARD, STABLE, SEASONAL.")


class ForecastAccuracyResponse(BaseModel):
    mape: float = Field(..., description="Mean Absolute Percentage Error (MAPE %).")
    rmse: float = Field(..., description="Root Mean Squared Error.")
    overall_accuracy_pct: float = Field(..., description="30-day forecast accuracy %.")
    evaluated_skus_count: int = Field(..., description="Count of SKUs evaluated.")
