import apiClient from '@/lib/api/client';
import { DataSourceConfig } from '@/lib/config/dataSource';
import { generateSuppliers } from '@/lib/mock/fixtures';
import { SupplierItem } from '@/types';

const mockSuppliers = generateSuppliers(20);

export const suppliersService = {
  async getSuppliers(params: { search?: string; status?: string; region?: string } = {}): Promise<{ data: SupplierItem[]; total: number }> {
    if (DataSourceConfig.isApi) {
      const response = await apiClient.get('/api/v1/suppliers', { params });
      return response.data;
    }

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
  },

  async getSupplierById(id: string): Promise<SupplierItem | null> {
    if (DataSourceConfig.isApi) {
      const response = await apiClient.get(`/api/v1/suppliers/${id}`);
      return response.data;
    }
    const item = mockSuppliers.find(s => s.id === id || s.code === id);
    return item || mockSuppliers[0];
  }
};
