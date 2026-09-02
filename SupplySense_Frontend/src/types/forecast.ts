/**
 * SupplySense — Forecast Type Definitions
 * Maps to backend: backend/app/schemas/forecast.py
 */

export interface DemandPoint {
  date: string;
  actual_demand?: number | null;
  forecasted_demand: number;
  lower_bound_95: number;
  upper_bound_95: number;
}

export interface MonthlyDemandPoint {
  month: string;
  demand: number;
  stock: number;
  is_future: boolean;
  is_shortfall: boolean;
  shortfall_units: number;
}

export interface ForecastSummaryResponse {
  total_expected_sales_30d: number;
  total_available_stock: number;
  growth_rate_pct: number;
  fastest_growing_category: string;
  reorder_needed_count: number;
  monthly_comparison: MonthlyDemandPoint[];
}

export interface DemandForecast {
  product_id: string;
  product_name: string;
  sku: string;
  category_name?: string | null;
  warehouse_id?: string | null;
  warehouse_code?: string;
  warehouse_name?: string;
  available_stock: number;
  current_velocity_30d: number;
  projected_30d: number;
  projected_60d: number;
  projected_90d: number;
  seasonality_index: number;
  growth_rate_pct: number;
  recommended_safety_buffer: number;
  recommended_reorder_point: number;
  model_confidence_pct: number;
  primary_demand_driver: string;
  is_shortfall: boolean;
  shortfall_units: number;
  forecast_points: DemandPoint[];
  trend: "UPWARD" | "DOWNWARD" | "STABLE" | "SEASONAL";
}

export interface ForecastAccuracy {
  mape: number;
  wmape: number;
  rmse: number;
  overall_accuracy_pct: number;
  forecast_bias_pct: number;
  forecast_value_add_pct: number;
  evaluated_skus_count: number;
  total_projected_volume: number;
  total_projected_value_usd: number;
}

export interface ScenarioSimulationRequest {
  promo_uplift_pct: number;
  lead_time_delay_days: number;
  festive_surge_factor: number;
  target_warehouse?: string;
}

export interface ScenarioSimulationResponse {
  simulated_demand_volume: number;
  incremental_demand_units: number;
  stockout_risk_count: number;
  additional_buffer_needed: number;
  working_capital_impact_usd: number;
  recommended_action: string;
  impact_summary: string;
}
