/**
 * SupplySense — Server-Side Pagination Component
 */

"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@/types/common";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, total_pages, total_items, limit } = meta;

  if (total_pages <= 1) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total_items);

  // Generate page numbers to display
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;

    if (total_pages <= maxVisible) {
      for (let i = 1; i <= total_pages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");

      const start = Math.max(2, page - 1);
      const end = Math.min(total_pages - 1, page + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (page < total_pages - 2) pages.push("...");
      pages.push(total_pages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-1 pt-4">
      <p className="text-xs text-[#6B7280]">
        Showing <span className="font-semibold text-[#111827]">{startItem}</span> to{" "}
        <span className="font-semibold text-[#111827]">{endItem}</span> of{" "}
        <span className="font-semibold text-[#111827]">{total_items}</span> results
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-1.5 text-xs text-[#9CA3AF]">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                p === page
                  ? "bg-[#111827] text-white"
                  : "border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= total_pages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
