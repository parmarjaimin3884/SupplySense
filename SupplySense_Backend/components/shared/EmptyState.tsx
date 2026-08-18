import React from 'react';
import { FolderX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

export function EmptyState({
  title = 'No records found',
  description = 'There are no active records matching your current filter criteria or parameters.',
  actionLabel,
  onAction,
  icon: Icon = FolderX,
}: EmptyStateProps) {
  return (
    <div className="p-12 text-center bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center my-4">
      <div className="p-4 rounded-full bg-slate-100 text-slate-500 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
