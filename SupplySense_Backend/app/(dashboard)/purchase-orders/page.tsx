import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/PageLoadingSkeleton';

const PurchaseOrdersContent = dynamic(() => import('./PurchaseOrdersContent'), {
  loading: () => <PageLoadingSkeleton />,
});

export default function PurchaseOrdersPage() {
  return <PurchaseOrdersContent />;
}
