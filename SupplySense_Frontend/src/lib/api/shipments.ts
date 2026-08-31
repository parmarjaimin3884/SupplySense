import client from "./client";
import { BaseResponse } from "@/types/common";

export interface ShipmentItem {
  id: string;
  purchase_order_id: string;
  po_number?: string;
  product_name: string;
  sku: string;
  quantity: number;
  carrier: string;
  vehicle_number: string;
  current_status: "DISPATCHED" | "IN_TRANSIT" | "DELIVERED" | "COMPLETED" | "DELAYED";
  current_location: string;
  dispatch_date?: string;
  expected_arrival?: string;
  actual_arrival?: string;
  delay_days: number;
  delay_reason?: string;
  supplier_name: string;
  warehouse_name: string;
  accepted_quantity?: number;
  inspection_result?: string;
}

export interface ShipmentCreatePayload {
  purchase_order_id: string;
  carrier?: string;
  vehicle_number?: string;
  dispatch_date?: string;
  expected_arrival?: string;
  current_location?: string;
}

export interface GRNReceivingPayload {
  accepted_quantity: number;
  rejected_quantity?: number;
  inspection_result?: string;
  quality_issue?: string;
}

export const getShipments = async (params?: { status?: string; page?: number; limit?: number }) => {
  const { data } = await client.get<BaseResponse<ShipmentItem[]>>("/api/v1/shipments", { params });
  return data;
};

export const createShipment = async (payload: ShipmentCreatePayload) => {
  const { data } = await client.post<BaseResponse<ShipmentItem>>("/api/v1/shipments", payload);
  return data;
};

export const updateShipmentStatus = async (id: string, payload: { status: string; current_location?: string }) => {
  const { data } = await client.patch<BaseResponse<ShipmentItem>>(`/api/v1/shipments/${id}/status`, payload);
  return data;
};

export const receiveShipmentGRN = async (id: string, payload: GRNReceivingPayload) => {
  const { data } = await client.post<BaseResponse<ShipmentItem>>(`/api/v1/shipments/${id}/receive`, payload);
  return data;
};

export const simulateCarrierTelemetry = async () => {
  const { data } = await client.post<BaseResponse<any>>("/api/v1/shipments/telemetry/simulate");
  return data;
};
