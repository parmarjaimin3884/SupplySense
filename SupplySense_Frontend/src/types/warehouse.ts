/**
 * SupplySense — Warehouse Type Definitions
 * Maps to backend: backend/app/schemas/warehouse.py
 */

export interface Warehouse {
  id: string;
  warehouse_code: string;
  name: string;
  manager?: string | null;
  capacity: number;
  current_utilization?: number | null;
  operating_hours?: string | null;
}

export interface WarehouseUtilization {
  warehouse_id: string;
  name: string;
  warehouse_code: string;
  capacity: number;
  used_units: number;
  utilization_percentage: number;
  status: "OPTIMAL" | "NEAR_CAPACITY" | "UNDERUTILIZED";
}

export interface WarehouseCapacity {
  total_network_capacity: number;
  total_used_capacity: number;
  avg_utilization_pct: number;
  overfilled_depots_count: number;
  underutilized_depots_count: number;
}
