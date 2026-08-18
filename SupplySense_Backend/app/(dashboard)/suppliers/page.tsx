import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/PageLoadingSkeleton';

const SuppliersContent = dynamic(() => import('./SuppliersContent'), {
  loading: () => <PageLoadingSkeleton />,
});

export default function SuppliersPage() {
  return <SuppliersContent />;
}
