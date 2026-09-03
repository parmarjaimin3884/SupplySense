/**
 * SupplySense — Inventory Type Definitions
 * Maps to backend: backend/app/schemas/inventory.py
 */

export interface InventoryItem {
  id: string;
  warehouse_id: string;
  warehouse_name?: string | null;
  product_id: string;
  product_name?: string | null;
  sku?: string | null;
  category_name?: string | null;
  quantity_on_hand: number;
  reserved_quantity: number;
  available_quantity: number;
  damaged_quantity: number;
  stock_status: "CRITICAL" | "LOW_STOCK" | "OPTIMAL" | "OVERSTOCK" | "OUT_OF_STOCK";
  total_value?: number | null;
  last_updated?: string | null;
  unit_cost?: number | null;
  reorder_level?: number | null;
  supplier_id?: string | null;
  lead_time?: number | null;
  supplier_name?: string | null;
  average_delay?: number | null;
}

export interface InventoryDetail extends InventoryItem {
  unit_cost?: number | null;
  reorder_level?: number | null;
  supplier_name?: string | null;
}

export interface InventoryMovement {
  id: string;
  warehouse_id: string;
  warehouse_name?: string | null;
  product_id: string;
  product_name?: string | null;
  movement_type: "INBOUND" | "OUTBOUND" | "TRANSFER" | "ADJUSTMENT";
  quantity: number;
  reference_id?: string | null;
  movement_date: string;
}

export interface InventoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  warehouse_id?: string;
  sort_by?: string;
}
