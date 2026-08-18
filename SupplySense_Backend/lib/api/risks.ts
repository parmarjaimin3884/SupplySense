import apiClient from './client';
import { MOCK_RISKS } from './mockData';
import { RiskItem } from '@/types';

export const risksApi = {
  async getRisks(params: { severity?: string; category?: string } = {}): Promise<{ data: RiskItem[]; overallRiskScore: number }> {
    try {
      const response = await apiClient.get('/api/v1/risks', { params });
      return response.data;
    } catch {
      const { severity = 'ALL' } = params;
      let list = [...MOCK_RISKS];
      if (severity !== 'ALL') {
        list = list.filter(r => r.severity === severity);
      }
      return { data: list, overallRiskScore: 78 };
    }
  }
};
