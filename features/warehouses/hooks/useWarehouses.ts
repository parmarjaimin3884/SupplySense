import { useQuery } from '@tanstack/react-query';
import { warehousesService } from '@/lib/services/warehousesService';

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehousesService.getWarehouses(),
  });
}

export function useWarehouseItem(id: string) {
  return useQuery({
    queryKey: ['warehouseItem', id],
    queryFn: () => warehousesService.getWarehouseById(id),
    enabled: Boolean(id),
  });
}
