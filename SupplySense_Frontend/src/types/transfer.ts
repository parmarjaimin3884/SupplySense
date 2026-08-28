/**
 * SupplySense — Stock Transfer Type Definitions
 * Maps to backend: backend/app/schemas/transfer.py
 */

export interface StockTransfer {
  id: string;
  from_warehouse_id: string;
  from_warehouse_name: string;
  from_warehouse_code: string;
  to_warehouse_id: string;
  to_warehouse_name: string;
  to_warehouse_code: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  reason?: string;
  transfer_date: string;
  status: "INITIATED" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED";
}

export interface StockTransferRecommendation {
  product_id: string;
  product_name: string;
  sku: string;
  from_warehouse_id: string;
  from_warehouse_name: string;
  from_warehouse_code: string;
  from_available_qty: number;
  from_utilization_pct: number;
  to_warehouse_id: string;
  to_warehouse_name: string;
  to_warehouse_code: string;
  to_available_qty: number;
  to_reorder_level: number;
  to_utilization_pct: number;
  recommended_transfer_qty: number;
  reason: string;
  estimated_transit_days: number;
  estimated_cost_savings: number;
}

export interface StockTransferCreateRequest {
  from_warehouse_id: string;
  to_warehouse_id: string;
  product_id: string;
  quantity: number;
  reason?: string;
}
