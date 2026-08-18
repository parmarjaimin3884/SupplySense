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
