/**
 * SupplySense — Warehouse API Service
 */

import apiClient from "@/lib/api/client";
import type { BaseResponse } from "@/types/common";
import type { Warehouse, WarehouseUtilization, WarehouseCapacity } from "@/types/warehouse";

export const warehousesApi = {
  getList: async (): Promise<Warehouse[]> => {
    const response = await apiClient.get<BaseResponse<Warehouse[]>>("/warehouses");
    return response.data.data;
  },

  getUtilization: async (): Promise<WarehouseUtilization[]> => {
    const response = await apiClient.get<BaseResponse<WarehouseUtilization[]>>("/warehouses/utilization");
    return response.data.data;
  },

  getCapacity: async (): Promise<WarehouseCapacity> => {
    const response = await apiClient.get<BaseResponse<WarehouseCapacity>>("/warehouses/capacity");
    return response.data.data;
  },

  getById: async (id: string): Promise<Warehouse> => {
    const response = await apiClient.get<BaseResponse<Warehouse>>(`/warehouses/${id}`);
    return response.data.data;
  },
};
