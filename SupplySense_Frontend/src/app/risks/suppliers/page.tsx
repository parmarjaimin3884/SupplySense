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
import { MOCK_SUPPLIERS } from "@/data/mock-data";

export default function SupplierRiskPage() {
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
              <AlertTriangle className="h-3.5 w-3.5" /> Single-Source Drift
            </div>
            <div className="text-2xl font-bold font-mono text-[#DC2626]">+14.0 Days</div>
            <div className="text-[11px] text-[#DC2626]/80 mt-0.5">Shenzen Precision regional power delay</div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
            <div className="text-xs text-[#6B7280] font-medium mb-1">Average OTIF Fidelity</div>
            <div className="text-2xl font-bold font-mono text-[#111827]">96.8%</div>
            <div className="text-[11px] text-[#16A34A] mt-0.5">3 of 4 vendors meeting SLA</div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
            <div className="text-xs text-[#6B7280] font-medium mb-1">Total Active Spend Audited</div>
            <div className="text-2xl font-bold font-mono text-[#111827]">$4,880,000</div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">Across 4 Tier-1 global vendors</div>
          </div>
        </div>

        {/* Supplier Ranking & Risk Leaderboard */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between">
            <h2 className="text-base font-bold text-[#111827]">Supplier Risk Ranking Matrix</h2>
            <span className="text-xs text-[#6B7280]">Real-time ERP PO History</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-semibold bg-[#FAFAFA]">
                  <th className="py-3 px-4">SUPPLIER NAME</th>
                  <th className="py-3 px-4">LOCATION</th>
                  <th className="py-3 px-4 text-right">OTIF FIDELITY</th>
                  <th className="py-3 px-4 text-right">LEAD-TIME DRIFT</th>
                  <th className="py-3 px-4 text-right">ACTIVE SPEND</th>
                  <th className="py-3 px-4">RISK STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {MOCK_SUPPLIERS.map((sup) => (
                  <tr key={sup.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#111827]">
                      <Link href={`/suppliers/${sup.id}`} className="hover:text-[#2563EB]">
                        {sup.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-[#4B5563]">{sup.origin}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span
                        className={
                          parseFloat(sup.otifRate) < 90
                            ? "text-[#DC2626]"
                            : parseFloat(sup.otifRate) < 95
                            ? "text-[#D97706]"
                            : "text-[#16A34A]"
                        }
                      >
                        {sup.otifRate}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-[#111827]">
                      {sup.leadTimeVariance}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#111827]">
                      {sup.activeSpend}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          sup.status.includes("At Risk")
                            ? "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20"
                            : sup.status.includes("Preferred") || sup.status.includes("Strategic")
                            ? "bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20"
                            : "bg-[#FFFBEB] text-[#D97706] border border-[#F59E0B]/20"
                        }`}
                      >
                        {sup.status}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
