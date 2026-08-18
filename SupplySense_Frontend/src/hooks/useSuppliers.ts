/**
 * SupplySense — Supplier React Query Hooks
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/keys";
import { supplierApi } from "@/lib/api/suppliers";
import type { SupplierListParams } from "@/types/supplier";

export function useSupplierList(params?: SupplierListParams) {
  return useQuery({
    queryKey: queryKeys.suppliers.list(params),
    queryFn: () => supplierApi.getList(params),
  });
}

export function useSupplierDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.suppliers.detail(id),
    queryFn: () => supplierApi.getById(id),
    enabled: !!id,
  });
}

export function useHighRiskSuppliers() {
  return useQuery({
    queryKey: queryKeys.suppliers.highRisk,
    queryFn: supplierApi.getHighRisk,
  });
}

export function useSupplierPerformance() {
  return useQuery({
    queryKey: queryKeys.suppliers.performance,
    queryFn: supplierApi.getPerformance,
  });
}

export function useSupplierScorecards() {
  return useQuery({
    queryKey: queryKeys.suppliers.scorecards,
    queryFn: supplierApi.getScorecards,
  });
}
