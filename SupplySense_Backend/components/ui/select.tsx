import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, label, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-xs font-medium text-slate-700">{label}</label>}
        <select
          ref={ref}
          className={cn(
            'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';
