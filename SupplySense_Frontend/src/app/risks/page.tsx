"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Filter,
  PieChart,
  Search,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useRiskAlerts, useRiskSummary, useCriticalRisks } from "@/hooks/useRisks";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import type { RiskAlert } from "@/types/risk";

export default function RiskCommandCenterPage() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  // API Hooks
  const { data: riskAlerts, isLoading, error, refetch } = useRiskAlerts();
  const { data: riskSummary } = useRiskSummary();
  const { data: criticalRisks } = useCriticalRisks();

  // Client-side filtering over server data
  const filteredRisks = (riskAlerts || []).filter((r) => {
    const matchesCat = categoryFilter === "all" || r.alert_type.toLowerCase() === categoryFilter.toLowerCase();
    const matchesLvl = levelFilter === "all" || r.severity.toLowerCase() === levelFilter.toLowerCase();
    return matchesCat && matchesLvl;
  });

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                Risk Command Center
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20 px-2 py-0.5 rounded-full">
                4 MONITORED THREATS
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Multi-dimensional threat tracking across Inventory, Suppliers, Shipments, and Demand volatility.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/purchase-orders"
              className="h-9 px-3.5 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Mitigate Risks</span>
            </Link>
          </div>
        </div>

        {/* Risk Matrix Classification Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl border border-[#DC2626]/30 bg-[#FEF2F2]/30 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#DC2626] font-bold">
              <span>Critical (P0)</span>
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#DC2626]">1 Threat</div>
            <p className="text-[11px] text-[#4B5563]">Immediate stockout threat (MacBook Pro)</p>
          </div>

          <div className="p-4 rounded-2xl border border-[#F59E0B]/30 bg-[#FFFBEB]/30 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#D97706] font-bold">
              <span>High (P1)</span>
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#D97706]">2 Threats</div>
            <p className="text-[11px] text-[#4B5563]">ABC Electronics drift & shipment delay</p>
          </div>

          <div className="p-4 rounded-2xl border border-[#2563EB]/25 bg-[#EFF6FF]/30 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#2563EB] font-bold">
              <span>Medium (P2)</span>
              <PieChart className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#2563EB]">1 Threat</div>
            <p className="text-[11px] text-[#4B5563]">Projected networking demand surge</p>
          </div>

          <div className="p-4 rounded-2xl border border-[#16A34A]/25 bg-[#F0FDF4]/30 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#16A34A] font-bold">
              <span>Low (P3)</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#16A34A]">0 Threats</div>
            <p className="text-[11px] text-[#4B5563]">All baseline thresholds protected</p>
          </div>
        </div>

        {/* Risk Items Ledger */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#6B7280]">Filter Threat Categories:</span>
              {["all", "inventory", "supplier", "shipment", "forecast"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    categoryFilter === cat
                      ? "bg-[#111827] text-white shadow-2xs"
                      : "bg-[#F3F4F6] text-[#4B5563] hover:text-[#111827]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="h-8 px-2.5 text-xs bg-white border border-[#E5E7EB] rounded-lg focus:outline-none text-[#111827]"
              >
                <option value="all">All Severity Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <CardSkeleton count={3} />
            ) : error ? (
              <ErrorState error={error} onRetry={refetch} />
            ) : filteredRisks.length === 0 ? (
              <EmptyState title="No Risk Alerts" description="No active risk alerts found matching your criteria." />
            ) : (
              filteredRisks.map((risk) => (
                <div
                  key={risk.id}
                  className="p-4 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#D1D5DB] transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          risk.severity === "CRITICAL"
                            ? "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20"
                            : risk.severity === "HIGH"
                            ? "bg-[#FFFBEB] text-[#D97706] border border-[#F59E0B]/20"
                            : "bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20"
                        }`}
                      >
                        {risk.severity}
                      </span>
                      <span className="font-bold text-sm text-[#111827]">{risk.alert_type} Disruption Alert</span>
                    </div>
                    <span className="text-xs text-[#6B7280] font-mono">{risk.created_at}</span>
                  </div>

                  <p className="text-xs text-[#374151] leading-relaxed">
                    {risk.message}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs p-3 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB]">
                    <div>
                      <span className="text-[10px] text-[#6B7280] block">Domain Category</span>
                      <strong className="text-[#DC2626] font-semibold">{risk.alert_type}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6B7280] block">Resolution Status</span>
                      <strong className={risk.is_resolved ? "text-[#16A34A] font-semibold" : "text-[#D97706] font-semibold"}>
                        {risk.is_resolved ? "Resolved" : "Action Required"}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#6B7280] pt-1">
                    <span>Alert Identifier: <strong className="text-[#111827]">{risk.id}</strong></span>
                    <Link
                      href="/assistant"
                      className="font-semibold text-[#111827] hover:text-[#2563EB] flex items-center gap-1"
                    >
                      <span>Ask AI Mitigation</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
