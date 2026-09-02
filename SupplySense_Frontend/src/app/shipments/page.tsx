"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  Truck,
  Package,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  ShieldCheck,
  MapPin,
  RefreshCw,
  ArrowRightLeft,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useShipmentList, useUpdateShipmentStatus, useSimulateCarrierTelemetry } from "@/hooks/useShipments";
import { usePurchaseOrderList } from "@/hooks/usePurchaseOrders";
import { ReceiveShipmentModal } from "@/components/shipments/receive-shipment-modal";
import { CreateShipmentModal } from "@/components/shipments/create-shipment-modal";
import { ShipmentItem } from "@/lib/api/shipments";

export default function ShipmentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedShipmentForReceiving, setSelectedShipmentForReceiving] = useState<ShipmentItem | null>(null);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [completedShipmentIds, setCompletedShipmentIds] = useState<string[]>([]);
  const [localShipments, setLocalShipments] = useState<ShipmentItem[]>([]);
  const [localPOs, setLocalPOs] = useState<any[]>([]);
  const [customStatuses, setCustomStatuses] = useState<Record<string, string>>({});

  const updateStatusMutation = useUpdateShipmentStatus();
  const simulateTelemetryMutation = useSimulateCarrierTelemetry();

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("supplysense_completed_shipments");
        if (saved) setCompletedShipmentIds(JSON.parse(saved));

        const savedLocal = localStorage.getItem("supplysense_local_shipments");
        if (savedLocal) setLocalShipments(JSON.parse(savedLocal));

        const savedPOs = localStorage.getItem("supplysense_local_pos_list");
        if (savedPOs) setLocalPOs(JSON.parse(savedPOs));

        const savedStatuses = localStorage.getItem("supplysense_custom_shipment_statuses");
        if (savedStatuses) setCustomStatuses(JSON.parse(savedStatuses));
      } catch {}
    }
  }, []);

  const { data: shipmentData, isLoading, refetch } = useShipmentList({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const { data: poData } = usePurchaseOrderList({ limit: 50 });

  const dbList: ShipmentItem[] = shipmentData?.data || (shipmentData as any)?.items || [];
  const dbPOs: any[] = poData?.items || poData?.data || [];

  // Combine POs from DB and Local Storage
  const allPOs = [...localPOs, ...dbPOs];

  // Auto-generate dynamic shipment rows for POs missing a direct shipment object
  const existingPoNums = new Set([
    ...dbList.map((s) => s.po_number || s.purchase_order_id),
    ...localShipments.map((s) => s.po_number || s.purchase_order_id),
  ]);

  const poShipments: ShipmentItem[] = [];
  allPOs.forEach((po, index) => {
    const poNum = po.poNumber || po.po_number || po.id;
    if (!existingPoNums.has(poNum) && !existingPoNums.has(po.id)) {
      existingPoNums.add(poNum);
      const isApproved = po.status === "Approved" || po.status === "approved";
      const isCompleted = completedShipmentIds.includes(po.id) || completedShipmentIds.includes(poNum) || po.status === "Completed";

      poShipments.push({
        id: `SHP-${poNum}`,
        purchase_order_id: po.id,
        po_number: poNum,
        product_name: po.productName || po.items?.[0]?.product_name || "JBL AudiGen 8",
        sku: po.sku || po.items?.[0]?.sku || "SKU-JBL-0092",
        quantity: po.quantity || 1671,
        carrier: index % 2 === 0 ? "BlueDart Express" : "VRL Logistics",
        vehicle_number: `MH-04-SS-88${index + 1}2`,
        current_status: isCompleted ? "COMPLETED" : isApproved ? "DELIVERED" : "IN_TRANSIT",
        current_location: isApproved ? "Mumbai Western Hub Gate #3" : "Surat-Delhi Highway Corridor",
        dispatch_date: po.orderDate || "2026-08-28",
        expected_arrival: po.expectedDelivery || "2026-09-04",
        delay_days: 0,
        supplier_name: po.supplier || "Samsung Electronics",
        warehouse_name: po.warehouse || "Mumbai Western Hub",
      });
    }
  });

  const combinedShipments = [...localShipments, ...dbList, ...poShipments].map((s) => {
    const isReceived =
      s.current_status === "COMPLETED" ||
      completedShipmentIds.includes(s.id) ||
      (s.po_number && completedShipmentIds.includes(s.po_number)) ||
      (s.purchase_order_id && completedShipmentIds.includes(s.purchase_order_id));

    if (isReceived) {
      return { ...s, current_status: "COMPLETED" as const };
    }

    const override = customStatuses[s.id] || (s.po_number ? customStatuses[s.po_number] : undefined);
    if (override) {
      return { ...s, current_status: override as any };
    }
    return s;
  });

  const filteredShipments = combinedShipments.filter((s) => {
    const matchesSearch =
      s.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.carrier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.warehouse_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      s.current_status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleOpenReceivingModal = (shipment: ShipmentItem) => {
    setSelectedShipmentForReceiving(shipment);
    setIsReceiveModalOpen(true);
  };

  const handleReceivingSuccess = () => {
    if (selectedShipmentForReceiving) {
      setCompletedShipmentIds((prev) => [
        ...prev,
        selectedShipmentForReceiving.id,
        selectedShipmentForReceiving.po_number || "",
        selectedShipmentForReceiving.purchase_order_id || "",
      ]);
    }
    try {
      const saved = localStorage.getItem("supplysense_completed_shipments");
      if (saved) setCompletedShipmentIds(JSON.parse(saved));
    } catch {}
    refetch();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Shipments</h1>
            <p className="text-xs text-[#6B7280] mt-1">
              Track active freight shipments, carrier logistics, and warehouse receiving.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={simulateTelemetryMutation.isPending}
              onClick={async () => {
                try {
                  await simulateTelemetryMutation.mutateAsync();
                  refetch();
                } catch {}
              }}
              className="h-9 px-3 rounded-xl border border-[#E5E7EB] bg-white text-[#374151] text-xs font-semibold hover:bg-[#F9FAFB] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${simulateTelemetryMutation.isPending ? "animate-spin" : ""}`} />
              <span>{simulateTelemetryMutation.isPending ? "Pinging Carrier..." : "📡 GPS Carrier Ping"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="h-9 px-4 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Shipment</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E7EB] shadow-xs text-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shipment number, product, or supplier..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#111827]"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto font-semibold">
            {[
              { id: "all", label: "All" },
              { id: "in_transit", label: "In Transit" },
              { id: "delivered", label: "Delivered" },
              { id: "completed", label: "Completed" },
              { id: "delayed", label: "Delayed" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 ${
                  statusFilter === tab.id
                    ? "bg-[#111827] text-white shadow-xs"
                    : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Shipments Table */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#374151]">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">TRACKING / REF #</th>
                  <th className="py-3.5 px-4">PRODUCT / SKU</th>
                  <th className="py-3.5 px-4">CARRIER</th>
                  <th className="py-3.5 px-4">ORIGIN ➔ DESTINATION</th>
                  <th className="py-3.5 px-4">EXPECTED DELIVERY</th>
                  <th className="py-3.5 px-4 text-center">STATUS</th>
                  <th className="py-3.5 px-4 text-right">ACTION</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E5E7EB]">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#6B7280]">
                      Loading shipments...
                    </td>
                  </tr>
                ) : filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#6B7280]">
                      No shipments found.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((s) => {
                    const isCompleted = s.current_status === "COMPLETED";
                    const isDelivered = s.current_status === "DELIVERED";
                    const isInTransit = s.current_status === "IN_TRANSIT";
                    const isDelayed = s.current_status === "DELAYED";

                    return (
                      <tr key={s.id} className="hover:bg-[#F9FAFB] transition-colors">
                        {/* PO Number / Transfer ID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#2563EB]">
                              {s.po_number || s.id}
                            </span>
                            {s.shipment_type === "INTER_DEPOT" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#059669]/20">
                                <ArrowRightLeft className="h-2.5 w-2.5" />
                                INTER-DEPOT
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Product & SKU */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#111827]">{s.product_name}</div>
                          <div className="font-mono text-[10px] text-[#6B7280]">{s.sku} ({s.quantity.toLocaleString()} Units)</div>
                        </td>

                        {/* Carrier */}
                        <td className="py-3.5 px-4 font-medium text-[#111827]">
                          {s.carrier}
                        </td>

                        {/* Origin ➔ Destination Hub */}
                        <td className="py-3.5 px-4 text-[#374151]">
                          {s.shipment_type === "INTER_DEPOT" && s.from_warehouse_name ? (
                            <div className="flex items-center gap-1.5 font-medium">
                              <span className="text-[#DC2626] font-semibold">{s.from_warehouse_name}</span>
                              <span className="text-[#9CA3AF]">→</span>
                              <span className="text-[#059669] font-semibold">{s.warehouse_name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="text-[#6B7280] font-medium">{s.supplier_name || "Vendor"}</span>
                              <span className="text-[#9CA3AF]">→</span>
                              <span className="text-[#111827] font-semibold">{s.warehouse_name}</span>
                            </div>
                          )}
                        </td>

                        {/* Expected Delivery */}
                        <td className="py-3.5 px-4 font-mono text-[#111827]">
                          {s.actual_arrival || s.expected_arrival || "2026-09-04"}
                        </td>

                        {/* Status Badge & Selector */}
                        <td className="py-3.5 px-4 text-center">
                          {isCompleted ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F3F4F6] text-[#4B5563]">
                              Completed
                            </span>
                          ) : (
                            <select
                              value={s.current_status}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                try {
                                  const saved = localStorage.getItem("supplysense_custom_shipment_statuses");
                                  const map = saved ? JSON.parse(saved) : {};
                                  map[s.id] = newStatus;
                                  if (s.po_number) map[s.po_number] = newStatus;
                                  localStorage.setItem("supplysense_custom_shipment_statuses", JSON.stringify(map));
                                  setCustomStatuses(map);
                                } catch {}

                                try {
                                  await updateStatusMutation.mutateAsync({
                                    id: s.id,
                                    payload: { status: newStatus as any },
                                  });
                                } catch {}
                                refetch();
                              }}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border focus:outline-none cursor-pointer ${
                                isDelivered
                                  ? "bg-[#FFFBEB] text-[#D97706] border-[#F59E0B]/30"
                                  : isDelayed
                                  ? "bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/30"
                                  : "bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]/30"
                              }`}
                            >
                              <option value="IN_TRANSIT">In Transit</option>
                              <option value="DELIVERED">Delivered (At Dock Gate)</option>
                              <option value="DELAYED">Delayed</option>
                            </select>
                          )}
                        </td>

                        {/* Action Button */}
                        <td className="py-3.5 px-4 text-right">
                          {isCompleted ? (
                            <span className="text-[11px] font-mono text-[#16A34A] font-semibold">
                              ✓ Received
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenReceivingModal(s)}
                              className="h-8 px-4 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all shadow-xs cursor-pointer"
                            >
                              Receive Goods
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        <ReceiveShipmentModal
          isOpen={isReceiveModalOpen}
          onClose={() => setIsReceiveModalOpen(false)}
          shipment={selectedShipmentForReceiving}
          onSuccess={handleReceivingSuccess}
        />

        <CreateShipmentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => refetch()}
        />
      </div>
    </AppShell>
  );
}
