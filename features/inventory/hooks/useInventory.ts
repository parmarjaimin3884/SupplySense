import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '@/lib/services/inventoryService';
import { InventoryQueryParams } from '@/types';

export function useInventory(params: InventoryQueryParams = {}) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => inventoryService.getInventory(params),
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ['inventoryItem', id],
    queryFn: () => inventoryService.getInventoryItemById(id),
    enabled: Boolean(id),
  });
}
