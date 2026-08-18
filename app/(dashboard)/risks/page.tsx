import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/PageLoadingSkeleton';

const RisksContent = dynamic(() => import('./RisksContent'), {
  loading: () => <PageLoadingSkeleton />,
});

export default function RisksPage() {
  return <RisksContent />;
}
