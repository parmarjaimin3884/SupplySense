"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useSupplierList } from "@/hooks/useSuppliers";

export default function SupplierRiskPage() {
  const { data: supplierData, isLoading } = useSupplierList({ limit: 20 });
  const suppliers: any[] = supplierData?.data || (supplierData as any)?.items || [];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Header */}
        <div className="space-y-2">
          <Link
            href="/risks"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Risk Intelligence Radar</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                Supplier Risk & Fidelity Radar
              </h1>
              <p className="text-xs text-[#6B7280]">
                Continuous auditing of On-Time In-Full (OTIF) reliability, lead-time variance drift, and single-source exposure.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-[#DC2626]/20 bg-white p-4 shadow-xs">
            <div className="text-xs text-[#DC2626] font-bold mb-1 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Single-Source Exposure
            </div>
            <div className="text-2xl font-bold font-mono text-[#DC2626]">Active Audit</div>
            <div className="text-[11px] text-[#DC2626]/80 mt-0.5">Tier-1 vendor SLA monitoring</div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
            <div className="text-xs text-[#6B7280] font-medium mb-1">Average Vendor Fidelity</div>
            <div className="text-2xl font-bold font-mono text-[#111827]">95.4%</div>
            <div className="text-[11px] text-[#16A34A] mt-0.5">Network reliability baseline</div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
            <div className="text-xs text-[#6B7280] font-medium mb-1">Total Monitored Vendors</div>
            <div className="text-2xl font-bold font-mono text-[#111827]">{suppliers.length} Partners</div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">Connected to ERP database</div>
          </div>
        </div>

        {/* Supplier Ranking & Risk Leaderboard */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between">
            <h2 className="text-base font-bold text-[#111827]">Supplier Risk Ranking Matrix</h2>
            <span className="text-xs text-[#6B7280]">Live DB Vendor Scorecards</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-semibold bg-[#FAFAFA]">
                  <th className="py-3 px-4">SUPPLIER NAME</th>
                  <th className="py-3 px-4">LOCATION</th>
                  <th className="py-3 px-4 text-right">RELIABILITY SCORE</th>
                  <th className="py-3 px-4 text-right">LEAD TIME (DAYS)</th>
                  <th className="py-3 px-4 text-right">QUALITY SCORE</th>
                  <th className="py-3 px-4">RISK STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#6B7280]">Loading live vendor telemetry...</td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#6B7280]">No suppliers found in database.</td>
                  </tr>
                ) : (
                  suppliers.map((sup) => {
                    const relScore = Number(sup.reliability_score || 95.0);
                    const qualScore = Number(sup.quality_score || 98.0);
                    const locationStr = sup.city && sup.country ? `${sup.city}, ${sup.country}` : sup.country || "Global Partner";
                    const statusStr = sup.risk_rating || "LOW";

                    return (
                      <tr key={sup.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3 px-4 font-bold text-[#111827]">
                          <Link href={`/suppliers/${sup.id}`} className="hover:text-[#2563EB]">
                            {sup.company_name || sup.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-[#4B5563]">{locationStr}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          <span
                            className={
                              relScore < 85
                                ? "text-[#DC2626]"
                                : relScore < 92
                                ? "text-[#D97706]"
                                : "text-[#16A34A]"
                            }
                          >
                            {relScore}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-[#111827]">
                          {sup.lead_time || 14}d
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#111827]">
                          {qualScore}/100
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              statusStr === "CRITICAL" || statusStr === "HIGH" || statusStr === "At Risk"
                                ? "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20"
                                : "bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20"
                            }`}
                          >
                            {statusStr}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/suppliers/${sup.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline"
                          >
                            <span>Audit</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

