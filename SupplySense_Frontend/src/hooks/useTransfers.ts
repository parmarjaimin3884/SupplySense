/**
 * SupplySense — Stock Transfers React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/keys";
import { transfersApi } from "@/lib/api/transfers";
import type { StockTransferCreateRequest } from "@/types/transfer";

export function useTransferRecommendations(limit: number = 5) {
  return useQuery({
    queryKey: [...queryKeys.transfers.recommendations, limit],
    queryFn: () => transfersApi.getRecommendations(limit),
  });
}

export function useStockTransfers(limit: number = 20) {
  return useQuery({
    queryKey: [...queryKeys.transfers.list, limit],
    queryFn: () => transfersApi.getList(limit),
  });
}

export function useInitiateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StockTransferCreateRequest) => transfersApi.initiate(payload),
    onSuccess: () => {
      // Invalidate relevant caches to reflect stock reservation and new transfer
      queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
