import { useQuery } from '@tanstack/react-query';
import { forecastService } from '@/lib/services/forecastService';

export function useForecast(params: { product?: string; category?: string; warehouse?: string } = {}) {
  return useQuery({
    queryKey: ['forecast', params],
    queryFn: () => forecastService.getForecastData(params),
  });
}
