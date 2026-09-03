/**
 * SupplySense — Dashboard React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useResolveAllAlerts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dashboardApi.resolveAllAlerts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.alerts });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.kpis });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => dashboardApi.deleteAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.alerts });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.kpis });
    },
  });
}
