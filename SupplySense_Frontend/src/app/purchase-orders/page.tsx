"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Filter,
  Plus,
  Search,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MOCK_PURCHASE_ORDERS, MOCK_SKUS, PurchaseOrderItem } from "@/data/mock-data";

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrderItem[]>(MOCK_PURCHASE_ORDERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createdPO, setCreatedPO] = useState(false);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                Purchase Orders & Reorders
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2 py-0.5 rounded-full">
                PROCUREMENT LEDGER
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Active purchase orders, automated replenishment recommendations, and vendor fulfillment pipelines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/inventory"
              className="h-9 px-3.5 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#111827] hover:bg-[#F9FAFB] shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <Boxes className="h-3.5 w-3.5 text-[#6B7280]" />
              <span>Review Inventory</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setCreatedPO(true);
                alert("New purchase order draft created for review.");
              }}
              className="h-9 px-3.5 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Purchase Order</span>
            </button>
          </div>
        </div>

        {/* AI Replenishment Queue Banner */}
        <div className="rounded-2xl border border-[#2563EB]/20 bg-gradient-to-r from-[#EFF6FF] to-white p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB]">
              <Sparkles className="h-4 w-4" />
              <span>RECOMMENDED REORDERS DETECTED</span>
            </div>
            <p className="text-xs text-[#374151] leading-relaxed">
              2 SKUs currently require purchase orders to preserve required safety buffers: <strong className="text-[#111827]">MacBook Pro 16&quot; (80 Units)</strong> and <strong className="text-[#111827]">24-Port Gigabit PoE+ Switch (60 Units)</strong>.
            </p>
          </div>

          <Link
            href="/inventory"
            className="h-8 px-3 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] flex items-center gap-1.5 shadow-xs transition-all shrink-0"
          >
            <Zap className="h-3 w-3" />
            <span>Review Reorder Triggers</span>
          </Link>
        </div>

        {/* Purchase Orders Table */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search PO number, product, or supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#111827]"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {["all", "approved", "in transit", "draft"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    statusFilter === st ? "bg-[#111827] text-white shadow-2xs" : "bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-semibold bg-[#FAFAFA]">
                  <th className="py-3 px-4">PO NUMBER</th>
                  <th className="py-3 px-4">PRODUCT / SKU</th>
                  <th className="py-3 px-4">SUPPLIER</th>
                  <th className="py-3 px-4 text-right">QUANTITY</th>
                  <th className="py-3 px-4 text-right">TOTAL COST</th>
                  <th className="py-3 px-4">EXPECTED DELIVERY</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">REASON</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6] text-[#111827]">
                {filteredOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB]">
                      {po.poNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      <div>{po.productName}</div>
                      <div className="text-[10px] font-mono text-[#6B7280]">{po.sku}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#4B5563]">{po.supplier}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      {po.quantity.toLocaleString()} ea
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#111827]">
                      ₹{po.totalCost.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#4B5563]">
                      {po.expectedDelivery}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          po.status === "Approved"
                            ? "bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20"
                            : po.status === "In Transit"
                            ? "bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20"
                            : "bg-[#FFFBEB] text-[#D97706] border border-[#F59E0B]/20"
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280] text-[11px] max-w-xs truncate">
                      {po.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
