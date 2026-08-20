"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Layers,
  RefreshCw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";
import { MOCK_SKUS, MOCK_RISKS } from "@/data/mock-data";

export function HeroDashboard() {
  const [activeTab, setActiveTab] = useState<"all" | "critical" | "reorder">("critical");
  const [actionExecuted, setActionExecuted] = useState(false);

  const displayedSKUs =
    activeTab === "critical"
      ? MOCK_SKUS.filter((s) => s.riskStatus === "Critical" || s.riskStatus === "Low Buffer")
      : activeTab === "reorder"
      ? MOCK_SKUS.filter((s) => s.reorderQuantity > 0)
      : MOCK_SKUS;

  return (
    <div className="relative mx-auto w-full max-w-6xl rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-sm overflow-hidden">
      {/* Top Window Bar (Cal.com / Linear minimal window aesthetic) */}
      <div className="flex h-11 items-center justify-between border-b border-[#E5E7EB] bg-[#FAFAFA] px-4">
        {/* Left window control mock dots + breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E5E7EB]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#E5E7EB]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#E5E7EB]" />
          </div>
          <div className="h-3.5 w-px bg-[#E5E7EB]" />
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <span className="font-medium text-[#111827]">app.supplysense.io</span>
            <span>/</span>
            <span>inventory-intelligence</span>
            <span>/</span>
            <span className="text-[#2563EB] font-medium">live-risk-matrix</span>
          </div>
        </div>

        {/* Right status indicators */}
        <div className="flex items-center gap-3 text-xs text-[#6B7280]">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span className="font-mono text-[11px]">SAP S/4HANA Sync: 2m ago</span>
          </div>
          <div className="rounded bg-[#FFFFFF] border border-[#E5E7EB] px-2 py-0.5 font-mono text-[11px] text-[#111827]">
            ⌘K Command
          </div>
        </div>
      </div>

      {/* Main Inner Canvas */}
      <div className="p-4 sm:p-6 bg-[#FFFFFF]">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* Card 1 */}
          <div className="rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] p-3.5">
            <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
              <span className="font-medium">At-Risk Capital</span>
              <span className="flex items-center text-[11px] font-medium text-[#DC2626]">
                <TrendingUp className="h-3 w-3 mr-0.5" /> +4.2%
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#111827] tracking-tight">
              $1,420,850
            </div>
            <div className="text-[11px] text-[#9CA3AF] mt-1">4 High-velocity components</div>
          </div>

          {/* Card 2 */}
          <div className="rounded-lg border border-[#DC2626]/20 bg-[#FEF2F2]/40 p-3.5">
            <div className="flex items-center justify-between text-xs text-[#DC2626] mb-1">
              <span className="font-medium flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Stockout &lt; 7 Days
              </span>
              <span className="rounded bg-[#DC2626] text-white text-[10px] font-mono font-medium px-1.5 py-0.2">
                P0 ALERT
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#DC2626] tracking-tight">
              2 Critical SKUs
            </div>
            <div className="text-[11px] text-[#DC2626]/80 mt-1">Surat Hub buffer breach in 48h</div>
          </div>

          {/* Card 3 */}
          <div className="rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] p-3.5">
            <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
              <span className="font-medium">Supplier Lead-Time Drift</span>
              <span className="flex items-center text-[11px] font-medium text-[#F59E0B]">
                <Clock className="h-3 w-3 mr-0.5" /> +5.8d avg
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#111827] tracking-tight">
              89.4% OTIF
            </div>
            <div className="text-[11px] text-[#9CA3AF] mt-1">Shenzen Precision at risk</div>
          </div>

          {/* Card 4 */}
          <div className="rounded-lg border border-[#2563EB]/20 bg-[#EFF6FF]/40 p-3.5">
            <div className="flex items-center justify-between text-xs text-[#2563EB] mb-1">
              <span className="font-medium flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-[#2563EB]" /> AI Mitigation Queue
              </span>
              <span className="text-[11px] font-mono text-[#2563EB]">Active</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#2563EB] tracking-tight">
              3 Actions Ready
            </div>
            <div className="text-[11px] text-[#2563EB]/80 mt-1">Estimated save: $84,200</div>
          </div>
        </div>

        {/* AI Actionable Alert Banner (Linear style clean inline alert) */}
        <div className="mb-6 rounded-lg border border-[#2563EB]/30 bg-[#F8FAFC] p-3.5 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#2563EB] text-white">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#111827]">
                  Inventory Agent Recommendation
                </span>
                <span className="rounded bg-[#EFF6FF] px-1.5 py-0.5 text-[10px] font-mono text-[#2563EB] border border-[#2563EB]/20">
                  Confidence 98.4%
                </span>
              </div>
              <p className="text-xs text-[#4B5563] mt-0.5">
                Expedited PO batch of 1,400 units staged for{" "}
                <span className="font-mono font-medium text-[#111827]">TX-8820-A</span>. Surat Central
                buffer depletes in 2.1 days.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            {actionExecuted ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-[#16A34A] bg-[#F0FDF4] border border-[#16A34A]/30 px-3 py-1.5 rounded-md">
                <CheckCircle2 className="h-3.5 w-3.5" /> Transfer TO-4091 Created
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setActionExecuted(true)}
                className="flex items-center gap-1.5 rounded-md bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white shadow-xs transition-transform duration-100 hover:bg-[#1D4ED8] active:scale-[0.98]"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Approve Inter-DC Transfer</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Table Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-md text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("critical")}
              className={`rounded px-2.5 py-1 transition-colors ${
                activeTab === "critical"
                  ? "bg-white text-[#111827] shadow-xs font-semibold"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              Critical Stockout Watch ({MOCK_SKUS.filter((s) => s.riskStatus === "Critical").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reorder")}
              className={`rounded px-2.5 py-1 transition-colors ${
                activeTab === "reorder"
                  ? "bg-white text-[#111827] shadow-xs font-semibold"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              Reorder Queue
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded px-2.5 py-1 transition-colors ${
                activeTab === "all"
                  ? "bg-white text-[#111827] shadow-xs font-semibold"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              All Items ({MOCK_SKUS.length})
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <div className="flex items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-[#FFFFFF] px-2.5 py-1">
              <Search className="h-3.5 w-3.5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Filter SKU or Part #..."
                className="w-36 bg-transparent text-xs text-[#111827] focus:outline-none placeholder:text-[#9CA3AF]"
                readOnly
              />
            </div>
            <div className="rounded-md border border-[#E5E7EB] bg-[#FFFFFF] px-2.5 py-1 text-xs font-medium text-[#111827] flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3 text-[#6B7280]" /> Filter
            </div>
          </div>
        </div>

        {/* Enterprise TanStack-style Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-medium bg-[#FAFAFA]">
                <th className="py-2.5 px-3">SKU CODE</th>
                <th className="py-2.5 px-3">ITEM DESCRIPTION</th>
                <th className="py-2.5 px-3">WAREHOUSE</th>
                <th className="py-2.5 px-3 text-right">ON HAND</th>
                <th className="py-2.5 px-3 text-right">DAYS OF SUPPLY</th>
                <th className="py-2.5 px-3">HEALTH STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] text-[#111827]">
              {displayedSKUs.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#F9FAFB] transition-colors group cursor-pointer"
                >
                  <td className="py-2.5 px-3 font-mono font-medium text-[#2563EB] flex items-center gap-1.5">
                    <span>{item.sku}</span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[#111827]">
                    {item.name}
                    <span className="block text-[11px] text-[#6B7280] font-normal font-sans">
                      {item.category} • {item.supplier}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#4B5563]">{item.location}</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {item.onHand.toLocaleString()} ea
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium">
                    <span
                      className={
                        item.daysOfSupply <= 3
                          ? "text-[#DC2626]"
                          : item.daysOfSupply <= 7
                          ? "text-[#F59E0B]"
                          : "text-[#16A34A]"
                      }
                    >
                      {item.daysOfSupply.toFixed(1)} d
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        item.riskStatus === "Critical"
                          ? "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20"
                          : item.riskStatus === "Low Buffer"
                          ? "bg-[#FFFBEB] text-[#D97706] border border-[#F59E0B]/20"
                          : item.riskStatus === "Optimal"
                          ? "bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20"
                          : "bg-[#F3F4F6] text-[#4B5563]"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.riskStatus === "Critical"
                            ? "bg-[#DC2626]"
                            : item.riskStatus === "Low Buffer"
                            ? "bg-[#D97706]"
                            : item.riskStatus === "Optimal"
                            ? "bg-[#16A34A]"
                            : "bg-[#4B5563]"
                        }`}
                      />
                      {item.riskStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {item.reorderQuantity > 0 ? (
                      <button
                        type="button"
                        className="rounded border border-[#E5E7EB] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-medium text-[#111827] shadow-2xs hover:bg-[#F3F4F6] hover:border-[#D1D5DB]"
                      >
                        Reorder {item.reorderQuantity.toLocaleString()}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="rounded px-2.5 py-1 text-[11px] font-medium text-[#6B7280] hover:text-[#111827]"
                      >
                        View Audit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
          <div>
            Showing <span className="font-medium text-[#111827]">{displayedSKUs.length}</span> of{" "}
            <span className="font-medium text-[#111827]">{MOCK_SKUS.length}</span> active SKUs
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#DC2626]" /> 2 Stockouts Imminent
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#16A34A]" /> 86.4% Health Index
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
