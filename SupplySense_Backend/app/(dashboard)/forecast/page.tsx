import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/PageLoadingSkeleton';

const ForecastContent = dynamic(() => import('./ForecastContent'), {
  loading: () => <PageLoadingSkeleton />,
});

export default function ForecastPage() {
  return <ForecastContent />;
}
