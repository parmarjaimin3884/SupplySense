import apiClient from './client';
import { generateSuppliers } from './mockData';
import { SupplierItem } from '@/types';

const mockSuppliers = generateSuppliers(100);

export const suppliersApi = {
  async getSuppliers(params: { search?: string; status?: string; region?: string } = {}): Promise<{ data: SupplierItem[]; total: number }> {
    try {
      const response = await apiClient.get('/api/v1/suppliers', { params });
      return response.data;
    } catch {
      const { search = '', status = 'ALL', region = 'ALL' } = params;
      let list = [...mockSuppliers];

      if (search) {
        const q = search.toLowerCase();
        list = list.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.region.toLowerCase().includes(q));
      }
      if (status !== 'ALL') {
        list = list.filter(s => s.status === status);
      }
      if (region !== 'ALL') {
        list = list.filter(s => s.region === region);
      }

      return { data: list, total: list.length };
    }
  },

  async getSupplierById(id: string): Promise<SupplierItem | null> {
    try {
      const response = await apiClient.get(`/api/v1/suppliers/${id}`);
      return response.data;
    } catch {
      const item = mockSuppliers.find(s => s.id === id || s.code === id);
      return item || mockSuppliers[0];
    }
  }
};
