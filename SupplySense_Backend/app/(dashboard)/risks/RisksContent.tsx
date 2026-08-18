'use client';

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useRisks } from '@/features/risks/hooks/useRisks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatDate } from '@/lib/utils';
import { RiskSeverity } from '@/types';

export default function RisksContent() {
  const [severity, setSeverity] = useState<RiskSeverity | 'ALL'>('ALL');
  const { data, isLoading, error, refetch } = useRisks({ severity });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Supply Chain Risk Monitoring</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Composite threat assessment across logistics, stock levels, and vendor SLAs.</p>
        </div>

        <div className="w-48">
          <Select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as RiskSeverity | 'ALL')}
            options={[
              { value: 'ALL', label: 'All Severities' },
              { value: 'CRITICAL', label: 'Critical' },
              { value: 'HIGH', label: 'High' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'LOW', label: 'Low' },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-2">
          <CardHeader>
            <CardTitle className="text-sm text-slate-300">Composite Supply Chain Risk Score</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-5xl font-black text-amber-400">{data?.overallRiskScore || 78} <span className="text-sm font-normal text-slate-400">/ 100</span></div>
            <p className="text-xs text-slate-300">MODERATE TO HIGH THREAT MATRIX</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">3x3 Threat Assessment Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold font-mono">
              <div className="p-3 bg-rose-100 text-rose-900 rounded-lg">High Impact / High Likelihood (Critical)</div>
              <div className="p-3 bg-amber-100 text-amber-900 rounded-lg">High Impact / Med Likelihood</div>
              <div className="p-3 bg-slate-100 text-slate-800 rounded-lg">High Impact / Low Likelihood</div>
              <div className="p-3 bg-amber-100 text-amber-900 rounded-lg">Med Impact / High Likelihood</div>
              <div className="p-3 bg-slate-100 text-slate-800 rounded-lg">Med Impact / Med Likelihood</div>
              <div className="p-3 bg-emerald-100 text-emerald-900 rounded-lg">Med Impact / Low Likelihood</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Active Operational Threat Records</h2>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : (
          <div className="space-y-3">
            {data?.data.map((risk) => (
              <Card key={risk.id} className="p-4 space-y-2 hover:border-slate-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={risk.severity} />
                    <span className="font-bold text-sm text-slate-900">{risk.title}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{formatDate(risk.detectedTime)}</span>
                </div>
                <p className="text-xs text-slate-600"><strong>Root Cause:</strong> {risk.reason}</p>
                <p className="text-xs text-slate-600"><strong>Impact Scope:</strong> {risk.impact}</p>
                <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-900 font-medium">
                  Recommendation: {risk.recommendedAction}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
