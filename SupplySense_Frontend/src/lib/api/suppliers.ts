/**
 * SupplySense — Supplier API Service
 */

import apiClient from "@/lib/api/client";
import type { BaseResponse, PaginationResponse } from "@/types/common";
import type { Supplier, SupplierPerformance, SupplierScorecard, SupplierListParams, AlternateSupplierRecommendation, SupplierReallocateRequest } from "@/types/supplier";

export const supplierApi = {
  getList: async (params?: SupplierListParams): Promise<PaginationResponse<Supplier>> => {
    const response = await apiClient.get<PaginationResponse<Supplier>>("/suppliers", { params });
    const resData = response.data;
    if (resData && Array.isArray(resData.data)) {
      resData.items = resData.data;
    }
    return resData;
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

  getAlternates: async (supplierId: string): Promise<AlternateSupplierRecommendation[]> => {
    const response = await apiClient.get<BaseResponse<AlternateSupplierRecommendation[]>>(`/suppliers/${supplierId}/alternates`);
    return response.data.data;
  },

  reallocate: async (payload: SupplierReallocateRequest): Promise<any> => {
    const response = await apiClient.post<BaseResponse<any>>("/suppliers/reallocate", payload);
    return response.data.data;
  },
};

