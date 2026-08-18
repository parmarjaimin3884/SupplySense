import { useQuery } from '@tanstack/react-query';
import { risksService } from '@/lib/services/risksService';

export function useRisks(params: { severity?: string; category?: string } = {}) {
  return useQuery({
    queryKey: ['risks', params],
    queryFn: () => risksService.getRisks(params),
  });
}
