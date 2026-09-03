/**
 * SupplySense — Inventory API Service
 */

import apiClient from "@/lib/api/client";
import type { BaseResponse, PaginationResponse } from "@/types/common";
import type { InventoryItem, InventoryDetail, InventoryMovement, InventoryListParams } from "@/types/inventory";

export const inventoryApi = {
  getList: async (params?: InventoryListParams): Promise<PaginationResponse<InventoryItem>> => {
    const response = await apiClient.get<PaginationResponse<InventoryItem>>("/inventory", { params });
    const resData = response.data;
    if (resData && Array.isArray(resData.data)) {
      resData.items = resData.data;
    }
    return resData;
  },

  getById: async (id: string): Promise<InventoryDetail> => {
    const response = await apiClient.get<BaseResponse<InventoryDetail>>(`/inventory/${id}`);
    return response.data.data;
  },

  getLowStock: async (): Promise<InventoryItem[]> => {
    const response = await apiClient.get<BaseResponse<InventoryItem[]>>("/inventory/low-stock");
    return response.data.data;
  },

  recordReorderDecision: async (payload: { product_id: string; warehouse_id: string; decision: "Rejected" }): Promise<void> => {
    await apiClient.post("/inventory/reorder-decisions", payload);
  },

  getOutOfStock: async (): Promise<InventoryItem[]> => {
    const response = await apiClient.get<BaseResponse<InventoryItem[]>>("/inventory/out-of-stock");
    return response.data.data;
  },

  getDeadStock: async (): Promise<InventoryItem[]> => {
    const response = await apiClient.get<BaseResponse<InventoryItem[]>>("/inventory/dead-stock");
    return response.data.data;
  },

  getMovements: async (): Promise<InventoryMovement[]> => {
    const response = await apiClient.get<BaseResponse<InventoryMovement[]>>("/inventory/movements");
    return response.data.data;
  },
};
