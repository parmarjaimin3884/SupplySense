/**
 * SupplySense — Shipment Type Definitions
 * Maps to backend: backend/app/schemas/shipment.py
 */

export interface Shipment {
  id: string;
  purchase_order_id: string;
  carrier?: string | null;
  vehicle_number?: string | null;
  current_status: "IN_TRANSIT" | "DELAYED" | "CUSTOMS_HOLD" | "DELIVERED" | "Pending";
  current_location?: string | null;
  dispatch_date?: string | null;
  expected_arrival?: string | null;
  actual_arrival?: string | null;
  delay_days?: number;
  delay_reason?: string | null;
}

export interface CarrierPerformance {
  carrier_name: string;
  total_shipments: number;
  on_time_deliveries: number;
  delayed_shipments: number;
  on_time_delivery_rate: number;
  avg_delay_days: number;
}

export interface ShipmentListParams {
  page?: number;
  limit?: number;
  status?: string;
  carrier?: string;
}
