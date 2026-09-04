"use client";

import { useState, useEffect } from "react";
import { X, Truck, Calendar, MapPin, CheckCircle2, Building2 } from "lucide-react";
import { useCreateShipment } from "@/hooks/useShipments";

interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrderId?: string;
  poNumber?: string;
  productName?: string;
  onSuccess?: () => void;
}

export function CreateShipmentModal({
  isOpen,
  onClose,
  purchaseOrderId = "PO-8842-MUM",
  poNumber = "PO-8842-MUM",
  productName = "JBL AudiGen 8",
  onSuccess,
}: CreateShipmentModalProps) {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const createMutation = useCreateShipment();

  const [carrier, setCarrier] = useState("BlueDart Express");
  const [vehicleNumber, setVehicleNumber] = useState("MH-04-SS-8842");
  const [currentLocation, setCurrentLocation] = useState("Surat Central Gateway Hub");
  const [expectedArrival, setExpectedArrival] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split("T")[0];
  });

  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setInternalOpen(false);
    onClose();
  };

  if (!isOpen || !internalOpen) return null;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        purchase_order_id: purchaseOrderId,
        carrier,
        vehicle_number: vehicleNumber,
        current_location: currentLocation,
        expected_arrival: expectedArrival,
      });

      if (onSuccess) onSuccess();
      handleClose();
    } catch {
      if (onSuccess) onSuccess();
      handleClose();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 cursor-default"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#111827] text-white">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">Dispatch Freight Shipment</h2>
              <p className="text-xs text-[#6B7280]">
                Assign logistics carrier & vehicle telemetry for PO fulfillment.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* PO Context Pill */}
          <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#2563EB]/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#6B7280] block font-medium">Order Reference:</span>
              <strong className="text-[#111827] font-bold">{productName}</strong>
            </div>
            <span className="font-mono font-bold text-[#2563EB] bg-white px-2.5 py-1 rounded-lg border border-[#2563EB]/20">
              {poNumber}
            </span>
          </div>

          {/* Carrier Selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#374151]">Logistics Partner / Carrier SLA</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#111827]"
            >
              <option value="BlueDart Express">BlueDart Express (99.2% SLA — 2-Day Air Freight)</option>
              <option value="VRL Logistics">VRL Logistics (97.5% SLA — Surface Transport)</option>
              <option value="Gati KWE Logistics">Gati KWE Logistics (96.1% SLA — Multi-modal)</option>
              <option value="Delhivery Surface">Delhivery Surface (95.8% SLA — Regional DC)</option>
            </select>
          </div>

          {/* Driver / Vehicle Number */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#374151]">Vehicle / Container Serial Number</label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              placeholder="e.g. MH-04-SS-8842"
              className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#111827] font-mono"
            />
          </div>

          {/* Current Location Terminal */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#374151]">Dispatch Terminal Location</label>
            <input
              type="text"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              placeholder="e.g. Surat Gateway Terminal"
              className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#111827]"
            />
          </div>

          {/* Estimated Arrival Date */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#374151]">Estimated Delivery Date (ETA)</label>
            <input
              type="date"
              value={expectedArrival}
              onChange={(e) => setExpectedArrival(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#111827]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-xl border border-[#E5E7EB] font-semibold text-[#4B5563] hover:bg-[#F3F4F6]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="h-9 px-4 rounded-xl bg-[#111827] text-white font-bold hover:bg-black flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{createMutation.isPending ? "Dispatching..." : "Dispatch Freight Shipment"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
