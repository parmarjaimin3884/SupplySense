import apiClient from '@/lib/api/client';
import { DataSourceConfig } from '@/lib/config/dataSource';
import { MOCK_EXECUTIVE_SUMMARY } from '@/lib/mock/fixtures';
import { ExecutiveSummary } from '@/types';

export const executiveService = {
  async getExecutiveSummary(): Promise<ExecutiveSummary> {
    if (DataSourceConfig.isApi) {
      const response = await apiClient.get('/api/v1/executive/summary');
      return response.data;
    }
    return MOCK_EXECUTIVE_SUMMARY;
  }
};
