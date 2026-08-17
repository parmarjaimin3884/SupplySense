import apiClient from './client';
import { MOCK_FORECAST_DATA } from './mockData';
import { ForecastDataPoint } from '@/types';

export const forecastApi = {
  async getForecastData(params: { product?: string; category?: string; warehouse?: string } = {}): Promise<{ data: ForecastDataPoint[]; confidenceInterval: string }> {
    try {
      const response = await apiClient.get('/api/v1/forecast', { params });
      return response.data;
    } catch {
      return { data: MOCK_FORECAST_DATA, confidenceInterval: '95%' };
    }
  }
};
