'use client';

import React from 'react';
import { Award, Download, CheckCircle2 } from 'lucide-react';
import { useExecutiveSummary } from '@/features/executive/hooks/useExecutive';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import { canAccessRoute } from '@/lib/auth/permissions';
import { redirect } from 'next/navigation';

export default function ExecutiveContent() {
  const { role } = useAuthStore();

  if (!canAccessRoute(role, '/executive')) {
    redirect('/dashboard');
  }

  const { data, isLoading, error, refetch } = useExecutiveSummary();

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (error || !data) return <ErrorState message="Executive digest unavailable." onRetry={refetch} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">CSCO Executive Briefing</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">High-level operational summary for chief supply chain officer perspective.</p>
        </div>

        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-1.5" /> Export Executive PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-indigo-950 text-white p-2 border-indigo-900 shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm text-indigo-200">Total Supply Chain Capital</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-black text-white">{formatCurrency(data.totalInventoryValue)}</div>
            <div className="text-xs text-indigo-300">Working Capital Efficiency: {data.workingCapitalEfficiency}</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Board Briefing Synopsis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">{data.boardBriefingSummary}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-slate-900">Top 5 Operations Action Priorities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.top5Priorities.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span className="font-medium text-slate-800">{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
