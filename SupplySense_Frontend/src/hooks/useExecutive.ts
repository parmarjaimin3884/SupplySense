/**
 * SupplySense — Executive C-Suite React Query Hooks
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/keys";
import { executiveApi } from "@/lib/api/executive";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserRole } from "@/types/auth";

export function useExecutiveSummary() {
  const role = useAuthStore((state) => state.role);
  return useQuery({
    queryKey: queryKeys.executive.summary,
    queryFn: executiveApi.getSummary,
    enabled: role === UserRole.CSCO_EXECUTIVE,
  });
}

export function useBusinessHealth() {
  const role = useAuthStore((state) => state.role);
  return useQuery({
    queryKey: queryKeys.executive.businessHealth,
    queryFn: executiveApi.getBusinessHealth,
    enabled: role === UserRole.CSCO_EXECUTIVE,
  });
}

export function useBoardReport() {
  const role = useAuthStore((state) => state.role);
  return useQuery({
    queryKey: queryKeys.executive.boardReport,
    queryFn: executiveApi.getBoardReport,
    enabled: role === UserRole.CSCO_EXECUTIVE,
  });
}
