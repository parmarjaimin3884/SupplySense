import React from 'react';
import { Skeleton, CardSkeleton } from '@/components/ui/skeleton';

/**
 * Reusable full-page loading skeleton shown while route content
 * is being dynamically imported via next/dynamic.
 */
export function PageLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-7 w-72" />
        <Skeleton className="h-3 w-96" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
        <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
