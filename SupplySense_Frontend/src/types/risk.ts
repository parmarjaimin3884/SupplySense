/**
 * SupplySense — Risk Type Definitions
 * Maps to backend: backend/app/schemas/risk.py
 */

export interface RiskAlert {
  id: string;
  alert_type: string;
  message: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  created_at: string;
  is_resolved: boolean;
  product_name?: string;
  sku?: string;
  supplier_name?: string;
  warehouse_name?: string;
  impact_summary?: string;
}

export interface RiskMatrixPoint {
  id: string;
  title: string;
  domain: "INVENTORY" | "SHIPMENT" | "SUPPLIER" | "FORECAST";
  likelihood: number;
  impact: number;
  composite_score: number;
  root_cause: string;
  recommended_action: string;
}

export interface RiskSummary {
  overall_composite_risk_score: number;
  risk_level: "LOW" | "MODERATE" | "HIGH" | "SEVERE";
  critical_threats_count: number;
  matrix_points: RiskMatrixPoint[];
}

export interface DemandAnomaly {
  product_id: string;
  product_name: string;
  sku: string;
  warehouse_id: string;
  warehouse_name: string;
  warehouse_code: string;
  current_daily_sales: number;
  historical_mean: number;
  historical_std_dev: number;
  z_score: number;
  spike_percentage: number;
  available_quantity: number;
  stockout_days_remaining: number;
  recommended_buffer_increase: number;
  severity: "CRITICAL" | "HIGH";
  anomaly_reason: string;
}

export interface BufferAdjustmentRequest {
  product_id: string;
  warehouse_id: string;
  additional_buffer_units: number;
  reason?: string;
}

