import { useQuery } from '@tanstack/react-query';
import { suppliersService } from '@/lib/services/suppliersService';

export function useSuppliers(params: { search?: string; status?: string; region?: string } = {}) {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => suppliersService.getSuppliers(params),
  });
}

export function useSupplierItem(id: string) {
  return useQuery({
    queryKey: ['supplierItem', id],
    queryFn: () => suppliersService.getSupplierById(id),
    enabled: Boolean(id),
  });
}
