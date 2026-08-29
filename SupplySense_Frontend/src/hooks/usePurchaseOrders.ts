/**
 * SupplySense — Purchase Orders React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/keys";
import { purchaseOrderApi } from "@/lib/api/purchase-orders";
import type { CreatePOInput } from "@/types/purchase-order";

export function usePurchaseOrderList(params?: { page?: number; limit?: number; status?: string; supplier_id?: string }) {
  return useQuery({
    queryKey: queryKeys.purchaseOrders.list(params),
    queryFn: () => purchaseOrderApi.getList(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useOpenPurchaseOrders() {
  return useQuery({
    queryKey: queryKeys.purchaseOrders.open,
    queryFn: purchaseOrderApi.getOpen,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePendingApprovalPurchaseOrders() {
  return useQuery({
    queryKey: queryKeys.purchaseOrders.pendingApproval,
    queryFn: purchaseOrderApi.getPendingApproval,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePurchaseOrderDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.purchaseOrders.detail(id),
    queryFn: () => purchaseOrderApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePOInput) => purchaseOrderApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrderApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
