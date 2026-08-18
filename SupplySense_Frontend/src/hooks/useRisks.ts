/**
 * SupplySense — Risk Intelligence React Query Hooks
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/keys";
import { riskApi } from "@/lib/api/risks";

export function useRiskAlerts() {
  return useQuery({
    queryKey: queryKeys.risks.list,
    queryFn: riskApi.getAlerts,
  });
}

export function useCriticalRisks() {
  return useQuery({
    queryKey: queryKeys.risks.critical,
    queryFn: riskApi.getCritical,
  });
}

export function useRiskSummary() {
  return useQuery({
    queryKey: queryKeys.risks.summary,
    queryFn: riskApi.getSummary,
  });
}
