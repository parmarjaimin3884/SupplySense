"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MOCK_SKUS } from "@/data/mock-data";

export default function SKUDetailPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const resolvedParams = use(params);
  const item =
    MOCK_SKUS.find((s) => s.id === resolvedParams.sku || s.sku === resolvedParams.sku) ||
    MOCK_SKUS[0];

  const [poCreated, setPoCreated] = useState(false);

  if (!item) {
    notFound();
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href="/inventory" className="hover:text-[#111827] flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Inventory</span>
          </Link>
          <span>/</span>
          <span className="font-mono text-[#111827] font-semibold">{item.sku}</span>
        </div>

        {/* Product Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">{item.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  item.riskLevel === "Critical"
                    ? "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20"
                    : item.riskLevel === "High"
                    ? "bg-[#FFFBEB] text-[#D97706] border border-[#F59E0B]/20"
                    : "bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20"
                }`}
              >
                {item.riskLevel} Risk
              </span>
            </div>
            <div className="text-xs text-[#6B7280] flex items-center gap-3">
              <span>Category: <strong className="text-[#111827]">{item.category}</strong></span>
              <span>·</span>
              <span>Primary Supplier: <strong className="text-[#111827]">{item.supplier}</strong></span>
              <span>·</span>
              <span>Location: <strong className="text-[#111827]">{item.location}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {item.reorderQuantity > 0 && (
              poCreated ? (
                <span className="h-9 px-3.5 rounded-xl bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="h-4 w-4" /> Purchase Order Created ({item.reorderQuantity} Units)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPoCreated(true);
                    alert(`Purchase Order drafted for ${item.reorderQuantity} units of ${item.name}.`);
                  }}
                  className="h-9 px-3.5 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Create Purchase Order ({item.reorderQuantity} Units)</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INVENTORY INTELLIGENCE SECTION                                            */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-[#2563EB]/25 bg-gradient-to-br from-[#EFF6FF]/60 via-white to-[#F8FAFC] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#2563EB]/15 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#2563EB]" />
              <h2 className="text-base font-bold text-[#111827]">Inventory Intelligence</h2>
            </div>
            <span className="text-xs font-mono font-bold text-[#2563EB] bg-white px-2 py-0.5 rounded border border-[#2563EB]/20">
              {item.confidenceScore}% MODEL CONFIDENCE
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] space-y-1">
              <span className="text-[11px] text-[#6B7280]">Inventory Health</span>
              <div className="text-lg font-bold font-mono text-[#111827]">
                {item.daysRemaining} Days of Supply
              </div>
              <span className={`text-[10px] font-semibold ${item.daysRemaining <= 6 ? "text-[#DC2626]" : "text-[#16A34A]"}`}>
                {item.daysRemaining <= 6 ? "Critical buffer depletion" : "Stable stock buffer"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] space-y-1">
              <span className="text-[11px] text-[#6B7280]">Reorder Recommendation</span>
              <div className="text-lg font-bold font-mono text-[#2563EB]">
                {item.reorderQuantity > 0 ? `${item.reorderQuantity} Units` : "No Action"}
              </div>
              <span className="text-[10px] text-[#4B5563]">
                {item.reorderQuantity > 0 ? "Immediate PO release" : "Buffer optimal"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] space-y-1">
              <span className="text-[11px] text-[#6B7280]">Demand Trend</span>
              <div className="text-lg font-bold font-mono text-[#111827] flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-[#16A34A]" /> {item.demandTrend}
              </div>
              <span className="text-[10px] text-[#16A34A] font-semibold">+18% vs past 90 days</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] space-y-1">
              <span className="text-[11px] text-[#6B7280]">Forecast Next 30 Days</span>
              <div className="text-lg font-bold font-mono text-[#111827]">
                {item.forecastDemand30d} Units
              </div>
              <span className="text-[10px] text-[#6B7280]">Daily burn: ~{item.burnRatePerDay} ea/day</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-2">
            <div className="text-xs font-bold text-[#111827]">Supplier & Dual-Sourcing Recommendation</div>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              Primary supplier <strong className="text-[#111827]">{item.supplier}</strong> lead time is <strong className="text-[#111827]">{item.leadTimeDays} days</strong>. In case of logistics disruption or capacity caps, recommended alternate supplier is <strong className="text-[#2563EB]">{item.alternateSupplier || "Kyoto Micro Tech"}</strong>.
            </p>
          </div>
        </section>

        {/* Current Stock vs Safety Thresholds */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white space-y-2 shadow-xs">
            <span className="text-xs text-[#6B7280]">Current Stock On Hand</span>
            <div className="text-3xl font-bold font-mono text-[#111827]">{item.currentStock} ea</div>
            <p className="text-xs text-[#4B5563]">Physical count in {item.location}.</p>
          </div>

          <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white space-y-2 shadow-xs">
            <span className="text-xs text-[#6B7280]">Safety Stock Threshold</span>
            <div className="text-3xl font-bold font-mono text-[#111827]">{item.safetyStock} ea</div>
            <p className="text-xs text-[#4B5563]">Minimum required buffer to avoid line stoppages.</p>
          </div>

          <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white space-y-2 shadow-xs">
            <span className="text-xs text-[#6B7280]">Unit Acquisition Cost</span>
            <div className="text-3xl font-bold font-mono text-[#111827]">${item.unitCost.toFixed(2)}</div>
            <p className="text-xs text-[#4B5563]">Current contracted unit purchase price.</p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
