import apiClient from '@/lib/api/client';
import { DataSourceConfig } from '@/lib/config/dataSource';
import { MOCK_RISKS } from '@/lib/mock/fixtures';
import { RiskItem } from '@/types';

export const risksService = {
  async getRisks(params: { severity?: string; category?: string } = {}): Promise<{ data: RiskItem[]; overallRiskScore: number }> {
    if (DataSourceConfig.isApi) {
      const response = await apiClient.get('/api/v1/risks', { params });
      return response.data;
    }

    const { severity = 'ALL' } = params;
    let list = [...MOCK_RISKS];
    if (severity !== 'ALL') {
      list = list.filter(r => r.severity === severity);
    }
    return { data: list, overallRiskScore: 78 };
  }
};
