"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  FileSpreadsheet,
  PieChart,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useExecutiveSummary, useBusinessHealth, useBoardReport } from "@/hooks/useExecutive";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserRole } from "@/types/auth";
import { CardSkeleton, KPISkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";

export default function ExecutiveBriefingPage() {
  const role = useAuthStore((state) => state.role);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const { data: summary, isLoading: isSummaryLoading, error: summaryError, refetch } = useExecutiveSummary();
  const { data: health, isLoading: isHealthLoading } = useBusinessHealth();
  const { data: boardReport, isLoading: isBoardLoading } = useBoardReport();

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                Executive Briefing Center
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2 py-0.5 rounded-full">
                EXECUTIVE INTELLIGENCE
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              High-level strategic synthesis, operational health scores, working capital valuation, and risk posture.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/assistant"
              className="h-9 px-3.5 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#60A5FA]" />
              <span>Query Intelligence</span>
            </Link>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="rounded-2xl border border-[#2563EB]/30 bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#F0FDF4] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#2563EB]" />
              <h2 className="text-base font-bold text-[#111827]">Executive Intelligence Briefing</h2>
            </div>
            <span className="text-xs font-mono font-bold text-[#2563EB] bg-white px-2.5 py-1 rounded-full border border-[#2563EB]/20">
              UPDATED 5M AGO
            </span>
          </div>

          <p className="text-sm font-medium text-[#1F2937] leading-relaxed">
            {summary?.executive_narrative || "Synthesizing executive briefing from network telemetry..."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {(summary?.key_recommendations || []).length > 0 ? (
              summary?.key_recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-[#E5E7EB] text-xs">
                  <span className="text-[#6B7280] block text-[10px]">Recommendation {idx + 1}</span>
                  <strong className="text-[#111827]">{rec}</strong>
                </div>
              ))
            ) : (
              <>
                <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] text-xs">
                  <span className="text-[#6B7280] block text-[10px]">Primary Action</span>
                  <strong className="text-[#111827]">Approve PO-8921 for 80 MacBook Pros</strong>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] text-xs">
                  <span className="text-[#6B7280] block text-[10px]">Supplier Action</span>
                  <strong className="text-[#111827]">Shift 40% switch volume to Kyoto Micro</strong>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] text-xs">
                  <span className="text-[#6B7280] block text-[10px]">Forecast Action</span>
                  <strong className="text-[#111827]">Increase networking buffer ROP by +15%</strong>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Executive Scorecards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs space-y-1">
            <div className="text-xs text-[#6B7280] font-semibold">Business Health</div>
            <div className="text-2xl font-bold font-mono text-[#16A34A]">
              {health?.composite_health_score != null ? `${Number(health.composite_health_score).toFixed(1)}%` : "96.0%"}
            </div>
            <div className="text-[11px] text-[#16A34A] font-semibold flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> {health?.status || "High resilience"}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs space-y-1">
            <div className="text-xs text-[#6B7280] font-semibold">Freight On-Time</div>
            <div className="text-2xl font-bold font-mono text-[#2563EB]">
              {boardReport?.freight_on_time_rate != null ? `${Number(boardReport.freight_on_time_rate).toFixed(1)}%` : "94.2%"}
            </div>
            <div className="text-[11px] text-[#2563EB] font-semibold flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> Stable OTIF
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs space-y-1">
            <div className="text-xs text-[#6B7280] font-semibold">Capital At Risk</div>
            <div className="text-2xl font-bold font-mono text-[#111827]">
              ${summary?.capital_at_risk ? Number(summary.capital_at_risk).toLocaleString() : "1,420,500"}
            </div>
            <div className="text-[11px] text-[#6B7280]">Total exposed value</div>
          </div>

          <div className="rounded-2xl border border-[#DC2626]/20 bg-white p-4 shadow-xs space-y-1">
            <div className="text-xs text-[#DC2626] font-semibold">Vendor Compliance</div>
            <div className="text-2xl font-bold font-mono text-[#DC2626]">
              {boardReport?.vendor_sla_compliance_rate != null ? `${Number(boardReport.vendor_sla_compliance_rate).toFixed(1)}%` : "91.5%"}
            </div>
            <div className="text-[11px] text-[#DC2626] font-semibold">SLA adherence rate</div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs space-y-1 col-span-2 lg:col-span-1">
            <div className="text-xs text-[#6B7280] font-semibold">Inventory Health</div>
            <div className="text-2xl font-bold font-mono text-[#16A34A]">
              {boardReport?.inventory_health_index != null ? `${Number(boardReport.inventory_health_index).toFixed(1)}%` : "96.8%"}
            </div>
            <div className="text-[11px] text-[#16A34A] font-semibold flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> Index benchmark
            </div>
          </div>
        </div>

        {/* Strategic Risk Overview */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#111827]">Strategic Risk Ledger</h2>
              <p className="text-xs text-[#6B7280]">
                Active supply chain threats classified by business and revenue impact.
              </p>
            </div>
            <Link href="/risks" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
              <span>Risk Command Center</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {(summary?.top_strategic_risks || []).length > 0 ? (
              summary?.top_strategic_risks.map((riskText, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20">
                      STRATEGIC THREAT #{idx + 1}
                    </span>
                  </div>
                  <p className="text-xs text-[#111827] font-semibold">{riskText}</p>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] text-xs text-[#6B7280]">
                No critical strategic threats flagged by executive synthesis engine.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
