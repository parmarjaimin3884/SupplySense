import { useQuery } from '@tanstack/react-query';
import { executiveService } from '@/lib/services/executiveService';

export function useExecutiveSummary() {
  return useQuery({
    queryKey: ['executiveSummary'],
    queryFn: () => executiveService.getExecutiveSummary(),
  });
}
