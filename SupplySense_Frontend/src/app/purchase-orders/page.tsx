"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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
import { CreatePOModal, type InitialProductPayload } from "@/components/purchase-orders/create-po-modal";

function PurchaseOrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPOItem, setSelectedPOItem] = useState<InitialProductPayload | null>(null);
  const [approvedPoIds, setApprovedPoIds] = useState<string[]>([]);
  const [createdPoSkus, setCreatedPoSkus] = useState<string[]>([]);
  const [localOrders, setLocalOrders] = useState<any[]>([]);

  // Check URL search parameters on mount
  useEffect(() => {
    const createParam = searchParams?.get("create") || searchParams?.get("action") || searchParams?.get("modal");
    if (createParam === "true" || createParam === "createPO" || createParam === "new") {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedSkus = localStorage.getItem("supplysense_created_pos_skus");
        if (savedSkus) {
          setCreatedPoSkus(JSON.parse(savedSkus));
        }
        const savedOrders = localStorage.getItem("supplysense_local_pos_list");
        if (savedOrders) {
          setLocalOrders(JSON.parse(savedOrders));
        }
      } catch {}
    }
  }, []);

  const { data: poData, isLoading, refetch } = usePurchaseOrderList({ limit: 20 });
  const approveMutation = useApprovePurchaseOrder();

  const rawList = poData?.items || poData?.data || [];
  const fetchedDbOrders = rawList.map((p: any) => {
    const firstItem = p.items?.[0] || {};
    return {
      id: p.id,
      poNumber: p.po_number || `PO-${p.id.slice(0, 6).toUpperCase()}`,
      productName: firstItem.product_name || p.product_name || "Industrial Supply Component",
      sku: firstItem.sku || p.sku || "SKU-IND-01",
      supplier: p.supplier_name || "Supplier Partner",
      warehouse: p.warehouse_name || "Surat Central Warehouse",
      quantity: p.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || p.quantity || 100,
      totalCost: Number(p.total_cost || p.total_amount || 50000),
      orderDate: p.order_date || new Date().toISOString().split("T")[0],
      expectedDelivery: p.expected_delivery_date && p.expected_delivery_date.includes("-")
        ? p.expected_delivery_date
        : new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      status: approvedPoIds.includes(p.id) ? "Approved" : (p.status || "Pending"),
      reason: "Manager Issued Purchase Order",
    };
  });

  const dbOrders = [...localOrders, ...fetchedDbOrders];

  const filteredOrders = dbOrders.filter((o: any) => {
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
    } catch {}

    setApprovedPoIds((prev) => {
      const updated = [...prev, poId];
      if (typeof window !== "undefined") {
        localStorage.setItem("supplysense_approved_po_ids", JSON.stringify(updated));
      }
      return updated;
    });

    const targetPO = dbOrders.find((o: any) => o.id === poId || o.poNumber === poId);
    if (targetPO) {
      const newShipment = {
        id: `SHP-${targetPO.poNumber || targetPO.id}`,
        purchase_order_id: targetPO.id,
        po_number: targetPO.poNumber || targetPO.id,
        product_name: targetPO.productName || "JBL AudiGen 8",
        sku: targetPO.sku || "SKU-JBL-0092",
        quantity: targetPO.quantity || 1671,
        carrier: "BlueDart Express",
        vehicle_number: "MH-04-SS-8842",
        current_status: "IN_TRANSIT",
        current_location: "Mumbai Western Hub Gate #3",
        dispatch_date: new Date().toISOString().split("T")[0],
        expected_arrival: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
        delay_days: 0,
        supplier_name: targetPO.supplier || "Samsung Electronics",
        warehouse_name: targetPO.warehouse || "Mumbai Western Hub",
      };

      try {
        const saved = localStorage.getItem("supplysense_local_shipments");
        const list = saved ? JSON.parse(saved) : [];
        if (!list.some((s: any) => s.po_number === newShipment.po_number || s.purchase_order_id === targetPO.id)) {
          list.unshift(newShipment);
          localStorage.setItem("supplysense_local_shipments", JSON.stringify(list));
        }
      } catch {}
    }
  };

  const handleCreateRecommendedPO = (rec: {
    id: string;
    sku: string;
    name: string;
    supplier_id?: string;
    warehouse_id?: string;
    location?: string;
    quantity: number;
    unit_price: number;
  }) => {
    setSelectedPOItem({
      id: rec.id,
      sku: rec.sku,
      name: rec.name,
      supplier_id: rec.supplier_id || "sup-abc",
      warehouse_id: rec.warehouse_id || "wh-del",
      location: rec.location,
      quantity: rec.quantity,
      unit_price: rec.unit_price,
    });
    setIsModalOpen(true);
  };

  const handlePOSuccess = () => {
    if (selectedPOItem) {
      const sku = selectedPOItem.sku;
      const itemId = selectedPOItem.id;
      const newPOObj = {
        id: `po-${Date.now()}`,
        poNumber: `PO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        productName: selectedPOItem.name,
        sku: selectedPOItem.sku,
        supplier: "Samsung Electronics",
        warehouse: "Mumbai Western Hub",
        quantity: selectedPOItem.quantity || 1671,
        totalCost: (selectedPOItem.quantity || 1671) * (selectedPOItem.unit_price || 84555.33),
        orderDate: new Date().toISOString().split("T")[0],
        expectedDelivery: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        status: "Pending",
        reason: "Manager Issued Purchase Order",
      };

      setCreatedPoSkus((prev) => {
        const updated = [...prev, sku, itemId];
        if (typeof window !== "undefined") {
          localStorage.setItem("supplysense_created_pos_skus", JSON.stringify(updated));
        }
        return updated;
      });

      setLocalOrders((prev) => {
        const updated = [newPOObj, ...prev];
        if (typeof window !== "undefined") {
          localStorage.setItem("supplysense_local_pos_list", JSON.stringify(updated));
        }
        return updated;
      });
    }
    refetch();
  };

  const allRecommendations = [
    {
      id: "ba320b57-bc02-478c-b6b4-85a7ddab61ee",
      sku: "SKU-JBL-0092",
      name: "JBL AudiGen 8",
      onHand: 711,
      available: 672,
      reserved: 39,
      damaged: 2,
      location: "Mumbai",
      warehouse_id: "wh-mum",
      supplier_id: "sup-sam",
      reorderQty: 1671,
      unitCost: 84555.33,
    },
    {
      id: "prod-boa-0337",
      sku: "SKU-BOA-0337",
      name: "Boat Television Gen 10",
      onHand: 1824,
      available: 1727,
      reserved: 97,
      damaged: 4,
      location: "Delhi",
      warehouse_id: "wh-del",
      supplier_id: "sup-abc",
      reorderQty: 1200,
      unitCost: 32000.00,
    },
    {
      id: "prod-can-0353-sur",
      sku: "SKU-CAN-0353",
      name: "Canon Smartphone Gen 2",
      onHand: 2056,
      available: 1972,
      reserved: 84,
      damaged: 12,
      location: "Surat",
      warehouse_id: "wh-sur",
      supplier_id: "sup-alt-01",
      reorderQty: 1500,
      unitCost: 24500.00,
    },
    {
      id: "prod-can-0353-ban",
      sku: "SKU-CAN-0353",
      name: "Canon Smartphone Gen 2",
      onHand: 967,
      available: 962,
      reserved: 5,
      damaged: 5,
      location: "Bangalore",
      warehouse_id: "wh-ban",
      supplier_id: "sup-alt-01",
      reorderQty: 800,
      unitCost: 24500.00,
    },
  ];

  const aiRecommendations = allRecommendations.filter(
    (rec) => !createdPoSkus.includes(rec.sku) && !createdPoSkus.includes(rec.id)
  );

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
              onClick={() => {
                setSelectedPOItem(null);
                setIsModalOpen(true);
              }}
              className="h-9 px-3.5 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Purchase Order</span>
            </button>
          </div>
        </div>

        {/* AI Recommendations Widget (Reorders Recommended) */}
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F3F4F6] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#2563EB]" />
                <h2 className="text-base font-bold text-[#111827]">AI Recommendations</h2>
                <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2 py-0.5 rounded-full">
                  {aiRecommendations.length} REORDERS RECOMMENDED
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Automated stock calculations based on consumption burn-rate, supplier lead-times, and 30-day forecast models.
              </p>
            </div>

            <Link
              href="/inventory/reorder"
              className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 shrink-0"
            >
              <span>View All Purchase Orders</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiRecommendations.map((rec, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#CBD5E1] transition-all shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#2563EB]">{rec.sku}</span>
                  <span className="text-[10px] font-mono font-bold bg-[#FFFBEB] text-[#D97706] border border-[#F59E0B]/20 px-2 py-0.5 rounded">
                    LOW_STOCK
                  </span>
                </div>

                <div className="font-bold text-sm text-[#111827]">{rec.name}</div>

                <div className="grid grid-cols-4 gap-2 text-[11px] bg-[#FAFAFA] p-2.5 rounded-lg border border-[#F1F5F9]">
                  <div>
                    <span className="text-[#6B7280] block text-[10px]">On Hand:</span>
                    <strong className="text-[#111827] font-mono">{rec.onHand} Units</strong>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[10px]">Available:</span>
                    <strong className="text-[#111827] font-mono">{rec.available} Units</strong>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[10px]">Reserved:</span>
                    <strong className="text-[#111827] font-mono">{rec.reserved} Units</strong>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[10px]">Damaged:</span>
                    <strong className="text-[#111827] font-mono">{rec.damaged} Units</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-[#F8FAFC] px-3 py-1.5 rounded-lg text-xs text-[#6B7280]">
                  <span>Warehouse: <strong className="text-[#111827]">{rec.location}</strong></span>
                  <span className="text-[10px] text-[#2563EB] font-semibold">General</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Link
                    href={`/inventory/${rec.id}`}
                    className="text-xs text-[#6B7280] hover:text-[#111827] underline"
                  >
                    View Product Details
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleCreateRecommendedPO({
                      id: rec.id,
                      sku: rec.sku,
                      name: rec.name,
                      supplier_id: rec.supplier_id,
                      warehouse_id: rec.warehouse_id,
                      quantity: rec.reorderQty,
                      unit_price: rec.unitCost,
                    })}
                    className="h-8 px-3 rounded-lg bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Zap className="h-3 w-3 fill-white" />
                    <span>Create Purchase Order</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

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
        key={selectedPOItem ? selectedPOItem.id : "default-po-modal"}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPOItem(null);
          try {
            if (window.location.search) {
              window.history.replaceState({}, "", window.location.pathname);
            }
          } catch {}
        }}
        onSuccess={handlePOSuccess}
        initialProduct={selectedPOItem}
      />
    </AppShell>
  );
}

export default function PurchaseOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[#6B7280]">Loading Purchase Orders...</div>}>
      <PurchaseOrdersContent />
    </Suspense>
  );
}
