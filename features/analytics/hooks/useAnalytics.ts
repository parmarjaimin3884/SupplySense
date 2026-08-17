import { useQuery } from '@tanstack/react-query';
import { mockAnalyticsService } from '@/lib/services/mock/analytics';

export function useAnalyticsKPIs() {
  return useQuery({
    queryKey: ['analyticsKPIs'],
    queryFn: () => mockAnalyticsService.getDashboardKPIs(),
  });
}

export function useInventoryOverviewAnalytics() {
  return useQuery({
    queryKey: ['inventoryOverviewAnalytics'],
    queryFn: () => mockAnalyticsService.getInventoryOverview(),
  });
}
