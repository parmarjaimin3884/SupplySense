/**
 * SupplySense — Purchase Orders API Service
 */

import apiClient from "@/lib/api/client";
import type { BaseResponse, PaginationResponse } from "@/types/common";
import type { PurchaseOrder, CreatePOInput } from "@/types/purchase-order";

export const purchaseOrderApi = {
  getList: async (params?: { page?: number; limit?: number; status?: string; supplier_id?: string }): Promise<PaginationResponse<PurchaseOrder>> => {
    const response = await apiClient.get<PaginationResponse<PurchaseOrder>>("/purchase-orders", { params });
    return response.data;
  },

  getOpen: async (): Promise<PurchaseOrder[]> => {
    const response = await apiClient.get<BaseResponse<PurchaseOrder[]>>("/purchase-orders/open");
    return response.data.data;
  },

  getPendingApproval: async (): Promise<PurchaseOrder[]> => {
    const response = await apiClient.get<BaseResponse<PurchaseOrder[]>>("/purchase-orders/pending-approval");
    return response.data.data;
  },

  getById: async (id: string): Promise<PurchaseOrder> => {
    const response = await apiClient.get<BaseResponse<PurchaseOrder>>(`/purchase-orders/${id}`);
    return response.data.data;
  },

  create: async (payload: CreatePOInput): Promise<PurchaseOrder> => {
    const response = await apiClient.post<BaseResponse<PurchaseOrder>>("/purchase-orders", payload);
    return response.data.data;
  },

  approve: async (id: string): Promise<any> => {
    const response = await apiClient.post<BaseResponse<any>>(`/purchase-orders/${id}/approve`);
    return response.data.data;
  },
};
