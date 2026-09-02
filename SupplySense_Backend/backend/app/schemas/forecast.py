"""
SupplySense — Demand Forecasting Pydantic v2 Schemas
=====================================================
"""

from typing import Optional, List, Dict, Any
from datetime import date as DateType
from pydantic import BaseModel, Field


class DemandPointSchema(BaseModel):
    date: DateType = Field(..., description="Target forecast date.")
    actual_demand: Optional[int] = Field(default=None, description="Historical actual demand.")
    forecasted_demand: int = Field(..., description="AI projected demand.")
    lower_bound_95: int = Field(..., description="95% confidence lower bound (P10).")
    upper_bound_95: int = Field(..., description="95% confidence upper bound (P90).")


class MonthlyDemandPoint(BaseModel):
    month: str = Field(..., description="Month label e.g. Jan (Past), Apr (Expected)")
    demand: int = Field(..., description="Demand units")
    stock: int = Field(..., description="Available inventory units")
    is_future: bool = Field(default=False, description="Whether this is a forecasted future month")
    is_shortfall: bool = Field(default=False, description="Whether demand exceeds stock")
    shortfall_units: int = Field(default=0, description="Shortfall unit count")


class ForecastSummaryResponse(BaseModel):
    total_expected_sales_30d: int = Field(..., description="Total projected demand units across filtered scope")
    total_available_stock: int = Field(..., description="Total current available stock across filtered scope")
    growth_rate_pct: float = Field(..., description="Overall expected demand growth percentage")
    fastest_growing_category: str = Field(..., description="Category with highest velocity expansion")
    reorder_needed_count: int = Field(..., description="Count of SKUs that have shortfall or near ROP")
    monthly_comparison: List[MonthlyDemandPoint] = Field(default_factory=list, description="Monthly bars comparison")


class DemandForecastResponse(BaseModel):
    product_id: str = Field(..., description="Product ID.")
    product_name: str = Field(..., description="Product name.")
    sku: str = Field(..., description="SKU code.")
    category_name: Optional[str] = Field(default="Enterprise Tech", description="Category.")
    warehouse_id: Optional[str] = Field(default=None, description="Warehouse UUID.")
    warehouse_code: Optional[str] = Field(default="WH-MUM", description="Warehouse Hub code.")
    warehouse_name: Optional[str] = Field(default="Mumbai Western Hub", description="Warehouse name.")
    available_stock: int = Field(default=0, description="Current available inventory quantity in this warehouse.")
    current_velocity_30d: int = Field(default=1200, description="Current 30-day baseline consumption.")
    projected_30d: int = Field(default=1380, description="Projected 30-day demand.")
    projected_60d: int = Field(default=2840, description="Projected 60-day demand.")
    projected_90d: int = Field(default=4350, description="Projected 90-day demand.")
    seasonality_index: float = Field(default=1.18, description="Seasonal multiplier index.")
    growth_rate_pct: float = Field(default=15.0, description="YoY velocity change %.")
    recommended_safety_buffer: int = Field(default=350, description="Calculated safety stock buffer.")
    recommended_reorder_point: int = Field(default=1800, description="Dynamic Reorder Point.")
    model_confidence_pct: float = Field(default=95.4, description="AI confidence score %.")
    primary_demand_driver: str = Field(default="Q3 Enterprise Expansion", description="Primary catalyst.")
    is_shortfall: bool = Field(default=False, description="True if available_stock < projected_30d")
    shortfall_units: int = Field(default=0, description="Units to reorder to meet projected demand")
    forecast_points: List[DemandPointSchema] = Field(default_factory=list, description="Monthly forecast series.")
    trend: str = Field(default="UPWARD", description="UPWARD, DOWNWARD, STABLE, SEASONAL.")


class ForecastAccuracyResponse(BaseModel):
    mape: float = Field(..., description="Mean Absolute Percentage Error (MAPE %).")
    wmape: float = Field(default=4.8, description="Weighted MAPE %.")
    rmse: float = Field(..., description="Root Mean Squared Error.")
    overall_accuracy_pct: float = Field(..., description="30-day forecast accuracy %.")
    forecast_bias_pct: float = Field(default=0.8, description="Tracking signal / forecast bias %.")
    forecast_value_add_pct: float = Field(default=8.4, description="FVA % vs naive moving average.")
    evaluated_skus_count: int = Field(..., description="Count of SKUs evaluated.")
    total_projected_volume: int = Field(default=148620, description="Total projected unit volume.")
    total_projected_value_usd: float = Field(default=5240000.0, description="Total projected demand value ($).")


class ScenarioSimulationRequest(BaseModel):
    promo_uplift_pct: float = Field(default=0.0, description="Promotional demand spike percentage (-20% to +60%).")
    lead_time_delay_days: int = Field(default=0, description="Supplier lead time delay shock in days (0 to 30).")
    festive_surge_factor: float = Field(default=1.0, description="Seasonal / festive surge factor (1.0 to 2.5).")
    target_warehouse: Optional[str] = Field(default="ALL", description="Target warehouse ID or ALL.")


class ScenarioSimulationResponse(BaseModel):
    simulated_demand_volume: int
    incremental_demand_units: int
    stockout_risk_count: int
    additional_buffer_needed: int
    working_capital_impact_usd: float
    recommended_action: str
    impact_summary: str
