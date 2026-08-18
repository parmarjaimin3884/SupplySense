/**
 * SupplySense — Executive C-Suite API Service
 */

import apiClient from "@/lib/api/client";
import type { BaseResponse } from "@/types/common";
import type { ExecutiveSummary, BoardReport, BusinessHealth } from "@/types/executive";

export const executiveApi = {
  getSummary: async (): Promise<ExecutiveSummary> => {
    const response = await apiClient.get<BaseResponse<ExecutiveSummary>>("/executive/summary");
    return response.data.data;
  },

  getBusinessHealth: async (): Promise<BusinessHealth> => {
    const response = await apiClient.get<BaseResponse<BusinessHealth>>("/executive/business-health");
    return response.data.data;
  },

  getBoardReport: async (): Promise<BoardReport> => {
    const response = await apiClient.get<BaseResponse<BoardReport>>("/executive/board-report");
    return response.data.data;
  },
};
