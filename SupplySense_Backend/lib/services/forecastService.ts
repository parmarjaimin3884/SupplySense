import apiClient from '@/lib/api/client';
import { DataSourceConfig } from '@/lib/config/dataSource';
import { MOCK_FORECAST_DATA } from '@/lib/mock/fixtures';
import { ForecastDataPoint } from '@/types';

export const forecastService = {
  async getForecastData(params: { product?: string; category?: string; warehouse?: string } = {}): Promise<{ data: ForecastDataPoint[]; confidenceInterval: string }> {
    if (DataSourceConfig.isApi) {
      const response = await apiClient.get('/api/v1/forecast', { params });
      return response.data;
    }
    return { data: MOCK_FORECAST_DATA, confidenceInterval: '95%' };
  }
};
