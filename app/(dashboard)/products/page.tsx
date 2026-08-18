import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/PageLoadingSkeleton';

const ProductsContent = dynamic(() => import('./ProductsContent'), {
  loading: () => <PageLoadingSkeleton />,
});

export default function ProductsPage() {
  return <ProductsContent />;
}
