import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-9',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
