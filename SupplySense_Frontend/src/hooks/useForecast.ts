/**
 * SupplySense — Forecast React Query Hooks
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/keys";
import { forecastApi } from "@/lib/api/forecast";

export function useForecasts() {
  return useQuery({
    queryKey: queryKeys.forecast.list,
    queryFn: forecastApi.getForecasts,
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
