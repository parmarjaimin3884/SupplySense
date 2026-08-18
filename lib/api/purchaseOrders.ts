import apiClient from './client';
import { MOCK_PURCHASE_ORDERS } from './mockData';
import { PurchaseOrderItem, POStatus } from '@/types';

export const purchaseOrdersApi = {
  async getPurchaseOrders(params: { status?: string; search?: string; supplier?: string } = {}): Promise<{ data: PurchaseOrderItem[]; total: number }> {
    try {
      const response = await apiClient.get('/api/v1/purchase-orders', { params });
      return response.data;
    } catch {
      const { status = 'ALL', search = '', supplier = 'ALL' } = params;
      let list = [...MOCK_PURCHASE_ORDERS];

      if (search) {
        const q = search.toLowerCase();
        list = list.filter(po => po.poNumber.toLowerCase().includes(q) || po.supplierName.toLowerCase().includes(q));
      }
      if (status !== 'ALL') {
        list = list.filter(po => po.status === status);
      }
      if (supplier !== 'ALL') {
        list = list.filter(po => po.supplierName.includes(supplier));
      }

      return { data: list, total: list.length };
    }
  },

  async getPurchaseOrderById(id: string): Promise<PurchaseOrderItem | null> {
    try {
      const response = await apiClient.get(`/api/v1/purchase-orders/${id}`);
      return response.data;
    } catch {
      const item = MOCK_PURCHASE_ORDERS.find(po => po.id === id || po.poNumber === id);
      return item || MOCK_PURCHASE_ORDERS[0];
    }
  },

  async updatePOStatus(id: string, status: POStatus): Promise<{ success: boolean; data: PurchaseOrderItem }> {
    try {
      const response = await apiClient.patch(`/api/v1/purchase-orders/${id}/status`, { status });
      return response.data;
    } catch {
      const po = MOCK_PURCHASE_ORDERS.find(p => p.id === id) || MOCK_PURCHASE_ORDERS[0];
      const updated = { ...po, status };
      return { success: true, data: updated };
    }
  }
};
