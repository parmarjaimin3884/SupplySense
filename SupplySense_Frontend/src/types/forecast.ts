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

export interface DemandForecast {
  product_id: string;
  product_name: string;
  sku: string;
  category_name?: string | null;
  forecast_points: DemandPoint[];
  trend: "UPWARD" | "DOWNWARD" | "STABLE" | "SEASONAL";
}

export interface ForecastAccuracy {
  mape: number;
  rmse: number;
  overall_accuracy_pct: number;
  evaluated_skus_count: number;
}
