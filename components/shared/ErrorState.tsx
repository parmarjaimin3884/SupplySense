import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Service Unavailable',
  message = 'Failed to load telemetry data from SupplySense FastAPI backend service.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="p-8 bg-rose-50/50 border border-rose-200 rounded-xl text-center flex flex-col items-center justify-center my-4">
      <div className="p-3 rounded-full bg-rose-100 text-rose-600 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-rose-900">{title}</h4>
      <p className="text-xs text-rose-700 mt-1 max-w-md">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} className="mt-4">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Retry Request
        </Button>
      )}
    </div>
  );
}
