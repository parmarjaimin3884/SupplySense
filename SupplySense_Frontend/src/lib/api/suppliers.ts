/**
 * SupplySense — Supplier API Service
 */

import apiClient from "@/lib/api/client";
import type { BaseResponse, PaginationResponse } from "@/types/common";
import type { Supplier, SupplierPerformance, SupplierScorecard, SupplierListParams } from "@/types/supplier";

export const supplierApi = {
  getList: async (params?: SupplierListParams): Promise<PaginationResponse<Supplier>> => {
    const response = await apiClient.get<PaginationResponse<Supplier>>("/suppliers", { params });
    return response.data;
  },

  getById: async (id: string): Promise<Supplier> => {
    const response = await apiClient.get<BaseResponse<Supplier>>(`/suppliers/${id}`);
    return response.data.data;
  },

  getHighRisk: async (): Promise<Supplier[]> => {
    const response = await apiClient.get<BaseResponse<Supplier[]>>("/suppliers/high-risk");
    return response.data.data;
  },

  getPerformance: async (): Promise<SupplierPerformance[]> => {
    const response = await apiClient.get<BaseResponse<SupplierPerformance[]>>("/suppliers/performance");
    return response.data.data;
  },

  getScorecards: async (): Promise<SupplierScorecard[]> => {
    const response = await apiClient.get<BaseResponse<SupplierScorecard[]>>("/suppliers/scorecards");
    return response.data.data;
  },
};
