/**
 * SupplySense — Dashboard API Service
 */

import apiClient from "@/lib/api/client";
import type { BaseResponse } from "@/types/common";
import type { DashboardSummary, KPICard, Alert } from "@/types/dashboard";

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<BaseResponse<DashboardSummary>>("/dashboard/summary");
    return response.data.data;
  },

  getKPIs: async (): Promise<KPICard[]> => {
    const response = await apiClient.get<BaseResponse<KPICard[]>>("/dashboard/kpis");
    return response.data.data;
  },

  getAlerts: async (): Promise<Alert[]> => {
    const response = await apiClient.get<BaseResponse<Alert[]>>("/dashboard/alerts");
    return response.data.data;
  },
};
