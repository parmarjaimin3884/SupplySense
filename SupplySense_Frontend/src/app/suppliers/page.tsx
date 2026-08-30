"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Filter,
  Plus,
  Search,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useSupplierList } from "@/hooks/useSuppliers";
import { Pagination } from "@/components/ui/pagination";
import { CardSkeleton, TableRowSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import type { Supplier } from "@/types/supplier";

export default function SuppliersDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [reallocatedCount, setReallocatedCount] = useState<number>(0);
  const limit = 10;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("supplysense_reallocated_vendors");
      if (saved) {
        const parsed = JSON.parse(saved);
        setReallocatedCount(parsed.length);
      }
    } catch {}
  }, []);

  // API Hook — server-side search and risk filter
  const { data: supplierData, isLoading, error, refetch } = useSupplierList({
    page,
    limit,
    search: searchQuery || undefined,
    risk_rating: statusFilter !== "all" ? statusFilter.toUpperCase() : undefined,
  });

  const filteredSuppliers: Supplier[] = supplierData?.data || [];
  const meta = supplierData?.meta;

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                Supplier Intelligence & Scorecards
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2 py-0.5 rounded-full">
                {meta?.total_items ?? 0} ACTIVE PARTNERS
              </span>
              <span className="text-[10px] font-mono font-bold bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>⭐ Ranked: Best Reliability First</span>
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Real-time supplier performance auditing, lead-time variance tracking, defect rates, and alternate vendor routing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/purchase-orders"
              className="h-9 px-3.5 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#111827] hover:bg-[#F9FAFB] shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <Truck className="h-3.5 w-3.5 text-[#6B7280]" />
              <span>Purchase Orders</span>
            </Link>
          </div>
        </div>

        {/* AI Supplier Intelligence Highlight */}
        <div className="rounded-2xl border border-[#D97706]/30 bg-[#FFFBEB]/30 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#D97706]">
              <Sparkles className="h-4 w-4" />
              <span>SUPPLIER INTELLIGENCE ALERT</span>
            </div>
            <p className="text-xs text-[#374151] leading-relaxed">
              &ldquo;Supplier ABC reliability decreased during the last 60 days (delivery reliability dropped 18% with +5.2 days lead-time drift). Recommended alternate: <strong className="text-[#111827]">Kyoto Micro Tech (97.8% On-Time)</strong>.&rdquo;
            </p>
          </div>

          <Link
            href="/suppliers/sup-abc"
            className="h-8 px-3 rounded-lg bg-[#111827] text-white text-xs font-semibold hover:bg-black flex items-center gap-1.5 shadow-xs transition-all shrink-0"
          >
            <span>Inspect ABC Electronics</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Active Sourcing Volume Reallocations Widget */}
        {reallocatedCount > 0 && (
          <div className="rounded-2xl border border-[#059669]/25 bg-gradient-to-br from-[#F0FDF4]/80 via-white to-[#EFF6FF]/60 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#059669]/15 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#059669]">
                <Zap className="h-4 w-4 text-[#059669]" />
                <span>ACTIVE VENDOR VOLUME REALLOCATIONS ({reallocatedCount} ACTIVE)</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#059669] text-white px-2 py-0.5 rounded">
                DUAL-SOURCING ACTIVE
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#DC2626]">ABC Electronics Corp (Primary Vendor)</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#059669]" />
                  <span className="font-bold text-[#059669]">Kyoto Micro Tech Pvt Ltd (Backup Vendor)</span>
                </div>
                <p className="text-[11px] text-[#4B5563]">
                  Shifted 100% PO volume allocation. Improved delivery SLA from <strong>82.0% ➔ 97.8% (+15.8% Gain)</strong> with lead time cut from 14d ➔ 3d.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#F0FDF4] text-[#059669] border border-[#059669]/20 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> REALLOCATION COMPLETED
                </span>
                <Link
                  href="/suppliers/sup-abc"
                  className="text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Suppliers Table */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search vendor name, origin, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#111827]"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { label: "All", value: "all" },
                { label: "Healthy (Low)", value: "healthy" },
                { label: "At Risk (High)", value: "at risk" },
                { label: "Under Review (Medium)", value: "under review" },
              ].map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === st.value
                      ? "bg-[#111827] text-white shadow-2xs"
                      : "bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827]"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-semibold bg-[#FAFAFA]">
                  <th className="py-3 px-4">SUPPLIER</th>
                  <th className="py-3 px-4 text-right">RISK SCORE</th>
                  <th className="py-3 px-4 text-right">ON-TIME DELIVERY</th>
                  <th className="py-3 px-4 text-right">QUALITY SCORE</th>
                  <th className="py-3 px-4">LEAD TIME VARIANCE</th>
                  <th className="py-3 px-4">RECOMMENDED ALTERNATE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6] text-[#111827]">
                {isLoading ? (
                  <TableRowSkeleton rows={4} cols={8} />
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="py-6 px-4">
                      <ErrorState error={error} onRetry={refetch} />
                    </td>
                  </tr>
                ) : filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 px-4">
                      <EmptyState title="No Suppliers Found" description="No suppliers match your filter criteria." />
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3.5 px-4 font-medium">
                        <Link href={`/suppliers/${sup.id}`} className="font-bold text-[#111827] hover:text-[#2563EB]">
                          {sup.company_name}
                        </Link>
                        <div className="text-[10px] text-[#6B7280]">
                          {sup.city && sup.country ? `${sup.city}, ${sup.country}` : sup.country || "Global Partner"} · {sup.email || "partner@enterprise.com"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span className={sup.risk_rating === "CRITICAL" || sup.risk_rating === "HIGH" ? "text-[#DC2626]" : "text-[#16A34A]"}>
                          {sup.risk_rating}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span className={(Number(sup.reliability_score) || 95) < 90 ? "text-[#DC2626]" : "text-[#16A34A]"}>
                          {sup.reliability_score != null ? `${Number(sup.reliability_score).toFixed(1)}%` : "95.0%"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span className={(Number(sup.quality_score) || 98) < 85 ? "text-[#DC2626]" : "text-[#16A34A]"}>
                          {sup.quality_score != null ? `${Number(sup.quality_score).toFixed(1)}%` : "98.5%"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#4B5563]">
                        {sup.average_delay ? `+${sup.average_delay} days` : "On schedule"}
                      </td>
                      <td className="py-3.5 px-4 text-[#2563EB] font-medium text-[11px]">
                        {sup.lead_time ? `${sup.lead_time} days lead` : "Standard SLA"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            sup.risk_rating === "CRITICAL" || sup.risk_rating === "HIGH"
                              ? "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20"
                              : sup.risk_rating === "MODERATE"
                              ? "bg-[#FFFBEB] text-[#D97706] border border-[#F59E0B]/20"
                              : "bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20"
                          }`}
                        >
                          {sup.risk_rating}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/suppliers/${sup.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E5E7EB] bg-white text-[11px] font-semibold text-[#111827] hover:bg-[#F3F4F6] shadow-2xs"
                        >
                          <span>Scorecard</span>
                          <ArrowUpRight className="h-3 w-3 text-[#6B7280]" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {meta && (
            <div className="p-4 border-t border-[#E5E7EB]">
              <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
