"use client";

import { forwardRef, useState, InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label = "Password", error, helperText, className = "", id = "password", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold uppercase tracking-wider text-[#374151]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={showPassword ? "text" : "password"}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            className={`w-full h-11 px-3.5 pr-10 rounded-xl border bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] transition-all focus:outline-none focus:ring-2 focus:ring-[#111827]/10 ${
              error
                ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/10"
                : "border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-[#111827]"
            } ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9CA3AF] hover:text-[#4B5563] focus:outline-none transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {error && (
          <p id={`${id}-error`} className="text-xs font-medium text-[#DC2626]">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${id}-helper`} className="text-xs text-[#6B7280]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
