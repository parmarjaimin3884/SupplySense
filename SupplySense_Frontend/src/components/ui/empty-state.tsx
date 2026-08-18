/**
 * SupplySense — Empty State Component
 */

"use client";

import React from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title = "No Data Found",
  description = "There is no data to display at this time.",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F4F6] mb-4">
        {icon || <Inbox className="h-7 w-7 text-[#9CA3AF]" />}
      </div>
      <h3 className="text-base font-semibold text-[#111827] mb-1">{title}</h3>
      <p className="text-sm text-[#6B7280] max-w-md mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
