import apiClient from './client';
import { generateWarehouses } from './mockData';
import { WarehouseItem } from '@/types';

const mockWarehouses = generateWarehouses(50);

export const warehousesApi = {
  async getWarehouses(): Promise<{ data: WarehouseItem[]; total: number }> {
    try {
      const response = await apiClient.get('/api/v1/warehouses');
      return response.data;
    } catch {
      return { data: mockWarehouses, total: mockWarehouses.length };
    }
  },

  async getWarehouseById(id: string): Promise<WarehouseItem | null> {
    try {
      const response = await apiClient.get(`/api/v1/warehouses/${id}`);
      return response.data;
    } catch {
      const item = mockWarehouses.find(w => w.id === id || w.code === id);
      return item || mockWarehouses[0];
    }
  }
};
