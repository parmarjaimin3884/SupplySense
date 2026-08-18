import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/PageLoadingSkeleton';

const DashboardContent = dynamic(() => import('./DashboardContent'), {
  loading: () => <PageLoadingSkeleton />,
});

export default function DashboardPage() {
  return <DashboardContent />;
}
