/**
 * SupplySense — Supplier React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/keys";
import { supplierApi } from "@/lib/api/suppliers";
import type { SupplierListParams, SupplierReallocateRequest } from "@/types/supplier";

export function useSupplierList(params?: SupplierListParams) {
  return useQuery({
    queryKey: queryKeys.suppliers.list(params),
    queryFn: () => supplierApi.getList(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSupplierDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.suppliers.detail(id),
    queryFn: () => supplierApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHighRiskSuppliers() {
  return useQuery({
    queryKey: queryKeys.suppliers.highRisk,
    queryFn: supplierApi.getHighRisk,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSupplierPerformance() {
  return useQuery({
    queryKey: queryKeys.suppliers.performance,
    queryFn: supplierApi.getPerformance,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSupplierScorecards() {
  return useQuery({
    queryKey: queryKeys.suppliers.scorecards,
    queryFn: supplierApi.getScorecards,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAlternateSuppliers(supplierId: string) {
  return useQuery({
    queryKey: queryKeys.suppliers.alternates(supplierId),
    queryFn: () => supplierApi.getAlternates(supplierId),
    enabled: !!supplierId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useReallocateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SupplierReallocateRequest) => supplierApi.reallocate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

