/**
 * SupplySense — Dashboard Type Definitions
 * Maps to backend: backend/app/schemas/dashboard.py
 */

export interface DashboardSummary {
  total_inventory_value: number;
  stockout_risk_count: number;
  active_shipments_count: number;
  supplier_risk_count: number;
  forecast_accuracy_pct: number;
  critical_alerts_count: number;
  avg_warehouse_utilization_pct: number;
  open_purchase_orders_count: number;
}

export interface KPICard {
  id: string;
  title: string;
  metric_value: string;
  trend_percentage: number;
  trend_direction: "UP" | "DOWN" | "STABLE";
  status_badge: "HEALTHY" | "WARNING" | "CRITICAL";
}

export interface Alert {
  id: string;
  alert_type: string;
  message: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  created_at: string;
  is_resolved: boolean;
  title?: string;
  category?: string;
  product_name?: string;
  affected_sku?: string;
  warehouse_name?: string;
  current_stock?: number;
  reorder_level?: number;
  supplier_name?: string;
  delay_days?: number;
  recommended_action?: string;
  ai_insight?: string;
}
