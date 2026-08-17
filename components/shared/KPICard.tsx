import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface KPICardProps {
  title: string;
  value: string | number;
  label?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    isGood?: boolean;
  };
  icon?: React.ElementType;
  statusIndicator?: 'success' | 'warning' | 'danger' | 'info' | 'ai';
  className?: string;
}

export function KPICard({ title, value, label, trend, icon: Icon, statusIndicator, className }: KPICardProps) {
  const statusColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-blue-500',
    ai: 'bg-indigo-500 shadow-ai-glow',
  };

  return (
    <Card className={cn('p-5 relative overflow-hidden flex flex-col justify-between', className)}>
      {/* Optional Status Pill */}
      {statusIndicator && (
        <div className={cn('absolute top-0 right-0 h-1 w-16 rounded-bl-full', statusColors[statusIndicator])} />
      )}

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">{title}</span>
          {Icon && (
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="text-2xl font-bold text-slate-900 tracking-tight font-sans my-1">{value}</div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs">
        {label && <span className="text-slate-500 font-medium truncate">{label}</span>}

        {trend && (
          <div
            className={cn(
              'inline-flex items-center gap-1 font-semibold text-[11px] px-1.5 py-0.5 rounded',
              trend.isGood === undefined
                ? trend.direction === 'up'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-rose-700 bg-rose-50'
                : trend.isGood
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-rose-700 bg-rose-50'
            )}
          >
            {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend.direction === 'neutral' && <Minus className="w-3 h-3" />}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
