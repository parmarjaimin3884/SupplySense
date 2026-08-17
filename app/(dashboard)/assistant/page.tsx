import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/PageLoadingSkeleton';

const AssistantContent = dynamic(() => import('./AssistantContent'), {
  loading: () => <PageLoadingSkeleton />,
});

export default function AssistantPage() {
  return <AssistantContent />;
}
