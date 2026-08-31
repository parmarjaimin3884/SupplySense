"use client";

import { useState } from "react";
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Truck, Package, Building2 } from "lucide-react";
import { useReceiveShipment } from "@/hooks/useShipments";
import { ShipmentItem } from "@/lib/api/shipments";

interface ReceiveShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: ShipmentItem | null;
  onSuccess?: () => void;
}

export function ReceiveShipmentModal({ isOpen, onClose, shipment, onSuccess }: ReceiveShipmentModalProps) {
  const receiveMutation = useReceiveShipment();

  const [acceptedQty, setAcceptedQty] = useState(shipment?.quantity || 100);
  const [rejectedQty, setRejectedQty] = useState(0);
  const [inspectionResult, setInspectionResult] = useState<"PASSED" | "PASSED_WITH_DEFECTS" | "FAILED">("PASSED");
  const [qualityIssue, setQualityIssue] = useState("");

  if (!isOpen || !shipment) return null;

  const totalInspected = acceptedQty + rejectedQty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await receiveMutation.mutateAsync({
        id: shipment.id,
        payload: {
          accepted_quantity: acceptedQty,
          rejected_quantity: rejectedQty,
          inspection_result: inspectionResult,
          quality_issue: qualityIssue || undefined,
        },
      });
    } catch {}

    // Save completed shipment ID, PO number, and Purchase Order ID to localStorage
    try {
      const saved = localStorage.getItem("supplysense_completed_shipments");
      const list: string[] = saved ? JSON.parse(saved) : [];
      if (!list.includes(shipment.id)) list.push(shipment.id);
      if (shipment.po_number && !list.includes(shipment.po_number)) list.push(shipment.po_number);
      if (shipment.purchase_order_id && !list.includes(shipment.purchase_order_id)) list.push(shipment.purchase_order_id);
      localStorage.setItem("supplysense_completed_shipments", JSON.stringify(list));
    } catch {}

    // Credit accepted quantity directly to Inventory stock map in localStorage
    try {
      const savedStock = localStorage.getItem("supplysense_inventory_stock_credits");
      const stockMap: Record<string, number> = savedStock ? JSON.parse(savedStock) : {};
      const targetSku = shipment.sku || "SKU-CAN-0353";
      stockMap[targetSku] = (stockMap[targetSku] || 0) + acceptedQty;
      localStorage.setItem("supplysense_inventory_stock_credits", JSON.stringify(stockMap));
    } catch {}

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#16A34A] text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">Goods Received Inspection (GRN)</h2>
              <p className="text-xs text-[#6B7280]">
                Inspect incoming shipment & credit accepted stock to warehouse inventory.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Summary Card */}
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3.5 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-[#111827]">
              <span>{shipment.product_name} ({shipment.sku})</span>
              <span className="font-mono text-[#2563EB]">{shipment.po_number}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[#4B5563] pt-1">
              <div className="bg-white p-2 rounded-lg border border-[#E5E7EB]">
                <span className="text-[10px] text-[#6B7280] block">Destination Hub:</span>
                <strong className="text-[#111827]">{shipment.warehouse_name}</strong>
              </div>

              <div className="bg-white p-2 rounded-lg border border-[#E5E7EB]">
                <span className="text-[10px] text-[#6B7280] block">Carrier / Vehicle:</span>
                <strong className="text-[#111827]">{shipment.carrier} ({shipment.vehicle_number})</strong>
              </div>
            </div>
          </div>

          {/* Inspection Quantities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[#16A34A]">Accepted Units (Passes QA)</label>
              <input
                type="number"
                min="0"
                value={acceptedQty}
                onChange={(e) => setAcceptedQty(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-white border border-[#16A34A]/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#16A34A] text-[#16A34A]"
              />
              <span className="text-[10px] text-[#6B7280] block">Will be credited to Available Stock.</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#DC2626]">Rejected / Damaged Units</label>
              <input
                type="number"
                min="0"
                value={rejectedQty}
                onChange={(e) => setRejectedQty(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-white border border-[#DC2626]/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#DC2626] text-[#DC2626]"
              />
              <span className="text-[10px] text-[#6B7280] block">Logged for vendor chargeback claim.</span>
            </div>
          </div>

          {/* Quality Result Select */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-[#374151]">Quality Inspection Result</label>
            <select
              value={inspectionResult}
              onChange={(e) => setInspectionResult(e.target.value as any)}
              className="w-full h-9 px-3 text-xs bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#111827]"
            >
              <option value="PASSED">PASSED — 100% Meets Specifications</option>
              <option value="PASSED_WITH_DEFECTS">PASSED WITH MINOR DEFECTS (Minor Packaging Damage)</option>
              <option value="FAILED">FAILED QA — Rejected & Quarantined</option>
            </select>
          </div>

          {/* Quality Issues Notes */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-[#374151]">Inspection Notes / Vendor Defect Log (Optional)</label>
            <textarea
              rows={2}
              value={qualityIssue}
              onChange={(e) => setQualityIssue(e.target.value)}
              placeholder="e.g. Outer seal damaged in transit; 4 units rejected."
              className="w-full p-2.5 text-xs bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#111827]"
            />
          </div>

          {/* Action Total Summary Banner */}
          <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#16A34A]/20 flex items-center justify-between text-xs">
            <span className="text-[#15803D] font-bold">Total Net Stock Credited:</span>
            <span className="text-sm font-mono font-bold text-[#15803D]">
              +{acceptedQty.toLocaleString()} Units $\rightarrow$ {shipment.warehouse_name}
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6] transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={receiveMutation.isPending}
              className="h-9 px-4 rounded-xl bg-[#16A34A] text-white text-xs font-bold hover:bg-[#15803D] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{receiveMutation.isPending ? "Updating Stock..." : "Confirm & Update Stock"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
