"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Zap,
  Activity,
  Boxes,
  Cpu,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

export default function DemandRiskPage() {
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
                Demand Risk & Spike Intelligence
              </h1>
              <p className="text-xs text-[#6B7280]">
                Detect point-of-sale volume anomalies, regional demand surges, and projected safety buffer depletion.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-[#F59E0B]/20 bg-white p-4 shadow-xs">
            <div className="text-xs text-[#D97706] font-bold mb-1 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> EMEA Region Spike
            </div>
            <div className="text-2xl font-bold font-mono text-[#D97706]">+210% Surge</div>
            <div className="text-[11px] text-[#4B5563] mt-0.5">Automotive sensor category anomaly</div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
            <div className="text-xs text-[#6B7280] font-medium mb-1">Safety Buffer Run-Out</div>
            <div className="text-2xl font-bold font-mono text-[#DC2626]">4.5 Days</div>
            <div className="text-[11px] text-[#DC2626] mt-0.5">Without inter-DC rebalancing</div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
            <div className="text-xs text-[#6B7280] font-medium mb-1">Forecast Variance Index</div>
            <div className="text-2xl font-bold font-mono text-[#111827]">± 4.2%</div>
            <div className="text-[11px] text-[#16A34A] mt-0.5 font-medium">98.4% model accuracy baseline</div>
          </div>
        </div>

        {/* Demand Surge Detection Stream */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#111827]">Active Demand Spike Radar</h2>
            <span className="text-xs font-mono text-[#6B7280]">Telemetry Source: SAP POS Stream</span>
          </div>

          <div className="p-4 rounded-xl border border-[#F59E0B]/30 bg-[#FFFBEB]/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#D97706] bg-white px-2 py-0.5 rounded border border-[#F59E0B]/20">
                  SPIKE DETECTED
                </span>
                <span className="font-bold text-sm text-[#111827]">
                  Automotive Sensor SKU-8820 in Surat Central Warehouse
                </span>
              </div>
              <span className="text-xs font-bold text-[#D97706]">Exposure: $195,000</span>
            </div>

            <p className="text-xs text-[#4B5563] leading-relaxed">
              Order velocity jumped from 220 units/day to 680 units/day due to regional manufacturing surge. Standard supplier lead time cannot replenish Surat Central DC before buffer breach.
            </p>

            <div className="pt-2 border-t border-[#F59E0B]/20 flex items-center justify-between">
              <span className="text-xs text-[#D97706] font-semibold flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" /> Recommendation: Expedite 1,200 units via Express Inbound Freight
              </span>
              <Link
                href="/inventory"
                className="h-8 px-3 rounded-lg bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1"
              >
                <span>Inspect Inventory</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
