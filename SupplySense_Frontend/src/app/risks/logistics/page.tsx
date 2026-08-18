"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Truck,
  AlertTriangle,
  Radio,
  Clock,
  Building2,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MOCK_LOGISTICS_ROUTES } from "@/data/mock-data";

export default function LogisticsRiskPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
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
                Logistics & Global Corridor Radar
              </h1>
              <p className="text-xs text-[#6B7280]">
                Live freight tracking across maritime corridors, air cargo rerouting, and warehouse receiving throughput.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-[#DC2626]/20 bg-white p-4 shadow-xs">
            <div className="text-xs text-[#DC2626] font-bold mb-1 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Maritime Berth Delay
            </div>
            <div className="text-2xl font-bold font-mono text-[#DC2626]">+11.0 Days</div>
            <div className="text-[11px] text-[#DC2626]/80 mt-0.5">Ningbo Port typhoon shutdown</div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
            <div className="text-xs text-[#6B7280] font-medium mb-1">Delayed Sea Containers</div>
            <div className="text-2xl font-bold font-mono text-[#111827]">8 TEU Units</div>
            <div className="text-[11px] text-[#DC2626] mt-0.5 font-medium">$480k critical components</div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
            <div className="text-xs text-[#6B7280] font-medium mb-1">Air Cargo Substitution</div>
            <div className="text-2xl font-bold font-mono text-[#2563EB]">2 Active Flights</div>
            <div className="text-[11px] text-[#16A34A] mt-0.5 font-medium">Frankfurt hub clear</div>
          </div>
        </div>

        {/* Global Logistics Corridors Table */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between">
            <h2 className="text-base font-bold text-[#111827]">Global Shipping Corridor Telemetry</h2>
            <span className="text-xs text-[#6B7280]">AIS Marine Telemetry Active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-semibold bg-[#FAFAFA]">
                  <th className="py-3 px-4">SHIPPING CORRIDOR</th>
                  <th className="py-3 px-4">CARRIER</th>
                  <th className="py-3 px-4">CORRIDOR STATUS</th>
                  <th className="py-3 px-4 text-right">CONTAINERS</th>
                  <th className="py-3 px-4">DELAY ROOT CAUSE</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {MOCK_LOGISTICS_ROUTES.map((route) => (
                  <tr key={route.corridor} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#111827]">{route.corridor}</td>
                    <td className="py-3 px-4 text-[#4B5563]">{route.carrier}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          route.riskRating === "Critical"
                            ? "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20"
                            : route.riskRating === "Low"
                            ? "bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20"
                            : "bg-[#FFFBEB] text-[#D97706] border border-[#F59E0B]/20"
                        }`}
                      >
                        {route.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#111827]">
                      {route.affectedContainers} TEU
                    </td>
                    <td className="py-3 px-4 text-[#6B7280]">{route.reason}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href="/inventory/reorder"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline"
                      >
                        <span>Split PO</span>
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
