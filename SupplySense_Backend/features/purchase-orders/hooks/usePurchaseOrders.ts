import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrdersService } from '@/lib/services/purchaseOrdersService';
import { POStatus } from '@/types';

export function usePurchaseOrders(params: { status?: string; search?: string; supplier?: string } = {}) {
  return useQuery({
    queryKey: ['purchaseOrders', params],
    queryFn: () => purchaseOrdersService.getPurchaseOrders(params),
  });
}

export function usePurchaseOrderItem(id: string) {
  return useQuery({
    queryKey: ['purchaseOrderItem', id],
    queryFn: () => purchaseOrdersService.getPurchaseOrderById(id),
    enabled: Boolean(id),
  });
}

export function useUpdatePOStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newStatus: POStatus) => purchaseOrdersService.updatePOStatus(id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrderItem', id] });
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
    },
  });
}
