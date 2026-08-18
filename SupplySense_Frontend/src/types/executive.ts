/**
 * SupplySense — Executive Type Definitions
 * Maps to backend: backend/app/schemas/executive.py
 */

export interface ExecutiveSummary {
  briefing_title: string;
  executive_narrative: string;
  top_strategic_risks: string[];
  capital_at_risk: number;
  key_recommendations: string[];
}

export interface BoardReport {
  report_title: string;
  quarter: string;
  financial_exposure: number;
  inventory_health_index: number;
  vendor_sla_compliance_rate: number;
  freight_on_time_rate: number;
  strategic_action_items: Array<{
    item: string;
    status: string;
    target_date: string;
  }>;
}

export interface BusinessHealth {
  composite_health_score: number;
  status: "HEALTHY" | "STABLE" | "AT_RISK" | "CRITICAL";
  domain_scores: Record<string, number>;
}
