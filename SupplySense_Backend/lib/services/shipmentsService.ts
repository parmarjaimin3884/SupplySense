import apiClient from '@/lib/api/client';
import { DataSourceConfig } from '@/lib/config/dataSource';
import { MOCK_SHIPMENTS } from '@/lib/mock/fixtures';
import { ShipmentItem } from '@/types';

export const shipmentsService = {
  async getShipments(params: { status?: string; search?: string } = {}): Promise<{ data: ShipmentItem[]; total: number }> {
    if (DataSourceConfig.isApi) {
      const response = await apiClient.get('/api/v1/shipments', { params });
      return response.data;
    }

    const { status = 'ALL', search = '' } = params;
    let list = [...MOCK_SHIPMENTS];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.shipmentNo.toLowerCase().includes(q) || s.carrier.toLowerCase().includes(q) || s.trackingNo.toLowerCase().includes(q));
    }
    if (status !== 'ALL') {
      list = list.filter(s => s.status === status);
    }

    return { data: list, total: list.length };
  },

  async getShipmentById(id: string): Promise<ShipmentItem | null> {
    if (DataSourceConfig.isApi) {
      const response = await apiClient.get(`/api/v1/shipments/${id}`);
      return response.data;
    }
    const item = MOCK_SHIPMENTS.find(s => s.id === id || s.shipmentNo === id);
    return item || MOCK_SHIPMENTS[0];
  }
};
