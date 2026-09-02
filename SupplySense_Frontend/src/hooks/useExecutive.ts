/**
 * SupplySense — Executive C-Suite React Query Hooks
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/keys";
import { executiveApi } from "@/lib/api/executive";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserRole } from "@/types/auth";

export function useExecutiveSummary() {
  return useQuery({
    queryKey: queryKeys.executive.summary,
    queryFn: executiveApi.getSummary,
    refetchInterval: 5000,
  });
}

export function useBusinessHealth() {
  return useQuery({
    queryKey: queryKeys.executive.businessHealth,
    queryFn: executiveApi.getBusinessHealth,
  });
}

export function useBoardReport() {
  return useQuery({
    queryKey: queryKeys.executive.boardReport,
    queryFn: executiveApi.getBoardReport,
  });
}

export function useStrategicRisks() {
  return useQuery({
    queryKey: ["executive", "strategicRisks"],
    queryFn: executiveApi.getStrategicRisks,
    refetchInterval: 5000,
  });
}
