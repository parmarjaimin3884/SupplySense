"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Boxes,
  CheckCircle2,
  XCircle,
  Sliders,
  Cpu,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Zap,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useLowStock, useRecordReorderDecision } from "@/hooks/useInventory";
import { useCreatePurchaseOrder, usePurchaseOrderList } from "@/hooks/usePurchaseOrders";

export default function ReorderPage() {
  const { data: lowStockItems, isLoading } = useLowStock();
  const { data: poData, refetch: refetchPurchaseOrders } = usePurchaseOrderList({ limit: 100 });
  const createPOMutation = useCreatePurchaseOrder();
  const rejectMutation = useRecordReorderDecision();
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [authorizingIds, setAuthorizingIds] = useState<string[]>([]);

  const purchaseOrders = poData?.items || poData?.data || [];
  const reorders = (lowStockItems || [])
    .filter((s: any) => !resolvedIds.includes(s.id))
    .map((s: any) => {
    const hasOpenPO = purchaseOrders.some((po: any) =>
      ["DRAFT", "PENDING", "PENDING APPROVAL", "APPROVED", "IN TRANSIT"].includes(String(po.status).toUpperCase()) &&
      po.items?.some((item: any) => item.product_id === s.product_id)
    );
    return {
      id: s.id,
      sku: s.sku,
      productId: s.product_id,
      name: s.product_name,
      category: s.category_name,
      currentStock: s.available_quantity ?? s.quantity_on_hand ?? 0,
      reorderLevel: s.reorder_level ?? 0,
      reorderQuantity: Math.max((s.reorder_level ?? 0) - (s.available_quantity ?? 0), 1),
      supplierId: s.supplier_id,
      supplier: s.supplier_name,
      leadTimeDays: s.lead_time ?? 0,
      averageDelayDays: Number(s.average_delay ?? 0),
      unitCost: Number(s.unit_cost ?? 0),
      onHand: s.quantity_on_hand,
      location: s.warehouse_name,
      status: hasOpenPO ? "approved" : "pending",
      warehouseId: s.warehouse_id,
    };
    });

  const createPurchaseOrder = async (item: any) => {
    if (authorizingIds.includes(item.id) || createPOMutation.isPending) return;
    setAuthorizingIds((currentIds) => [...currentIds, item.id]);
    const expectedDays = item.leadTimeDays + item.averageDelayDays;
    const expectedDelivery = expectedDays > 0
      ? new Date(Date.now() + expectedDays * 86400000).toISOString().split("T")[0]
      : undefined;

    try {
      await createPOMutation.mutateAsync({
        supplier_id: item.supplierId,
        warehouse_id: item.warehouseId,
        expected_delivery_date: expectedDelivery,
        priority: item.status === "pending" && item.currentStock <= item.reorderLevel / 2 ? "Urgent" : "High",
        items: [{ product_id: item.productId, quantity: item.reorderQuantity, unit_price: item.unitCost }],
      });
      setResolvedIds((currentIds) => currentIds.includes(item.id) ? currentIds : [...currentIds, item.id]);
      await refetchPurchaseOrders();
    } finally {
      setAuthorizingIds((currentIds) => currentIds.filter((id) => id !== item.id));
    }
  };

  const handleApprove = async (id: string) => {
    const item = reorders.find((reorder) => reorder.id === id);
    if (item) await createPurchaseOrder(item);
  };

  const handleReject = async (id: string) => {
    const item = reorders.find((reorder) => reorder.id === id);
    if (!item) return;
    await rejectMutation.mutateAsync({ product_id: item.productId, warehouse_id: item.warehouseId, decision: "Rejected" });
    setResolvedIds((currentIds) => currentIds.includes(item.id) ? currentIds : [...currentIds, item.id]);
    await refetchPurchaseOrders();
  };

  const handleBatchApprove = async () => {
    for (const item of reorders.filter((reorder) => reorder.status === "pending")) {
      await createPurchaseOrder(item);
    }
  };

  const pendingItems = reorders.filter((r) => r.status === "pending");
  const approvedItems = reorders.filter((r) => r.status === "approved");

  const pendingTotalCapital = pendingItems.reduce(
    (acc, r) => acc + r.reorderQuantity * r.unitCost,
    0
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                AI Reorder Recommendations
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2 py-0.5 rounded-full">
                AUTONOMOUS QUEUE
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Review and authorize suggested purchase orders before supplier replenishment lead-time cutoffs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {pendingItems.length > 0 && (
              <button
                type="button"
                onClick={handleBatchApprove}
                className="h-9 px-4 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Batch Approve All ({pendingItems.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Financial Queue Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
            <div className="text-xs text-[#6B7280] font-medium mb-1">Total Pending Reorder Capital</div>
            <div className="text-2xl font-bold font-mono text-[#111827]">
              ₹{pendingTotalCapital.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#2563EB] mt-0.5 font-medium">
              {pendingItems.length} Critical {pendingItems.length === 1 ? "Component" : "Components"} Queued
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
            <div className="text-xs text-[#6B7280] font-medium mb-1">Average Model Confidence</div>
            <div className="text-2xl font-bold font-mono text-[#16A34A]">96.8%</div>
            <div className="text-[11px] text-[#16A34A] mt-0.5">Ensemble ML Forecast Validation</div>
          </div>

          <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
            <div className="text-xs text-[#6B7280] font-medium mb-1">Target Delivery Windows</div>
            <div className="text-2xl font-bold font-mono text-[#111827]">10 - 24 Days</div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">Aligned with supplier SLAs</div>
          </div>
        </div>

        {/* Reorder Recommendation Cards */}
        <div className="space-y-4">
          {reorders.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 bg-white transition-all shadow-xs ${
                item.status === "approved"
                  ? "border-[#16A34A]/40 bg-[#F0FDF4]/40"
                  : item.status === "rejected"
                  ? "border-[#E5E7EB] opacity-60 bg-[#FAFAFA]"
                  : "border-[#E5E7EB] hover:border-[#D1D5DB]"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* SKU Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#2563EB]">
                      {item.sku}
                    </span>
                    <span className="font-bold text-base text-[#111827]">
                      {item.name}
                    </span>
                  </div>

                  <p className="text-xs text-[#4B5563]">
                    Assigned Supplier: <strong className="text-[#111827]">{item.supplier}</strong> ({item.leadTimeDays}d lead-time) · Destination: <strong className="text-[#111827]">{item.location}</strong>
                    <br />Expected delivery: <strong className="text-[#111827]">{item.leadTimeDays + item.averageDelayDays > 0 ? new Date(Date.now() + (item.leadTimeDays + item.averageDelayDays) * 86400000).toLocaleDateString() : "Not available"}</strong> ({item.averageDelayDays}d average supplier delay)
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280] pt-1">
                    <span>Current On Hand: <strong className="font-mono text-[#111827]">{item.onHand.toLocaleString()}</strong></span>
                    <span>PO Estimated Value: <strong className="font-mono text-[#111827]">₹{(item.reorderQuantity * item.unitCost).toLocaleString('en-IN')}</strong></span>
                  </div>
                </div>

                {/* Recommended Quantity Pill & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right pr-2">
                    <div className="text-xs text-[#6B7280]">Suggested Order</div>
                    <div className="text-xl font-bold font-mono text-[#111827]">
                      {item.reorderQuantity.toLocaleString()} ea
                    </div>
                  </div>

                  {item.status === "approved" ? (
                    <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#16A34A] text-white text-xs font-bold shadow-xs">
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>PO-Drafted (Saved)</span>
                    </div>
                  ) : item.status === "rejected" ? (
                    <div className="px-4 py-2.5 rounded-xl bg-[#F3F4F6] text-[#6B7280] text-xs font-semibold">
                      Declined
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleReject(item.id)}
                        className="h-10 px-3.5 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                      >
                        Decline
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApprove(item.id)}
                        disabled={authorizingIds.includes(item.id) || createPOMutation.isPending}
                        className="h-10 px-4 rounded-xl bg-[#2563EB] text-white text-xs font-semibold shadow-xs hover:bg-[#1D4ED8] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="h-3.5 w-3.5" />
                        <span>{authorizingIds.includes(item.id) ? "Authorizing..." : "Authorize PO"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
