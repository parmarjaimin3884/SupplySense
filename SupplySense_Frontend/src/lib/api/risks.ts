/**
 * SupplySense — Risk Intelligence API Service
 */

import apiClient from "@/lib/api/client";
import type { BaseResponse } from "@/types/common";
import type { RiskAlert, RiskSummary } from "@/types/risk";

export const riskApi = {
  getAlerts: async (): Promise<RiskAlert[]> => {
    const response = await apiClient.get<BaseResponse<RiskAlert[]>>("/risks");
    return response.data.data;
  },

  getCritical: async (): Promise<RiskAlert[]> => {
    const response = await apiClient.get<BaseResponse<RiskAlert[]>>("/risks/critical");
    return response.data.data;
  },

  getSummary: async (): Promise<RiskSummary> => {
    const response = await apiClient.get<BaseResponse<RiskSummary>>("/risks/summary");
    return response.data.data;
  },
};
