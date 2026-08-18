import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/PageLoadingSkeleton';

const InventoryContent = dynamic(() => import('./InventoryContent'), {
  loading: () => <PageLoadingSkeleton />,
});

export default function InventoryPage() {
  return <InventoryContent />;
}
