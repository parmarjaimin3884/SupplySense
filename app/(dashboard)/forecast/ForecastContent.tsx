'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, Sparkles } from 'lucide-react';
import { useForecast } from '@/features/forecast/hooks/useForecast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { CATEGORIES } from '@/lib/mock/fixtures';

// Lazy-load recharts chart
const ForecastChart = dynamic(() => import('./ForecastChart'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export default function ForecastContent() {
  const [category, setCategory] = useState('ALL');

  const { data, isLoading, error, refetch } = useForecast({ category });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Predictive Demand Projection</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Demand history baseline vs projected consumption trends and estimated bounds.</p>
        </div>

        <div className="w-64">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[{ value: 'ALL', label: 'All Product Categories' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
          />
        </div>
      </div>

      <Card className="p-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                12-Month Consumption Forecast vs Historical Baseline
              </CardTitle>
              <CardDescription>Includes lower and upper estimated bounds</CardDescription>
            </div>
            <Badge variant="ai" size="md">
              Estimated Bounds
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-96 w-full pt-4">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : error ? (
              <ErrorState onRetry={refetch} />
            ) : (
              <ForecastChart data={data?.data} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
