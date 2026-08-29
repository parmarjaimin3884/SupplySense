/**
 * SupplySense — Risk Intelligence React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/keys";
import { riskApi } from "@/lib/api/risks";
import type { BufferAdjustmentRequest } from "@/types/risk";

export function useRiskAlerts() {
  return useQuery({
    queryKey: queryKeys.risks.list,
    queryFn: riskApi.getAlerts,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCriticalRisks() {
  return useQuery({
    queryKey: queryKeys.risks.critical,
    queryFn: riskApi.getCritical,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRiskSummary() {
  return useQuery({
    queryKey: queryKeys.risks.summary,
    queryFn: riskApi.getSummary,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDemandAnomalies() {
  return useQuery({
    queryKey: queryKeys.risks.anomalies,
    queryFn: riskApi.getAnomalies,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdjustSafetyBuffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BufferAdjustmentRequest) => riskApi.adjustBuffer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.risks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

