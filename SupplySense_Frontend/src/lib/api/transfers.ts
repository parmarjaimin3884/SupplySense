/**
 * SupplySense — Stock Transfers API Client
 */

import apiClient from "@/lib/api/client";
import type { StockTransfer, StockTransferRecommendation, StockTransferCreateRequest } from "@/types/transfer";
import type { BaseResponse } from "@/types/common";

export const transfersApi = {
  getRecommendations: async (limit: number = 5): Promise<StockTransferRecommendation[]> => {
    const res = await apiClient.get<BaseResponse<StockTransferRecommendation[]>>(`/transfers/recommendations?limit=${limit}`);
    return res.data.data;
  },

  initiate: async (payload: StockTransferCreateRequest): Promise<StockTransfer> => {
    const res = await apiClient.post<BaseResponse<StockTransfer>>("/transfers/initiate", payload);
    return res.data.data;
  },

  getList: async (limit: number = 20): Promise<StockTransfer[]> => {
    const res = await apiClient.get<BaseResponse<StockTransfer[]>>(`/transfers?limit=${limit}`);
    return res.data.data;
  },
};
