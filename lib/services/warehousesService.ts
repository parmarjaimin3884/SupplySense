import apiClient from '@/lib/api/client';
import { DataSourceConfig } from '@/lib/config/dataSource';
import { generateWarehouses } from '@/lib/mock/fixtures';
import { WarehouseItem } from '@/types';

const mockWarehouses = generateWarehouses(10);

export const warehousesService = {
  async getWarehouses(): Promise<{ data: WarehouseItem[]; total: number }> {
    if (DataSourceConfig.isApi) {
      const response = await apiClient.get('/api/v1/warehouses');
      return response.data;
    }
    return { data: mockWarehouses, total: mockWarehouses.length };
  },

  async getWarehouseById(id: string): Promise<WarehouseItem | null> {
    if (DataSourceConfig.isApi) {
      const response = await apiClient.get(`/api/v1/warehouses/${id}`);
      return response.data;
    }
    const item = mockWarehouses.find(w => w.id === id || w.code === id);
    return item || mockWarehouses[0];
  }
};
