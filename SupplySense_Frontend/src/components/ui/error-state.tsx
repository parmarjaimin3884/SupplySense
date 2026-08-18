/**
 * SupplySense — Error State Component
 */

"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { ApiError } from "@/types/common";

interface ErrorStateProps {
  error: Error | ApiError | null;
  onRetry?: () => void;
  title?: string;
  compact?: boolean;
}

export function ErrorState({ error, onRetry, title, compact = false }: ErrorStateProps) {
  const message = error instanceof ApiError
    ? error.message
    : error?.message || "Something went wrong. Please try again.";

  const statusCode = error instanceof ApiError ? error.status : null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FEF2F2] border border-[#DC2626]/20 text-xs text-[#DC2626]">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span className="flex-1">{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#DC2626]/10 hover:bg-[#DC2626]/20 text-[#DC2626] font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FEF2F2] mb-4">
        <AlertTriangle className="h-7 w-7 text-[#DC2626]" />
      </div>
      <h3 className="text-base font-semibold text-[#111827] mb-1">
        {title || "Failed to Load Data"}
      </h3>
      <p className="text-sm text-[#6B7280] max-w-md mb-4">{message}</p>
      {statusCode && (
        <span className="text-xs font-mono text-[#9CA3AF] mb-3">
          Error {statusCode}
        </span>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111827] text-white text-sm font-semibold hover:bg-black transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
