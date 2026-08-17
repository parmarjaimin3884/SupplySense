'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ForecastDataPoint } from '@/types/forecast';

interface DemandChartProps {
  data: ForecastDataPoint[] | undefined;
}

export default function DemandChart({ data }: DemandChartProps) {
  if (!data) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="historicalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
        <Area type="monotone" dataKey="historicalDemand" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#historicalGrad)" name="Historical" />
        <Area type="monotone" dataKey="projectedDemand" stroke="#6366f1" strokeWidth={2.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#projectedGrad)" name="Projected" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
