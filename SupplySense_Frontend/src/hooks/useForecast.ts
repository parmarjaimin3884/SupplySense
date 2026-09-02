/**
 * SupplySense — Forecast React Query Hooks
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/keys";
import { forecastApi } from "@/lib/api/forecast";
import type { ScenarioSimulationRequest } from "@/types/forecast";

export function useForecasts(params?: {
  warehouse_id?: string;
  category_id?: string;
  search?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: [...queryKeys.forecast.list, params],
    queryFn: () => forecastApi.getForecasts(params),
  });
}

export function useForecastSummary(params?: {
  warehouse_id?: string;
  product_id?: string;
}) {
  return useQuery({
    queryKey: ["forecast", "summary", params],
    queryFn: () => forecastApi.getSummary(params),
  });
}

export function useForecastAccuracy() {
  return useQuery({
    queryKey: queryKeys.forecast.accuracy,
    queryFn: forecastApi.getAccuracy,
  });
}

export function useTopForecastProducts() {
  return useQuery({
    queryKey: queryKeys.forecast.topProducts,
    queryFn: forecastApi.getTopProducts,
  });
}

export function useSimulateScenario() {
  return useMutation({
    mutationFn: (payload: ScenarioSimulationRequest) => forecastApi.simulateScenario(payload),
  });
}
