/**
 * SupplySense — Forecast API Service
 */

import apiClient from "@/lib/api/client";
import type { BaseResponse } from "@/types/common";
import type {
  DemandForecast,
  ForecastAccuracy,
  ForecastSummaryResponse,
  ScenarioSimulationRequest,
  ScenarioSimulationResponse,
} from "@/types/forecast";

export const forecastApi = {
  getForecasts: async (params?: {
    warehouse_id?: string;
    category_id?: string;
    search?: string;
    limit?: number;
  }): Promise<DemandForecast[]> => {
    const response = await apiClient.get<BaseResponse<DemandForecast[]>>("/forecast", { params });
    return response.data.data;
  },

  getSummary: async (params?: {
    warehouse_id?: string;
    product_id?: string;
  }): Promise<ForecastSummaryResponse> => {
    const response = await apiClient.get<BaseResponse<ForecastSummaryResponse>>("/forecast/summary", { params });
    return response.data.data;
  },

  getAccuracy: async (): Promise<ForecastAccuracy> => {
    const response = await apiClient.get<BaseResponse<ForecastAccuracy>>("/forecast/accuracy");
    return response.data.data;
  },

  getTopProducts: async (): Promise<DemandForecast[]> => {
    const response = await apiClient.get<BaseResponse<DemandForecast[]>>("/forecast/top-products");
    return response.data.data;
  },

  simulateScenario: async (payload: ScenarioSimulationRequest): Promise<ScenarioSimulationResponse> => {
    const response = await apiClient.post<BaseResponse<ScenarioSimulationResponse>>("/forecast/simulate", payload);
    return response.data.data;
  },
};
