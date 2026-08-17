import React from 'react';
import { cn, getStatusBadgeVariant } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'ai' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'neutral', size = 'sm', children, ...props }: BadgeProps) {
  const base = 'inline-flex items-center font-medium tracking-wide rounded-full border transition-colors select-none';

  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    info: 'bg-blue-50 text-blue-700 border-blue-200/80',
    ai: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 shadow-subtle',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] leading-4 gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const { variant, label } = getStatusBadgeVariant(status);
  return (
    <Badge variant={variant} className={className}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </Badge>
  );
}
