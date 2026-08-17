'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ForecastDataPoint } from '@/types/forecast';

interface ForecastChartProps {
  data: ForecastDataPoint[] | undefined;
}

export default function ForecastChart({ data }: ForecastChartProps) {
  if (!data) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="boundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#93c5fd" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
        <Area type="monotone" dataKey="upperBound95" stroke="#93c5fd" strokeDasharray="3 3" fillOpacity={1} fill="url(#boundGrad)" name="Upper Estimated Bound" />
        <Area type="monotone" dataKey="historicalDemand" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#histGrad)" name="Historical Demand" />
        <Area type="monotone" dataKey="projectedDemand" stroke="#6366f1" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#projGrad)" name="Projected Demand" />
        <Area type="monotone" dataKey="lowerBound95" stroke="#cbd5e1" strokeDasharray="3 3" fill="none" name="Lower Estimated Bound" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
