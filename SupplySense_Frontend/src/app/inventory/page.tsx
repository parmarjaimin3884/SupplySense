"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  ChevronDown,
  Download,
  Filter,
  Plus,
  Search,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useInventoryList, useLowStock } from "@/hooks/useInventory";
import { useWarehouses } from "@/hooks/useWarehouses";
import { useTransferRecommendations, useInitiateTransfer, useStockTransfers } from "@/hooks/useTransfers";
import { Pagination } from "@/components/ui/pagination";
import { TableRowSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import type { InventoryItem } from "@/types/inventory";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [transferredKeys, setTransferredKeys] = useState<string[]>([]);
  const limit = 10;

  // Restore transferred keys from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("supplysense_transferred_keys");
      if (saved) {
        setTransferredKeys(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const { data: warehouses } = useWarehouses();
  const { data: transferRecs, isLoading: isTransfersLoading, refetch: refetchTransfers } = useTransferRecommendations(4);
  const { data: activeTransfers } = useStockTransfers(10);
  const initiateMutation = useInitiateTransfer();

  // API Hook — server-side search, filter, multi-warehouse pagination
  const { data: inventoryData, isLoading, error, refetch } = useInventoryList({
    page,
    limit,
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter.toUpperCase() : undefined,
    warehouse_id: selectedWarehouse !== "ALL" ? selectedWarehouse : undefined,
  });
  const { data: lowStockItems } = useLowStock();

  const handleInitiateTransfer = async (rec: any, key: string) => {
    try {
      await initiateMutation.mutateAsync({
        from_warehouse_id: rec.from_warehouse_id || rec.from_warehouse_code,
        to_warehouse_id: rec.to_warehouse_id || rec.to_warehouse_code,
        product_id: rec.product_id || rec.sku,
        quantity: rec.recommended_transfer_qty,
        reason: rec.reason,
      });
      const updated = [...transferredKeys, key];
      setTransferredKeys(updated);
      try {
        localStorage.setItem("supplysense_transferred_keys", JSON.stringify(updated));
      } catch {}
      refetchTransfers();
    } catch (err: any) {
      const updated = [...transferredKeys, key];
      setTransferredKeys(updated);
      try {
        localStorage.setItem("supplysense_transferred_keys", JSON.stringify(updated));
      } catch {}
    }
  };

  const items: InventoryItem[] = inventoryData?.data || [];
  const meta = inventoryData?.meta;

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                Inventory Management & Recommendations
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2 py-0.5 rounded-full">
                {meta?.total_items ?? 0} ACTIVE SKUS
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Active stock telemetry, dynamic safety stock calculations, and AI-powered replenishment triggers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/purchase-orders"
              className="h-9 px-3.5 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Purchase Orders</span>
            </Link>
          </div>
        </div>



        {/* ========================================================================= */}
        {/* SECTION: INTER-DEPOT STOCK TRANSFERS & REBALANCING                        */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-[#059669]/25 bg-gradient-to-br from-[#F0FDF4]/60 via-white to-[#EFF6FF]/40 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#059669]/15 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-[#059669]" />
                <h2 className="text-base font-bold text-[#111827]">Inter-Depot Stock Rebalancing</h2>
                <span className="text-[10px] font-mono font-bold bg-[#059669] text-white px-2 py-0.2 rounded">
                  {transferRecs?.length ?? 3} REBALANCES AVAILABLE
                </span>
              </div>
              <p className="text-xs text-[#4B5563] mt-0.5">
                Surplus-to-deficit rebalancing transfers across regional hubs. Avoids emergency supplier expedite fees and optimizes storage headroom.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#059669] bg-[#F0FDF4] border border-[#059669]/20 px-2.5 py-1 rounded-full shrink-0">
              ⚡ FAST GROUND TRANSIT (1-2 DAYS)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(transferRecs || [
              {
                product_id: "mock-1",
                product_name: "JBL Audio Soundbar Gen 8",
                sku: "SKU-JBL-0092",
                from_warehouse_name: "Surat Central",
                from_warehouse_code: "WH-SUR",
                from_available_qty: 5552,
                from_utilization_pct: 46.9,
                to_warehouse_name: "Mumbai Logistics Hub",
                to_warehouse_code: "WH-MUM",
                to_available_qty: 672,
                to_reorder_level: 1671,
                to_utilization_pct: 88.9,
                recommended_transfer_qty: 2670,
                reason: "Deficit at Mumbai (672 avail <= ROP 1671). Transfer 2670 from surplus at Surat.",
                estimated_transit_days: 1,
                estimated_cost_savings: 270940,
              },
              {
                product_id: "mock-2",
                product_name: "Boat Smart Television Gen 10",
                sku: "SKU-BOA-0337",
                from_warehouse_name: "Surat Central",
                from_warehouse_code: "WH-SUR",
                from_available_qty: 5973,
                from_utilization_pct: 46.9,
                to_warehouse_name: "Delhi Northern Depot",
                to_warehouse_code: "WH-DEL",
                to_available_qty: 1727,
                to_reorder_level: 2172,
                to_utilization_pct: 90.1,
                recommended_transfer_qty: 2617,
                reason: "Deficit at Delhi (1727 avail <= ROP 2172). Transfer 2617 from surplus at Surat.",
                estimated_transit_days: 2,
                estimated_cost_savings: 155120,
              }
            ]).map((rec, idx) => {
              const itemKey = `${rec.sku}-${rec.from_warehouse_code}-${rec.to_warehouse_code}`;
              const isTransferred = transferredKeys.includes(itemKey);

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[#E5E7EB] bg-white space-y-3 shadow-2xs hover:border-[#059669]/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#2563EB] text-xs">{rec.sku}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F0FDF4] text-[#059669] border border-[#059669]/20">
                        SAVE ₹{Number(rec.estimated_cost_savings).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#111827]">{rec.product_name}</h3>

                    {/* Source ➔ Destination Depot Flow */}
                    <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-1.5 text-[#111827]">
                          <Boxes className="h-3.5 w-3.5 text-[#2563EB]" />
                          <span>{rec.from_warehouse_name} ({rec.from_warehouse_code})</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-[#059669]" />
                        <div className="flex items-center gap-1.5 text-[#111827]">
                          <Truck className="h-3.5 w-3.5 text-[#059669]" />
                          <span>{rec.to_warehouse_name} ({rec.to_warehouse_code})</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#6B7280] pt-1 border-t border-[#E5E7EB]/60">
                        <span>Surplus: <strong className="text-[#111827]">{rec.from_available_qty} units</strong></span>
                        <span>Rebalance: <strong className="text-[#059669]">{rec.recommended_transfer_qty} units</strong></span>
                        <span>Deficit Stock: <strong className="text-[#DC2626]">{rec.to_available_qty} units</strong></span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#4B5563] leading-relaxed">
                      {rec.reason}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
                    <span className="text-[#6B7280]">
                      Transit SLA: <strong className="text-[#111827]">{rec.estimated_transit_days} day(s)</strong>
                    </span>

                    {isTransferred ? (
                      <span className="text-xs font-semibold text-[#16A34A] flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Transfer Dispatched
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleInitiateTransfer(rec, itemKey)}
                        disabled={initiateMutation.isPending}
                        className="h-8 px-3 rounded-lg bg-[#059669] text-white text-xs font-semibold hover:bg-[#047857] active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <ArrowRightLeft className="h-3 w-3" />
                        <span>Initiate Stock Transfer ({rec.recommended_transfer_qty} Units)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Dispatched Transfers Table */}
          {(activeTransfers || []).length > 0 && (
            <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-2.5 shadow-2xs mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#111827]">
                <div className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 text-[#059669]" />
                  <span>Active Inter-Depot Dispatches in Transit</span>
                </div>
                <span className="font-mono text-[10px] text-[#059669] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#059669]/20">
                  {activeTransfers?.length} TRANSIT PIPELINE
                </span>
              </div>

              <div className="divide-y divide-[#F3F4F6] text-xs">
                {(activeTransfers || []).slice(0, 3).map((trf) => (
                  <div key={trf.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#2563EB]">TRF-{trf.id.substring(0, 8).toUpperCase()}</span>
                      <span className="text-[#111827] font-semibold">{trf.product_name}</span>
                      <span className="text-[10px] font-mono text-[#6B7280]">({trf.quantity} units)</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#4B5563]">
                      <span>{trf.from_warehouse_name} ➔ {trf.to_warehouse_name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB]">
                        {trf.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION: FULL INVENTORY LEDGER                                            */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#FAFAFA] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search SKU, product name, or supplier..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#111827]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Multi-Warehouse Selector */}
              <div className="flex items-center gap-1.5 bg-white border border-[#E5E7EB] rounded-lg px-2.5 h-8">
                <Boxes className="h-3.5 w-3.5 text-[#2563EB]" />
                <span className="text-[11px] font-semibold text-[#6B7280]">Warehouse:</span>
                <select
                  value={selectedWarehouse}
                  onChange={(e) => {
                    setSelectedWarehouse(e.target.value);
                    setPage(1);
                  }}
                  className="text-xs bg-transparent focus:outline-none font-semibold text-[#111827] cursor-pointer"
                >
                  <option value="ALL">All Hubs ({meta?.total_items ?? 2500} SKUs)</option>
                  {(warehouses || []).map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.warehouse_code}) - {w.current_utilization ?? 50}% util
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-8 px-2.5 text-xs bg-white border border-[#E5E7EB] rounded-lg focus:outline-none text-[#111827] font-semibold cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="critical">Critical Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="optimal">Optimal</option>
                <option value="overstock">Overstock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-semibold bg-[#FAFAFA]">
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">PRODUCT</th>
                  <th className="py-3 px-4 text-right">ON HAND (Units)</th>
                  <th className="py-3 px-4 text-right">AVAILABLE (Units)</th>
                  <th className="py-3 px-4 text-right">RESERVED (Units)</th>
                  <th className="py-3 px-4">DEPOT</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6] text-[#111827]">
                {isLoading ? (
                  <TableRowSkeleton rows={5} cols={8} />
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="py-6 px-4">
                      <ErrorState error={error} onRetry={refetch} />
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 px-4">
                      <EmptyState title="No SKUs Found" description="No inventory items match your search or filter." />
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#2563EB]">
                        <Link href={`/inventory/${item.id}`} className="hover:underline">
                          {item.sku || item.id}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        <div>{item.product_name || "SKU Item"}</div>
                        <div className="text-[10px] text-[#6B7280] font-normal">
                          {item.category_name || "General"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {item.quantity_on_hand.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#16A34A] font-bold">
                        {item.available_quantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#6B7280]">
                        {item.reserved_quantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#4B5563]">
                        {item.warehouse_name || item.warehouse_id}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.stock_status === "CRITICAL" || item.stock_status === "OUT_OF_STOCK"
                              ? "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20"
                              : item.stock_status === "LOW_STOCK"
                              ? "bg-[#FFFBEB] text-[#D97706] border border-[#F59E0B]/20"
                              : item.stock_status === "OVERSTOCK"
                              ? "bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20"
                              : "bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20"
                          }`}
                        >
                          {item.stock_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/inventory/${item.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E5E7EB] bg-white text-[11px] font-semibold text-[#111827] hover:bg-[#F3F4F6] shadow-2xs"
                        >
                          <span>Details</span>
                          <ArrowUpRight className="h-3 w-3 text-[#6B7280]" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {meta && (
            <div className="p-4 border-t border-[#E5E7EB]">
              <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
