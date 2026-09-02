/**
 * SupplySense — React Query Provider
 *
 * Configures QueryClient with production defaults:
 * - 5 minute stale time
 * - 2 retries (skip for auth errors)
 * - Refetch on window focus
 * - DevTools in development
 */

"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ApiError } from "@/types/common";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30 seconds default cache for fast page transitions
        gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        structuralSharing: true, // Prevents re-rendering if data hasn't changed
        notifyOnChangeProps: ["data", "error"], // Eliminates background fetching re-render lag
        retry: (failureCount, error) => {
          // Don't retry auth errors
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
