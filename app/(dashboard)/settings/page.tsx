import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/PageLoadingSkeleton';

const SettingsContent = dynamic(() => import('./SettingsContent'), {
  loading: () => <PageLoadingSkeleton />,
});

export default function SettingsPage() {
  return <SettingsContent />;
}
