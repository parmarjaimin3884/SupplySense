/**
 * SupplySense — Warehouse React Query Hooks
 */

import { useQuery } from "@tanstack/react-query";
import { warehousesApi } from "@/lib/api/warehouses";

export function useWarehouses() {
  return useQuery({
    queryKey: ["warehouses", "list"],
    queryFn: () => warehousesApi.getList(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useWarehouseUtilization() {
  return useQuery({
    queryKey: ["warehouses", "utilization"],
    queryFn: () => warehousesApi.getUtilization(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useWarehouseCapacity() {
  return useQuery({
    queryKey: ["warehouses", "capacity"],
    queryFn: () => warehousesApi.getCapacity(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useWarehouseDetail(id: string) {
  return useQuery({
    queryKey: ["warehouses", "detail", id],
    queryFn: () => warehousesApi.getById(id),
    enabled: !!id,
  });
}
