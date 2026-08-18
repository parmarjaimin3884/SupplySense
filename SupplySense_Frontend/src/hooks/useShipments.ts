/**
 * SupplySense — Shipment React Query Hooks
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/keys";
import { shipmentApi } from "@/lib/api/shipments";
import type { ShipmentListParams } from "@/types/shipment";

export function useShipmentList(params?: ShipmentListParams) {
  return useQuery({
    queryKey: queryKeys.shipments.list(params),
    queryFn: () => shipmentApi.getList(params),
  });
}

export function useShipmentDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.shipments.detail(id),
    queryFn: () => shipmentApi.getById(id),
    enabled: !!id,
  });
}

export function useDelayedShipments() {
  return useQuery({
    queryKey: queryKeys.shipments.delayed,
    queryFn: shipmentApi.getDelayed,
  });
}

export function useInTransitShipments() {
  return useQuery({
    queryKey: queryKeys.shipments.inTransit,
    queryFn: shipmentApi.getInTransit,
  });
}

export function useCarrierPerformance() {
  return useQuery({
    queryKey: queryKeys.shipments.carrierPerformance,
    queryFn: shipmentApi.getCarrierPerformance,
  });
}
