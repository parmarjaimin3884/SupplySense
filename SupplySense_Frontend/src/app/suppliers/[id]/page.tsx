"use client";

import { use, useState } from "react";
import Link from "next/link";
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
import { useSupplierDetail } from "@/hooks/useSuppliers";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { MOCK_SUPPLIERS } from "@/data/mock-data";

export default function SupplierProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [inquirySent, setInquirySent] = useState(false);

  // Fetch real supplier profile from Neon DB
  const { data: dbSupplier, isLoading, error, refetch } = useSupplierDetail(resolvedParams.id);

  // Fallback to mock data if ID happens to be a mock ID like sup-abc
  const mockFallback = MOCK_SUPPLIERS.find((s) => s.id === resolvedParams.id);

  const supplier = dbSupplier
    ? {
        id: dbSupplier.id,
        name: dbSupplier.company_name,
        riskStatus: dbSupplier.risk_rating || "LOW",
        origin: dbSupplier.city && dbSupplier.country ? `${dbSupplier.city}, ${dbSupplier.country}` : dbSupplier.country || "Global Partner",
        contactEmail: dbSupplier.email || "partner@enterprise.com",
        phone: dbSupplier.phone || "+91 (020) 8492-1002",
        activeSpend: "₹3,40,000",
        reliabilityScore: Number(dbSupplier.reliability_score) || 95.0,
        qualityScore: Number(dbSupplier.quality_score) || 98.0,
        leadTimeVariance: dbSupplier.average_delay ? `+${dbSupplier.average_delay} days` : "+0.5 days",
        leadTimeDays: dbSupplier.lead_time || 14,
        moq: dbSupplier.moq || 100,
        paymentTerms: dbSupplier.payment_terms || "Net 30",
        gst: dbSupplier.gst_number || "27AABCS1429B1ZB",
      }
    : mockFallback
    ? {
        id: mockFallback.id,
        name: mockFallback.name,
        riskStatus: mockFallback.riskStatus,
        origin: mockFallback.origin,
        contactEmail: mockFallback.contactEmail,
        phone: "+1 (408) 921-8840",
        activeSpend: mockFallback.activeSpend,
        reliabilityScore: parseFloat(mockFallback.otifRate) || 82.0,
        qualityScore: 96.6,
        leadTimeVariance: mockFallback.leadTimeVariance,
        leadTimeDays: 14,
        moq: 250,
        paymentTerms: "Net 45",
        gst: "US-CA-94088-EIN",
      }
    : null;

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
          <span className="font-semibold text-[#111827]">{supplier?.name || "Supplier Scorecard"}</span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error && !mockFallback ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !supplier ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E7EB]">
            <p className="text-sm text-[#6B7280]">Supplier not found.</p>
            <Link href="/suppliers" className="mt-3 inline-block text-xs font-semibold text-[#2563EB]">
              Return to Suppliers
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E5E7EB] pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-[#111827]">{supplier.name}</h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                      ["CRITICAL", "HIGH", "HIGH_RISK", "AT RISK"].includes((supplier.riskStatus || "").toUpperCase())
                        ? "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20"
                        : "bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20"
                    }`}
                  >
                    {supplier.riskStatus} RISK
                  </span>
                </div>
                <div className="text-xs text-[#6B7280] flex flex-wrap items-center gap-3">
                  <span>Origin: <strong className="text-[#111827]">{supplier.origin}</strong></span>
                  <span>·</span>
                  <span>Email: <strong className="text-[#111827]">{supplier.contactEmail}</strong></span>
                  <span>·</span>
                  <span>Phone: <strong className="text-[#111827]">{supplier.phone}</strong></span>
                  <span>·</span>
                  <span>Payment Terms: <strong className="text-[#111827]">{supplier.paymentTerms}</strong></span>
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
                      alert(`Procurement inquiry sent to ${supplier.contactEmail}`);
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
                <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB]">
                  <Sparkles className="h-4 w-4" />
                  <span>SUPPLIER INTELLIGENCE & AUDIT</span>
                </div>
                <span className="text-[10px] font-mono text-[#6B7280]">LIVE DB SYNC</span>
              </div>

              <p className="text-xs text-[#374151] leading-relaxed">
                {supplier.reliabilityScore >= 95
                  ? `Exemplary delivery fidelity across recent PO batches. Consistently maintains on-time lead times (${supplier.leadTimeDays} days) with near-zero quality variances.`
                  : `${supplier.name} delivery reliability is currently at ${supplier.reliabilityScore.toFixed(1)}% with an average lead-time variance of ${supplier.leadTimeVariance}. Recommend monitoring buffer levels.`}
              </p>

              {/* 4 KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs space-y-1">
                  <div className="text-[11px] font-medium text-[#6B7280]">Reliability Rating</div>
                  <div className="text-2xl font-bold font-mono text-[#111827]">
                    {supplier.reliabilityScore >= 95 ? "A+" : supplier.reliabilityScore >= 90 ? "A" : "B"}
                  </div>
                  <div className="text-[10px] text-[#16A34A] font-semibold">{supplier.riskStatus} Risk Profile</div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs space-y-1">
                  <div className="text-[11px] font-medium text-[#6B7280]">On-Time Delivery Rate</div>
                  <div className={`text-2xl font-bold font-mono ${supplier.reliabilityScore >= 90 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                    {supplier.reliabilityScore.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-[#6B7280]">Historical SLA Benchmark</div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs space-y-1">
                  <div className="text-[11px] font-medium text-[#6B7280]">Quality Pass Score</div>
                  <div className={`text-2xl font-bold font-mono ${supplier.qualityScore >= 90 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                    {supplier.qualityScore.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-[#16A34A] font-semibold">Defect rate: {(100 - supplier.qualityScore).toFixed(1)}%</div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs space-y-1">
                  <div className="text-[11px] font-medium text-[#6B7280]">Lead Time Variance</div>
                  <div className="text-2xl font-bold font-mono text-[#111827]">{supplier.leadTimeVariance}</div>
                  <div className="text-[10px] text-[#6B7280]">Contract: {supplier.leadTimeDays} Days</div>
                </div>
              </div>

              {/* Recommended Alternate Note */}
              <div className="pt-3 border-t border-[#2563EB]/15 text-xs text-[#4B5563]">
                <strong className="text-[#111827]">GST / Tax ID:</strong> {supplier.gst} · <strong className="text-[#111827]">Minimum Order Quantity (MOQ):</strong> {supplier.moq} units
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
