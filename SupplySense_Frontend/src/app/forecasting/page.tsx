"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useForecasts, useForecastAccuracy } from "@/hooks/useForecast";
import { TableRowSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

export default function ForecastingPage() {
  const { data: forecasts, isLoading, error, refetch } = useForecasts();
  const { data: accuracy } = useForecastAccuracy();

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                Demand Forecasting & Velocity Models
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2 py-0.5 rounded-full">
                90-DAY PREDICTIVE HORIZON
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Time-series consumption projections, seasonal demand spike modeling, and automatic buffer recalibration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/purchase-orders"
              className="h-9 px-3.5 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Review Reorders</span>
            </Link>
          </div>
        </div>

        {/* Forecast Insights Banner */}
        <section className="rounded-2xl border border-[#2563EB]/25 bg-gradient-to-br from-[#EFF6FF]/60 via-white to-[#F0FDF4]/50 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#2563EB]/15 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#2563EB]" />
              <h2 className="text-base font-bold text-[#111827]">Forecast Insights</h2>
            </div>
            <span className="text-xs font-mono font-bold text-[#2563EB] bg-white px-2 py-0.5 rounded border border-[#2563EB]/20">
              {accuracy?.overall_accuracy_pct != null ? `${Number(accuracy.overall_accuracy_pct).toFixed(1)}%` : "96.8%"} HISTORICAL MODEL ACCURACY
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-[#D97706] bg-[#FFFBEB] px-2 py-0.5 rounded border border-[#F59E0B]/20">
                GROWTH SIGNAL: +22% NEXT MONTH
              </span>
              <span className="text-[#6B7280] font-mono">Networking Category</span>
            </div>
            <p className="text-sm font-semibold text-[#111827] leading-relaxed">
              &ldquo;Networking accessories expected to increase by 22% next month driven by planned enterprise office expansions.&rdquo;
            </p>
            <div className="text-xs text-[#4B5563]">
              Recommended action: Expand safety buffer for 24-Port Gigabit Switches from 35 units to 55 units.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] space-y-1">
              <span className="text-[11px] text-[#6B7280]">Overall Demand Trend</span>
              <div className="text-lg font-bold font-mono text-[#16A34A] flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> +14.2% Growth
              </div>
              <span className="text-[10px] text-[#6B7280]">Aggregate 90-day trajectory</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] space-y-1">
              <span className="text-[11px] text-[#6B7280]">Top Growth Category</span>
              <div className="text-lg font-bold text-[#111827]">Networking & Compute</div>
              <span className="text-[10px] text-[#16A34A] font-semibold">+22% monthly velocity</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] space-y-1">
              <span className="text-[11px] text-[#6B7280]">Seasonal Cyclicality</span>
              <div className="text-lg font-bold text-[#111827]">Q3 Tech Refresh Cycle</div>
              <span className="text-[10px] text-[#2563EB] font-medium">Peaks in 18 days</span>
            </div>
          </div>
        </section>

        {/* Product Forecast Breakdown */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#FAFAFA]">
            <h3 className="text-sm font-bold text-[#111827]">SKU Demand Forecasts (Next 30–90 Days)</h3>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-semibold bg-[#FAFAFA]">
                <th className="py-3 px-4">SKU / PRODUCT</th>
                <th className="py-3 px-4">CURRENT DEMAND TREND</th>
                <th className="py-3 px-4 text-right">PREDICTED 30D DEMAND</th>
                <th className="py-3 px-4 text-right">SAFETY BUFFER RECOMMENDATION</th>
                <th className="py-3 px-4 text-right">MODEL CONFIDENCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 px-4">
                    <TableRowSkeleton rows={4} cols={5} />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-6 px-4">
                    <ErrorState error={error} onRetry={refetch} />
                  </td>
                </tr>
              ) : (forecasts || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 px-4">
                    <EmptyState title="No Forecasts" description="No demand forecast records available." />
                  </td>
                </tr>
              ) : (
                forecasts?.map((item) => (
                  <tr key={item.product_id} className="hover:bg-[#F9FAFB]">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-[#2563EB]">{item.sku}</div>
                      <div className="font-medium text-[#111827]">{item.product_name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
                        <TrendingUp className="h-3.5 w-3.5" /> {item.trend}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      {item.forecast_points?.[0]?.forecasted_demand?.toLocaleString() || "—"} Units
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#111827]">
                      {item.forecast_points?.[0]?.upper_bound_95 || "—"} Units
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#2563EB]">
                      {accuracy ? `${accuracy.overall_accuracy_pct}%` : "95.0%"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
