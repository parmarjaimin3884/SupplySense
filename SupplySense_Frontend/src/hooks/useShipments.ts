import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getShipments,
  createShipment,
  updateShipmentStatus,
  receiveShipmentGRN,
  simulateCarrierTelemetry,
  ShipmentCreatePayload,
  GRNReceivingPayload,
} from "@/lib/api/shipments";

export const shipmentKeys = {
  all: ["shipments"] as const,
  list: (status?: string, page?: number) => [...shipmentKeys.all, "list", status, page] as const,
};

export function useShipmentList(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: shipmentKeys.list(params?.status, params?.page),
    queryFn: () => getShipments(params),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useDelayedShipments() {
  return useQuery({
    queryKey: shipmentKeys.list("delayed", 1),
    queryFn: () => getShipments({ status: "delayed" }),
    staleTime: 1000 * 30,
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ShipmentCreatePayload) => createShipment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status: string; current_location?: string } }) =>
      updateShipmentStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
    },
  });
}

export function useReceiveShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: GRNReceivingPayload }) =>
      receiveShipmentGRN(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useSimulateCarrierTelemetry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: simulateCarrierTelemetry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
    },
  });
}
