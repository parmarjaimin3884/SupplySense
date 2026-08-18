import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/PageLoadingSkeleton';

const WarehousesContent = dynamic(() => import('./WarehousesContent'), {
  loading: () => <PageLoadingSkeleton />,
});

export default function WarehousesPage() {
  return <WarehousesContent />;
}
