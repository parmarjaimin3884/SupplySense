/**
 * SupplySense — Purchase Order Type Definitions
 * Maps to backend: backend/app/schemas/purchase_order.py
 */

export interface PurchaseOrderItem {
  id: string;
  product_id: string;
  product_name?: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  supplier_name?: string;
  warehouse_id: string;
  warehouse_name?: string;
  order_date: string;
  expected_delivery_date?: string;
  status: string;
  priority?: "Normal" | "High" | "Urgent";
  approved_by?: string;
  total_amount: number;
  items?: PurchaseOrderItem[];
}

export interface CreatePOItemInput {
  product_id: string;
  quantity: number;
  unit_price?: number;
}

export interface CreatePOInput {
  supplier_id: string;
  warehouse_id: string;
  expected_delivery_date?: string;
  priority?: "Normal" | "High" | "Urgent";
  notes?: string;
  items: CreatePOItemInput[];
}
