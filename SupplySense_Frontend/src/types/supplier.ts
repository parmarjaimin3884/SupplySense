/**
 * SupplySense — Supplier Type Definitions
 * Maps to backend: backend/app/schemas/supplier.py
 */

export interface Supplier {
  id: string;
  company_name: string;
  city?: string | null;
  country?: string | null;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  lead_time?: number;
  payment_terms?: string | null;
  reliability_score?: number;
  quality_score?: number;
  risk_rating: "LOW" | "MODERATE" | "HIGH_RISK" | "CRITICAL" | "HIGH";
  average_delay?: number;
}

export interface SupplierPerformance {
  id: string;
  supplier_id: string;
  supplier_name?: string | null;
  month: number;
  year: number;
  delivery_percentage: number;
  average_delay: number;
  complaint_count: number;
  quality_score: number;
  risk_score: number;
}

export interface SupplierScorecard {
  supplier_id: string;
  company_name: string;
  overall_grade: string;
  on_time_delivery_rate: number;
  quality_defect_rate: number;
  lead_time_compliance: number;
  active_po_count: number;
}

export interface SupplierListParams {
  page?: number;
  limit?: number;
  search?: string;
  risk_rating?: string;
}
