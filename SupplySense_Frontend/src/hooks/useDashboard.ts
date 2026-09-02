/**
 * SupplySense — Dashboard React Query Hooks
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/keys";
import { dashboardApi } from "@/lib/api/dashboard";

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: dashboardApi.getSummary,
    refetchInterval: 2000,
  });
}

export function useDashboardKPIs() {
  return useQuery({
    queryKey: queryKeys.dashboard.kpis,
    queryFn: dashboardApi.getKPIs,
    refetchInterval: 2000,
  });
}

export function useDashboardAlerts() {
  return useQuery({
    queryKey: queryKeys.dashboard.alerts,
    queryFn: dashboardApi.getAlerts,
    refetchInterval: 2000,
  });
}
