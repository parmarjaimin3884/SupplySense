import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/PageLoadingSkeleton';

const ExecutiveContent = dynamic(() => import('./ExecutiveContent'), {
  loading: () => <PageLoadingSkeleton />,
});

export default function ExecutivePage() {
  return <ExecutiveContent />;
}
