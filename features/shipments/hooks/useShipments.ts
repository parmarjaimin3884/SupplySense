import { useQuery } from '@tanstack/react-query';
import { shipmentsService } from '@/lib/services/shipmentsService';

export function useShipments(params: { status?: string; search?: string } = {}) {
  return useQuery({
    queryKey: ['shipments', params],
    queryFn: () => shipmentsService.getShipments(params),
  });
}

export function useShipmentItem(id: string) {
  return useQuery({
    queryKey: ['shipmentItem', id],
    queryFn: () => shipmentsService.getShipmentById(id),
    enabled: Boolean(id),
  });
}
