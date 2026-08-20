"use client";

import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Clock,
  Cpu,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";

interface AuthDashboardPreviewProps {
  mode?: "login" | "signup";
}

export function AuthDashboardPreview({ mode = "signup" }: AuthDashboardPreviewProps) {
  return (
    <div className="w-full rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
      {/* Window Bar Header */}
      <div className="flex h-9 items-center justify-between border-b border-[#E5E7EB] bg-[#FAFAFA] px-3.5">
        {/* Left window control mock dots + breadcrumb */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#E5E7EB]" />
            <span className="h-2 w-2 rounded-full bg-[#E5E7EB]" />
            <span className="h-2 w-2 rounded-full bg-[#E5E7EB]" />
          </div>
          <div className="h-2.5 w-px bg-[#E5E7EB] mx-0.5" />
          <div className="flex items-center gap-1 text-[10px] text-[#6B7280] font-mono">
            <span className="text-[#111827] font-semibold">app.supplysense.io</span>
            <span>/</span>
            <span className="text-[#2563EB] font-medium">live-grid</span>
          </div>
        </div>

        {/* Right Status Indicator */}
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#16A34A] bg-[#F0FDF4] border border-[#16A34A]/20 px-1.5 py-0.5 rounded">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            SAP Sync: Active
          </span>
        </div>
      </div>

      {/* Main Inner Canvas */}
      <div className="p-3.5 space-y-2.5 bg-white">
        {/* Top KPI Grid — 2 Prominent, Balanced Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Inventory Health */}
          <div className="rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-[#6B7280] mb-1">
              <span className="font-medium">Inventory Valuation</span>
              <span className="text-[#16A34A] font-semibold text-[10px] flex items-center">
                <TrendingUp className="h-3 w-3 mr-0.5" /> 98.4%
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-[#111827] tracking-tight">
              $1,420,850
            </div>
            <div className="text-[10px] text-[#9CA3AF] mt-0.5">Surat Central Hub · 500 SKUs</div>
          </div>

          {/* Card 2: Stockout Risks */}
          <div className="rounded-xl border border-[#DC2626]/20 bg-[#FEF2F2]/40 p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-[#DC2626] mb-1">
              <span className="font-medium flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Stockout Risks
              </span>
              <span className="text-[9px] font-mono font-bold bg-[#DC2626] text-white px-1.5 py-0.2 rounded">
                P0 ALERT
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-[#DC2626] tracking-tight">
              2 SKUs &lt; 48h
            </div>
            <div className="text-[10px] text-[#DC2626]/80 mt-0.5">Surat Central buffer alert</div>
          </div>
        </div>

        {/* AI Actionable Recommendation Card */}
        <div className="rounded-lg border border-[#2563EB]/25 bg-[#EFF6FF]/40 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-[#2563EB] text-white shadow-2xs">
                <Cpu className="h-3 w-3" />
              </div>
              <span className="text-[11px] font-bold text-[#111827]">
                Autonomous AI Recommendation
              </span>
            </div>
            <span className="text-[9px] font-mono font-semibold text-[#2563EB] bg-white border border-[#2563EB]/20 px-1.5 py-0.2 rounded-full">
              98.4% Confidence
            </span>
          </div>

          <p className="text-[11px] text-[#374151] leading-relaxed">
            Expedited batch staged for <strong className="font-mono text-[#111827]">TX-8820-A</strong>. Surat Central buffer depletes in 2.1 days.
          </p>

          <div className="flex items-center justify-between pt-1.5 border-t border-[#2563EB]/15 text-[10px]">
            <span className="text-[#2563EB] font-semibold flex items-center gap-1">
              <Zap className="h-3 w-3" /> Action: PO-4091 Auto-Drafted ($48k saved)
            </span>
            <span className="text-[9px] font-bold text-[#16A34A] bg-[#F0FDF4] border border-[#16A34A]/25 px-1.5 py-0.2 rounded">
              Approved
            </span>
          </div>
        </div>

        {/* SKU Watchlist Table Preview */}
        <div className="rounded-lg border border-[#E5E7EB] overflow-hidden shadow-2xs">
          <div className="bg-[#FAFAFA] px-3 py-1.5 border-b border-[#E5E7EB] flex items-center justify-between text-[10px] font-semibold text-[#6B7280]">
            <span>CRITICAL SKU TELEMETRY</span>
            <span>DAYS OF SUPPLY</span>
          </div>
          <div className="divide-y divide-[#F3F4F6] text-[11px]">
            <div className="px-3 py-1.5 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors">
              <div>
                <div className="font-mono font-bold text-[#111827]">TX-8820-A · Microcontroller M4</div>
                <div className="text-[9px] text-[#6B7280]">Surat Central · 180 units available</div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20">
                  <span className="h-1 w-1 rounded-full bg-[#DC2626]" />
                  2.1d (Critical)
                </span>
              </div>
            </div>

            <div className="px-3 py-1.5 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors">
              <div>
                <div className="font-mono font-bold text-[#111827]">PW-9011-C · Stepdown Regulator</div>
                <div className="text-[9px] text-[#6B7280]">Surat Central · 1,950 units available</div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#F59E0B]/20">
                  <span className="h-1 w-1 rounded-full bg-[#D97706]" />
                  4.6d (Low Buffer)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Integration Footer */}
        <div className="flex items-center justify-between pt-0.5 text-[10px] text-[#6B7280]">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-[#16A34A]" />
            <span>Zero-Trust Enterprise Network</span>
          </div>
          <span className="font-mono text-[9px] text-[#9CA3AF]">
            SAP & NetSuite Linked
          </span>
        </div>
      </div>
    </div>
  );
}
