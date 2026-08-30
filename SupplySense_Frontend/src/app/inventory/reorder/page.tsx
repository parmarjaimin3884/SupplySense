"use client";

import { useState, useEffect } from "react";
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
  RotateCcw,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useLowStock } from "@/hooks/useInventory";

const STORAGE_KEY = "supplysense_reorder_statuses_v1";

export default function ReorderPage() {
  const { data: lowStockItems, isLoading } = useLowStock();
  const [reorders, setReorders] = useState<any[]>([]);

  useEffect(() => {
    if (lowStockItems) {
      const formatted = (lowStockItems || []).map((s: any) => ({
        id: s.id,
        sku: s.sku,
        name: s.name || s.product_name,
        category: s.category_name || "Electronics",
        currentStock: s.available_quantity ?? s.quantity_on_hand ?? 0,
        reorderQuantity: s.reorder_level ?? 50,
        supplier: s.supplier_name || "Tier-1 Vendor",
        leadTimeDays: s.lead_time || 14,
        unitCost: Number(s.cost_price || s.unit_cost || 100),
        status: "pending" as "pending" | "approved" | "rejected",
      }));
      setReorders(formatted);
    }
  }, [lowStockItems]);

  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved authorization statuses from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Record<string, "pending" | "approved" | "rejected"> = JSON.parse(saved);
        setReorders((prev) =>
          prev.map((item) => ({
            ...item,
            status: parsed[item.id] || item.status,
          }))
        );
      }
    } catch (e) {
      console.error("Failed to load saved reorders:", e);
    } finally {
      setIsLoaded(true);
    }
  }, [lowStockItems]);


  // Save changes to localStorage whenever reorders change
  const persistState = (newReorders: typeof reorders) => {
    setReorders(newReorders);
    try {
      const statusMap = newReorders.reduce((acc, item) => {
        acc[item.id] = item.status;
        return acc;
      }, {} as Record<string, string>);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statusMap));
    } catch (e) {
      console.error("Failed to save reorders to localStorage:", e);
    }
  };

  const handleApprove = (id: string) => {
    const updated = reorders.map((r) => (r.id === id ? { ...r, status: "approved" as const } : r));
    persistState(updated);
  };

  const handleReject = (id: string) => {
    const updated = reorders.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r));
    persistState(updated);
  };

  const handleBatchApprove = () => {
    const updated = reorders.map((r) => ({ ...r, status: "approved" as const }));
    persistState(updated);
  };

  const handleResetQueue = () => {
    const reset = (lowStockItems || []).map((s: any) => ({
      id: s.id,
      sku: s.sku,
      name: s.name || s.product_name,
      category: s.category_name || "Electronics",
      currentStock: s.available_quantity ?? s.quantity_on_hand ?? 0,
      reorderQuantity: s.reorder_level ?? 50,
      supplier: s.supplier_name || "Tier-1 Vendor",
      leadTimeDays: s.lead_time || 14,
      unitCost: Number(s.cost_price || s.unit_cost || 100),
      status: "pending" as const,
    }));
    persistState(reset);
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
            {approvedItems.length > 0 && (
              <button
                type="button"
                onClick={handleResetQueue}
                className="h-9 px-3 rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] text-xs font-semibold hover:bg-[#F9FAFB] transition-all flex items-center gap-1.5 cursor-pointer"
                title="Reset queue for demo testing"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Queue</span>
              </button>
            )}

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
                    <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2 py-0.5 rounded">
                      Confidence {item.confidenceScore}%
                    </span>
                  </div>

                  <p className="text-xs text-[#4B5563]">
                    Assigned Supplier: <strong className="text-[#111827]">{item.supplier}</strong> ({item.leadTimeDays}d lead-time) · Destination: <strong className="text-[#111827]">{item.location}</strong>
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280] pt-1">
                    <span>Current On Hand: <strong className="font-mono text-[#111827]">{item.onHand.toLocaleString()}</strong> ({item.daysOfSupply}d supply)</span>
                    <span>Monthly Run Rate: <strong className="font-mono text-[#111827]">{item.predictedDemandMonthly.toLocaleString()}</strong></span>
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
                        className="h-10 px-4 rounded-xl bg-[#2563EB] text-white text-xs font-semibold shadow-xs hover:bg-[#1D4ED8] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="h-3.5 w-3.5" />
                        <span>Authorize PO</span>
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
