"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MOCK_SUPPLIERS } from "@/data/mock-data";

export default function SupplierProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const supplier =
    MOCK_SUPPLIERS.find((s) => s.id === resolvedParams.id) || MOCK_SUPPLIERS[0];

  const [inquirySent, setInquirySent] = useState(false);

  if (!supplier) {
    notFound();
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href="/suppliers" className="hover:text-[#111827] flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Suppliers</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#111827]">{supplier.name}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">{supplier.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  supplier.riskStatus === "At Risk"
                    ? "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20"
                    : "bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20"
                }`}
              >
                {supplier.riskStatus}
              </span>
            </div>
            <div className="text-xs text-[#6B7280] flex items-center gap-3">
              <span>Origin: <strong className="text-[#111827]">{supplier.origin}</strong></span>
              <span>·</span>
              <span>Email: <strong className="text-[#111827]">{supplier.contactEmail}</strong></span>
              <span>·</span>
              <span>Active Spend: <strong className="text-[#111827]">{supplier.activeSpend}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {inquirySent ? (
              <span className="h-9 px-3.5 rounded-xl bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="h-4 w-4" /> Inquiry Dispatched
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setInquirySent(true);
                  alert(`Procurement audit dispatch sent to ${supplier.contactEmail}`);
                }}
                className="h-9 px-3.5 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Contact Supplier</span>
              </button>
            )}
          </div>
        </div>

        {/* AI Supplier Intelligence Panel */}
        <section className="rounded-2xl border border-[#2563EB]/25 bg-gradient-to-br from-[#EFF6FF]/60 via-white to-[#F8FAFC] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#2563EB]/15 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#2563EB]" />
              <h2 className="text-base font-bold text-[#111827]">Supplier Intelligence & Audit</h2>
            </div>
            <span className="text-xs font-mono font-bold text-[#2563EB] bg-white px-2 py-0.5 rounded border border-[#2563EB]/20">
              AUDITED 24H AGO
            </span>
          </div>

          <p className="text-sm font-medium text-[#1F2937] leading-relaxed">
            {supplier.aiInsight}
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] space-y-1">
              <span className="text-[11px] text-[#6B7280]">Risk Score</span>
              <div className="text-xl font-bold font-mono text-[#111827]">{supplier.riskScore}/100</div>
              <span className={`text-[10px] font-semibold ${supplier.riskScore > 50 ? "text-[#DC2626]" : "text-[#16A34A]"}`}>
                {supplier.riskScore > 50 ? "Elevated delivery risk" : "Reliable performance"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] space-y-1">
              <span className="text-[11px] text-[#6B7280]">On-Time Delivery</span>
              <div className="text-xl font-bold font-mono text-[#111827]">{supplier.onTimeDeliveryPct}%</div>
              <span className="text-[10px] text-[#4B5563]">Historical 12-mo average</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] space-y-1">
              <span className="text-[11px] text-[#6B7280]">Defect Rate</span>
              <div className="text-xl font-bold font-mono text-[#111827]">{supplier.defectRatePpm} PPM</div>
              <span className="text-[10px] text-[#16A34A] font-semibold">Standard tolerance: &lt; 500 PPM</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] space-y-1">
              <span className="text-[11px] text-[#6B7280]">Lead Time Variance</span>
              <div className="text-xl font-bold font-mono text-[#111827]">{supplier.leadTimeVariance}</div>
              <span className="text-[10px] text-[#6B7280]">Recent POs tracked</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-1 text-xs">
            <span className="font-bold text-[#111827]">Recommended Alternate Sourcing Route:</span>
            <p className="text-[#4B5563]">
              {supplier.recommendedAlternate} is pre-qualified for fast volume re-allocation without contractual penalties.
            </p>
          </div>
        </section>

        {/* Recent Purchase Orders with Supplier */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#FAFAFA]">
            <h3 className="text-sm font-bold text-[#111827]">Recent Purchase Orders with {supplier.name}</h3>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-semibold bg-[#FAFAFA]">
                <th className="py-3 px-4">PO NUMBER</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-right">QUANTITY</th>
                <th className="py-3 px-4">ESTIMATED ARRIVAL</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {supplier.recentPOs.map((po) => (
                <tr key={po.poNumber} className="hover:bg-[#F9FAFB]">
                  <td className="py-3 px-4 font-mono font-bold text-[#2563EB]">{po.poNumber}</td>
                  <td className="py-3 px-4 font-mono">{po.sku}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold">{po.qty.toLocaleString()} ea</td>
                  <td className="py-3 px-4 font-mono">{po.eta}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB]">
                      {po.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
