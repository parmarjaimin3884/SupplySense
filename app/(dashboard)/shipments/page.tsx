import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/PageLoadingSkeleton';

const ShipmentsContent = dynamic(() => import('./ShipmentsContent'), {
  loading: () => <PageLoadingSkeleton />,
});

export default function ShipmentsPage() {
  return <ShipmentsContent />;
}
