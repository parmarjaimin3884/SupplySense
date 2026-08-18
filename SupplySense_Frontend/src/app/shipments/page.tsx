"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  Package,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Truck,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useShipmentList, useCarrierPerformance } from "@/hooks/useShipments";
import { Pagination } from "@/components/ui/pagination";
import { TableRowSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import type { Shipment } from "@/types/shipment";

export default function ShipmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // API Hook — server-side filtering
  const { data: shipmentData, isLoading, error, refetch } = useShipmentList({
    page,
    limit,
    status: statusFilter !== "all" ? statusFilter.toUpperCase() : undefined,
  });
  const { data: carrierPerf } = useCarrierPerformance();

  const allShipments: Shipment[] = shipmentData?.data || [];
  const meta = shipmentData?.meta;

  // Client-side search over server-fetched data
  const filteredShipments = allShipments.filter((sh) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (sh.carrier?.toLowerCase().includes(q)) ||
      sh.id.toLowerCase().includes(q) ||
      (sh.current_location?.toLowerCase().includes(q))
    );
  });

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                Shipment Intelligence
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2 py-0.5 rounded-full">
                LIVE LOGISTICS RADAR
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Real-time transit tracking, delay risk classification, disruption probability, and carrier performance telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/purchase-orders"
              className="h-9 px-3.5 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#111827] hover:bg-[#F9FAFB] shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <Package className="h-3.5 w-3.5 text-[#6B7280]" />
              <span>Purchase Orders</span>
            </Link>
          </div>
        </div>

        {/* Intelligence Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-[#DC2626]/20 bg-[#FEF2F2]/20 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#DC2626]">
              <span className="font-bold">Active Delay Warnings</span>
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#DC2626]">1 Shipment</div>
            <p className="text-xs text-[#4B5563]">
              SH-882-US affected by supplier QA bottlenecks (+5 days variance).
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-[#16A34A]/20 bg-white space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#16A34A]">
              <span className="font-bold">Average Carrier Fidelity</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#111827]">93.3%</div>
            <p className="text-xs text-[#4B5563]">
              Nippon Express Air & FedEx Priority leading on-time fulfillment.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-[#2563EB]/20 bg-white space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#2563EB]">
              <span className="font-bold">Active Inbound Volume</span>
              <Truck className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#111827]">155 Units</div>
            <p className="text-xs text-[#4B5563]">
              3 shipments scheduled to deliver before month-end.
            </p>
          </div>
        </div>

        {/* Shipments Ledger */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search tracking, carrier, or route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#111827]"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {["all", "in transit", "delayed"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    statusFilter === st ? "bg-[#111827] text-white shadow-2xs" : "bg-[#F3F4F6] text-[#4B5563] hover:text-[#111827]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <TableRowSkeleton rows={4} cols={4} />
            ) : error ? (
              <ErrorState error={error} onRetry={refetch} />
            ) : filteredShipments.length === 0 ? (
              <EmptyState title="No Shipments Found" description="No active shipments match your filter criteria." />
            ) : (
              filteredShipments.map((sh) => (
                <div
                  key={sh.id}
                  className="p-4 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#D1D5DB] transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#111827]">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#111827]">{sh.purchase_order_id || sh.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              sh.current_status === "DELAYED"
                                ? "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20"
                                : sh.current_status === "CUSTOMS_HOLD"
                                ? "bg-[#FFFBEB] text-[#D97706] border border-[#F59E0B]/20"
                                : "bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20"
                            }`}
                          >
                            {sh.current_status}
                          </span>
                        </div>
                        <div className="text-xs text-[#6B7280] flex items-center gap-2 mt-0.5">
                          <span>Carrier: <strong>{sh.carrier || "Global Logistics"}</strong></span>
                          <span>·</span>
                          <span>Location: <strong>{sh.current_location || "In Transit"}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="text-right">
                        <span className="text-[10px] text-[#6B7280] block font-sans">Delay Duration</span>
                        <span
                          className={`font-bold ${
                            (sh.delay_days || 0) > 0 ? "text-[#DC2626]" : "text-[#16A34A]"
                          }`}
                        >
                          {(sh.delay_days || 0) > 0 ? `+${sh.delay_days} days` : "On schedule"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#6B7280] block font-sans">Estimated Arrival</span>
                        <span className="font-bold text-[#111827]">{sh.expected_arrival ? String(sh.expected_arrival) : "2026-08-25"}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Logistics Insight */}
                  <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] flex items-start gap-2 text-xs">
                    <Sparkles className="h-3.5 w-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                    <p className="text-[#374151] leading-relaxed">
                      <strong>Shipment Intelligence:</strong> {sh.delay_reason || `Shipment ${sh.id} dispatched via ${sh.carrier || "carrier"} with ETA ${sh.expected_arrival ? String(sh.expected_arrival) : "2026-08-25"}.`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#6B7280] pt-1">
                    <span>Vehicle / Container: <strong className="text-[#111827]">{sh.vehicle_number || "Vessel TEU-882"}</strong></span>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/purchase-orders"
                        className="font-semibold text-[#2563EB] hover:underline"
                      >
                        Inspect Purchase Order →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {meta && (
            <div className="p-4 border-t border-[#E5E7EB]">
              <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
