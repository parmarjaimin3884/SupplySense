import apiClient from '@/lib/api/client';
import { DataSourceConfig } from '@/lib/config/dataSource';
import { MOCK_PURCHASE_ORDERS } from '@/lib/mock/fixtures';
import { PurchaseOrderItem, POStatus } from '@/types';

export const purchaseOrdersService = {
  async getPurchaseOrders(params: { status?: string; search?: string; supplier?: string } = {}): Promise<{ data: PurchaseOrderItem[]; total: number }> {
    if (DataSourceConfig.isApi) {
      const response = await apiClient.get('/api/v1/purchase-orders', { params });
      return response.data;
    }

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
  },

  async getPurchaseOrderById(id: string): Promise<PurchaseOrderItem | null> {
    if (DataSourceConfig.isApi) {
      const response = await apiClient.get(`/api/v1/purchase-orders/${id}`);
      return response.data;
    }
    const item = MOCK_PURCHASE_ORDERS.find(po => po.id === id || po.poNumber === id);
    return item || MOCK_PURCHASE_ORDERS[0];
  },

  async updatePOStatus(id: string, status: POStatus): Promise<{ success: boolean; data: PurchaseOrderItem }> {
    if (DataSourceConfig.isApi) {
      const response = await apiClient.patch(`/api/v1/purchase-orders/${id}/status`, { status });
      return response.data;
    }
    const po = MOCK_PURCHASE_ORDERS.find(p => p.id === id) || MOCK_PURCHASE_ORDERS[0];
    const updated = { ...po, status };
    return { success: true, data: updated };
  }
};
