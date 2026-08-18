import { useQuery } from '@tanstack/react-query';
import { mockProductService } from '@/lib/services/mock/products';
import { InventoryQueryParams } from '@/types';

export function useProducts(params: InventoryQueryParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => mockProductService.getProducts(params),
  });
}

export function useProductItem(id: string) {
  return useQuery({
    queryKey: ['productItem', id],
    queryFn: () => mockProductService.getProductById(id),
    enabled: Boolean(id),
  });
}
