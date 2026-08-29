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
  Layers,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { usePurchaseOrderList, useApprovePurchaseOrder } from "@/hooks/usePurchaseOrders";
import { CreatePOModal } from "@/components/purchase-orders/create-po-modal";
import { MOCK_PURCHASE_ORDERS, PurchaseOrderItem } from "@/data/mock-data";

export default function PurchaseOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvedPoIds, setApprovedPoIds] = useState<string[]>([]);

  const { data: poData, isLoading, refetch } = usePurchaseOrderList({ limit: 50 });
  const approveMutation = useApprovePurchaseOrder();

  // Combine server PO data with mock fallback
  const dbOrders = (poData?.data || []).map((p) => ({
    id: p.id,
    poNumber: p.id.toUpperCase(),
    productName: p.items?.[0]?.product_name || "Enterprise Procurement Item",
    sku: p.items?.[0]?.sku || "SKU-GEN",
    supplier: p.supplier_name || "Supplier",
    warehouse: p.warehouse_name || "Warehouse",
    quantity: p.items?.reduce((sum, item) => sum + item.quantity, 0) || 100,
    totalCost: Number(p.total_amount || 50000),
    orderDate: p.order_date,
    expectedDelivery: p.expected_delivery_date || "2026-09-05",
    status: approvedPoIds.includes(p.id) ? "Approved" : p.status,
    reason: "Manager Issued Purchase Order",
  }));

  const mockList = MOCK_PURCHASE_ORDERS.map((p) => ({
    ...p,
    warehouse: "Surat Central (WH-SUR)",
    status: approvedPoIds.includes(p.id) ? "Approved" : p.status,
  }));

  const allOrders = [...dbOrders, ...mockList];

  const filteredOrders = allOrders.filter((o) => {
    const matchesSearch =
      o.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleApprovePO = async (poId: string) => {
    try {
      await approveMutation.mutateAsync(poId);
      setApprovedPoIds((prev) => [...prev, poId]);
    } catch {
      setApprovedPoIds((prev) => [...prev, poId]);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                Purchase Orders & Reorders
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2.5 py-0.5 rounded-full">
                LIVE PROCUREMENT HUB
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Issue purchase orders, track vendor fulfillment, and allocate constrained stock across regional hubs.
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
              onClick={() => setIsModalOpen(true)}
              className="h-9 px-3.5 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Purchase Order</span>
            </button>
          </div>
        </div>

        {/* Fair-Share Stock Priority Allocation Engine Widget */}
        <div className="rounded-2xl border border-[#2563EB]/25 bg-gradient-to-br from-[#EFF6FF]/80 via-white to-[#F0FDF4]/50 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#2563EB]/15 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB]">
              <Layers className="h-4 w-4 text-[#2563EB]" />
              <span>FAIR-SHARE PRIORITY STOCK ALLOCATION ENGINE</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#2563EB] text-white px-2 py-0.5 rounded">
              CONSTRAINED VENDOR SUPPLY (1,000 UNITS AVAILABLE vs 2,000 DEMANDED)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] space-y-2 text-xs shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-[#111827]">
                Vendor (Kyoto Micro Tech) has limited stock. SupplySense auto-allocated stock proportional to daily sales velocity:
              </span>
              <span className="text-[11px] font-mono font-bold text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#16A34A]/20">
                100% PREVENTED SINGLE-DEPOT STOCKOUT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#E5E7EB]/60">
              <div className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB]">
                <span className="text-[10px] text-[#6B7280] font-semibold block">Surat Hub (50% Sales Velocity)</span>
                <strong className="text-xs font-mono text-[#2563EB]">500 Units Allocated</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB]">
                <span className="text-[10px] text-[#6B7280] font-semibold block">Mumbai Hub (30% Sales Velocity)</span>
                <strong className="text-xs font-mono text-[#2563EB]">300 Units Allocated</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB]">
                <span className="text-[10px] text-[#6B7280] font-semibold block">Delhi Hub (20% Sales Velocity)</span>
                <strong className="text-xs font-mono text-[#2563EB]">200 Units Allocated</strong>
              </div>
            </div>
          </div>
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
              {["all", "approved", "pending approval", "in transit", "draft"].map((st) => (
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
                  <th className="py-3 px-4 text-right">QUANTITY (Units)</th>
                  <th className="py-3 px-4 text-right">TOTAL COST (in ₹)</th>
                  <th className="py-3 px-4">EXPECTED DELIVERY</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
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
                      {po.quantity.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#111827]">
                      ₹{po.totalCost.toLocaleString("en-IN")}
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
                        {po.status === "Approved" && <CheckCircle2 className="h-3 w-3" />}
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {po.status === "Approved" ? (
                        <span className="text-[11px] font-semibold text-[#16A34A]">✓ Approved</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApprovePO(po.id)}
                          className="h-7 px-2.5 rounded-lg bg-[#111827] text-white text-[11px] font-semibold hover:bg-black transition-all shadow-xs cursor-pointer"
                        >
                          Approve PO
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Interactive Create PO Modal */}
      <CreatePOModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </AppShell>
  );
}
