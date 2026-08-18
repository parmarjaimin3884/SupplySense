/**
 * SupplySense — Forecast API Service
 */

import apiClient from "@/lib/api/client";
import type { BaseResponse } from "@/types/common";
import type { DemandForecast, ForecastAccuracy } from "@/types/forecast";

export const forecastApi = {
  getForecasts: async (): Promise<DemandForecast[]> => {
    const response = await apiClient.get<BaseResponse<DemandForecast[]>>("/forecast");
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
};
