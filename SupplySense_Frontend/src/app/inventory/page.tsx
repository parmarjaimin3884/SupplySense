"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  ChevronDown,
  Download,
  Filter,
  Plus,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useInventoryList, useLowStock } from "@/hooks/useInventory";
import { Pagination } from "@/components/ui/pagination";
import { TableRowSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import type { InventoryItem } from "@/types/inventory";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // API Hook — server-side search, filter, pagination
  const { data: inventoryData, isLoading, error, refetch } = useInventoryList({
    page,
    limit,
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter.toUpperCase() : undefined,
  });
  const { data: lowStockItems } = useLowStock();

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
        {/* SECTION: AI RECOMMENDATIONS                                               */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-[#2563EB]/25 bg-gradient-to-br from-[#EFF6FF]/60 via-white to-[#F0FDF4]/40 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2563EB]/15 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#2563EB]" />
                <h2 className="text-base font-bold text-[#111827]">AI Recommendations</h2>
                <span className="text-[10px] font-mono font-bold bg-[#2563EB] text-white px-2 py-0.2 rounded">
                  2 REORDERS RECOMMENDED
                </span>
              </div>
              <p className="text-xs text-[#4B5563] mt-0.5">
                Automated stock calculations based on consumption burn-rate, supplier lead-times, and 30-day forecast models.
              </p>
            </div>
            <Link
              href="/purchase-orders"
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View All Purchase Orders</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(lowStockItems || []).slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-[#E5E7EB] bg-white space-y-3 shadow-2xs hover:border-[#2563EB]/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#2563EB] text-xs">{item.sku || item.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        item.stock_status === "CRITICAL" || item.stock_status === "OUT_OF_STOCK"
                          ? "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20"
                          : "bg-[#FFFBEB] text-[#D97706]"
                      }`}
                    >
                      {item.stock_status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#111827]">{item.product_name || "SKU Item"}</h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#4B5563] pt-1">
                    <div>On Hand: <strong className="text-[#111827] block font-mono">{item.quantity_on_hand} ea</strong></div>
                    <div>Available: <strong className="text-[#111827] block font-mono">{item.available_quantity} ea</strong></div>
                    <div>Reserved: <strong className="text-[#111827] block font-mono">{item.reserved_quantity} ea</strong></div>
                    <div>Damaged: <strong className="text-[#111827] block font-mono">{item.damaged_quantity} ea</strong></div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#374151] flex items-center justify-between">
                    <span>Warehouse: <strong className="text-[#111827] font-mono">{item.warehouse_name || item.warehouse_id}</strong></span>
                    <span className="text-[11px] text-[#2563EB] font-medium">{item.category_name || "General"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between">
                  <Link
                    href={`/inventory/${item.id}`}
                    className="text-xs font-semibold text-[#6B7280] hover:text-[#111827]"
                  >
                    View Product Details
                  </Link>
                  <Link
                    href={`/purchase-orders`}
                    className="h-8 px-3 rounded-lg bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Zap className="h-3 w-3" />
                    <span>Create Purchase Order</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: FULL INVENTORY LEDGER                                            */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-8 px-2.5 text-xs bg-white border border-[#E5E7EB] rounded-lg focus:outline-none text-[#111827]"
              >
                <option value="all">All Statuses</option>
                <option value="critical">Critical</option>
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
                  <th className="py-3 px-4 text-right">ON HAND</th>
                  <th className="py-3 px-4 text-right">AVAILABLE</th>
                  <th className="py-3 px-4 text-right">RESERVED</th>
                  <th className="py-3 px-4">DEPOT</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6] text-[#111827]">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-6 px-4">
                      <TableRowSkeleton rows={5} cols={8} />
                    </td>
                  </tr>
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
                        {item.quantity_on_hand.toLocaleString()} ea
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#16A34A] font-bold">
                        {item.available_quantity.toLocaleString()} ea
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#6B7280]">
                        {item.reserved_quantity.toLocaleString()} ea
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
