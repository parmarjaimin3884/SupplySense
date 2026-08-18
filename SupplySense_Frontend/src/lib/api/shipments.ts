/**
 * SupplySense — Shipments API Service
 */

import apiClient from "@/lib/api/client";
import type { BaseResponse, PaginationResponse } from "@/types/common";
import type { Shipment, CarrierPerformance, ShipmentListParams } from "@/types/shipment";

export const shipmentApi = {
  getList: async (params?: ShipmentListParams): Promise<PaginationResponse<Shipment>> => {
    const response = await apiClient.get<PaginationResponse<Shipment>>("/shipments", { params });
    return response.data;
  },

  getById: async (id: string): Promise<Shipment> => {
    const response = await apiClient.get<BaseResponse<Shipment>>(`/shipments/${id}`);
    return response.data.data;
  },

  getDelayed: async (): Promise<Shipment[]> => {
    const response = await apiClient.get<BaseResponse<Shipment[]>>("/shipments/delayed");
    return response.data.data;
  },

  getInTransit: async (): Promise<Shipment[]> => {
    const response = await apiClient.get<BaseResponse<Shipment[]>>("/shipments/in-transit");
    return response.data.data;
  },

  getCarrierPerformance: async (): Promise<CarrierPerformance[]> => {
    const response = await apiClient.get<BaseResponse<CarrierPerformance[]>>("/shipments/carrier-performance");
    return response.data.data;
  },
};
