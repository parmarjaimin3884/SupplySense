/**
 * SupplySense — Inventory React Query Hooks
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/keys";
import { inventoryApi } from "@/lib/api/inventory";
import type { InventoryListParams } from "@/types/inventory";

export function useInventoryList(params?: InventoryListParams) {
  return useQuery({
    queryKey: queryKeys.inventory.list(params),
    queryFn: () => inventoryApi.getList(params),
  });
}

export function useInventoryDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.inventory.detail(id),
    queryFn: () => inventoryApi.getById(id),
    enabled: !!id,
  });
}

export function useLowStock() {
  return useQuery({
    queryKey: queryKeys.inventory.lowStock,
    queryFn: inventoryApi.getLowStock,
    refetchInterval: 5000,
  });
}

export function useOutOfStock() {
  return useQuery({
    queryKey: queryKeys.inventory.outOfStock,
    queryFn: inventoryApi.getOutOfStock,
  });
}

export function useDeadStock() {
  return useQuery({
    queryKey: queryKeys.inventory.deadStock,
    queryFn: inventoryApi.getDeadStock,
  });
}

export function useInventoryMovements() {
  return useQuery({
    queryKey: queryKeys.inventory.movements,
    queryFn: inventoryApi.getMovements,
  });
}
