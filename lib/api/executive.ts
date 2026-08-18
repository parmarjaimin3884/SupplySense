import apiClient from './client';
import { MOCK_EXECUTIVE_SUMMARY } from './mockData';
import { ExecutiveSummary } from '@/types';

export const executiveApi = {
  async getExecutiveSummary(): Promise<ExecutiveSummary> {
    try {
      const response = await apiClient.get('/api/v1/executive/summary');
      return response.data;
    } catch {
      return MOCK_EXECUTIVE_SUMMARY;
    }
  }
};
