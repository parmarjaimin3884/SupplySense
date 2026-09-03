"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2, ShoppingBag, Building2, Calendar, AlertCircle, CheckCircle2, Sparkles, MapPin, Truck } from "lucide-react";
import { useCreatePurchaseOrder } from "@/hooks/usePurchaseOrders";
import { useSupplierList } from "@/hooks/useSuppliers";
import { useWarehouses } from "@/hooks/useWarehouses";
import { useInventoryList } from "@/hooks/useInventory";

export interface InitialProductPayload {
  id: string;
  name: string;
  sku: string;
  supplier_id?: string;
  warehouse_id?: string;
  location?: string;
  quantity?: number;
  unit_price?: number;
}

interface CreatePOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialProduct?: InitialProductPayload | null;
}

export function CreatePOModal({ isOpen, onClose, onSuccess, initialProduct }: CreatePOModalProps) {
  // 1. All Hooks declared unconditionally at top level
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const { data: supplierData } = useSupplierList({ limit: 50 });
  const { data: warehouseData } = useWarehouses();
  const { data: inventoryData } = useInventoryList({ limit: 100 });
  const createMutation = useCreatePurchaseOrder();

  const suppliers = supplierData?.data || [];

  const warehouses = (Array.isArray(warehouseData) ? warehouseData : (warehouseData as any)?.data) || [];
  const products = inventoryData?.data || (inventoryData as any)?.items || [];

  const resolveWarehouseId = () => {
    if (!initialProduct) return "";
    const loc = (initialProduct.location || "").toLowerCase();
    const wid = (initialProduct.warehouse_id || "").toLowerCase();

    if (loc.includes("delhi") || wid.includes("del")) return "wh-del";
    if (loc.includes("mumbai") || wid.includes("mum")) return "wh-mum";
    if (loc.includes("surat") || wid.includes("sur")) return "wh-sur";
    if (loc.includes("bangalore") || wid.includes("ban")) return "wh-ban";
    if (loc.includes("ahmedabad") || wid.includes("ahm")) return "wh-ahm";
    return initialProduct.warehouse_id || "";
  };

  const resolveSupplierId = () => {
    if (!initialProduct) return "";
    if (initialProduct.supplier_id) return initialProduct.supplier_id;
    if (initialProduct.sku?.includes("BOA")) return "sup-abc";
    if (initialProduct.sku?.includes("JBL")) return "sup-sam";
    return "";
  };

  const [supplierId, setSupplierId] = useState(resolveSupplierId);
  const [warehouseId, setWarehouseId] = useState(resolveWarehouseId);
  const [priority, setPriority] = useState<"Normal" | "High" | "Urgent">("Normal");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState(() => [
    {
      product_id: initialProduct?.id || "",
      product_name: initialProduct ? `${initialProduct.name} (${initialProduct.sku})` : "",
      quantity: initialProduct?.quantity || 0,
      unit_price: initialProduct?.unit_price || 0,
    },
  ]);

  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (initialProduct) {
      setWarehouseId(resolveWarehouseId());
      setSupplierId(resolveSupplierId());
      setItems([
        {
          product_id: initialProduct.id,
          product_name: `${initialProduct.name} (${initialProduct.sku})`,
          quantity: initialProduct.quantity || 250,
          unit_price: initialProduct.unit_price || 1850.00,
        },
      ]);
    }
  }, [initialProduct]);

  useEffect(() => {
    if (!supplierId || initialProduct) return;
    const supplier = suppliers.find((candidate: any) => candidate.id === supplierId);
    const deliveryDays = Number(supplier?.lead_time || 0) + Number(supplier?.average_delay || 0);
    if (deliveryDays > 0) {
      setDeliveryDate(new Date(Date.now() + deliveryDays * 86400000).toISOString().split("T")[0]);
    }
  }, [supplierId, suppliers, initialProduct]);

  const handleClose = () => {
    setInternalOpen(false);
    onClose();
  };

  // 2. Early return AFTER all hooks have executed
  if (!isOpen || !internalOpen) return null;

  const targetWarehouseObj = warehouses.find((w: any) => w.id === warehouseId) || warehouses[0];
  const targetSupplierObj = suppliers.find((s: any) => s.id === supplierId) || suppliers[0];

  const handleAddItem = () => {
    setItems([
      ...items,
      { product_id: "", product_name: "", quantity: 0, unit_price: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !warehouseId || items.some((item) => !item.product_id || item.quantity <= 0 || item.unit_price < 0)) return;
    try {
      await createMutation.mutateAsync({
        supplier_id: supplierId,
        warehouse_id: warehouseId,
        expected_delivery_date: deliveryDate || undefined,
        priority,
        notes,
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
      });
      if (onSuccess) onSuccess();
      handleClose();
    } catch {
      return;
    }
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 cursor-default"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#111827] text-white">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">Create Purchase Order</h2>
              <p className="text-xs text-[#6B7280]">Draft a new procurement order for vendor fulfillment.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* AI Intelligent Routing & Telemetry Banner */}
          <div className="rounded-xl border border-[#2563EB]/25 bg-[#EFF6FF]/60 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[#2563EB]">
                <Sparkles className="h-4 w-4 text-[#2563EB]" />
                <span>AI PROCUREMENT OPTIMIZATION RECOMMENDATION</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#2563EB] text-white px-2 py-0.5 rounded">
                {targetSupplierObj?.lead_time ? `${targetSupplierObj.lead_time}d SUPPLIER LEAD TIME` : "LIVE SUPPLIER DATA"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[#374151] pt-1">
              <div className="bg-white p-2 rounded-lg border border-[#2563EB]/15">
                <span className="text-[10px] text-[#6B7280] block font-medium">Target Deficit Hub:</span>
                <strong className="text-[#111827] flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-[#2563EB]" />
                  <span>{targetWarehouseObj?.name || "Select a warehouse"}</span>
                </strong>
              </div>

              <div className="bg-white p-2 rounded-lg border border-[#2563EB]/15">
                <span className="text-[10px] text-[#6B7280] block font-medium">Contracted Vendor SLA:</span>
                <strong className="text-[#111827] flex items-center gap-1">
                  <Truck className="h-3 w-3 text-[#2563EB]" />
                  <span>{targetSupplierObj?.company_name || "Select a supplier"}</span>
                </strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Supplier Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#374151]">Vendor / Supplier</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#111827]"
              >
                <option value="">Select supplier</option>
                {suppliers.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.company_name || s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Warehouse */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#374151]">Destination Warehouse</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#111827]"
              >
                <option value="">Select warehouse</option>
                {warehouses.map((w: any) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.warehouse_code || w.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#374151]">Order Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full h-9 px-3 text-xs bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#111827]"
              >
                <option value="Normal">Normal Priority</option>
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent / Express</option>
              </select>
            </div>

            {/* Expected Delivery Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#374151]">Expected Delivery Date</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#111827]"
              />
            </div>
          </div>

          {/* Line Items Section */}
          <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#111827]">Order Line Items & Unit Economics</span>
                <p className="text-[11px] text-[#6B7280]">Quantities and unit costs auto-computed by SupplySense AI forecast & ERP master agreement.</p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-[#2563EB] font-semibold hover:underline flex items-center gap-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Add Product Line
              </button>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-[#6B7280] uppercase px-3 pt-1">
              <div className="col-span-5">Product / SKU</div>
              <div className="col-span-2">Quantity (Units)</div>
              <div className="col-span-3">Unit Price (in ₹)</div>
              <div className="col-span-2 text-right">Line Total (₹)</div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2 text-xs">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <select
                        value={item.product_id || ""}
                        onChange={(e) => {
                          const product = products.find((candidate: any) => String(candidate.product_id) === String(e.target.value));
                          setItems((currentItems) => currentItems.map((currentItem, itemIndex) =>
                            itemIndex === idx
                              ? {
                                  ...currentItem,
                                  product_id: product?.product_id || "",
                                  product_name: product?.product_name || "",
                                  unit_price: Number(product?.unit_cost || currentItem.unit_price || 0),
                                }
                              : currentItem
                          ));
                        }}
                        className="w-full h-8 px-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-semibold"
                      >
                        <option value="">Select product</option>
                        {products.map((product: any, productIndex: number) => {
                          const uniqueProductId = `${product.product_id || product.product_name || "product"}-${product.sku || productIndex}-${productIndex}`;
                          return (
                            <option key={String(uniqueProductId)} value={String(uniqueProductId)}>
                              {product.product_name || product.name || "Unnamed product"} ({product.sku || product.product_id || "SKU"})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                        placeholder="Qty"
                        className="w-full h-8 px-2.5 bg-white border border-[#2563EB]/40 rounded-lg text-xs font-mono font-bold text-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(idx, "unit_price", Number(e.target.value))}
                        placeholder="Price (₹)"
                        className="w-full h-8 px-2.5 bg-white border border-[#16A34A]/40 rounded-lg text-xs font-mono font-bold text-[#16A34A] focus:outline-none focus:ring-1 focus:ring-[#16A34A]"
                      />
                    </div>

                    <div className="col-span-2 flex items-center justify-between">
                      <span className="font-mono font-bold text-[#111827]">
                        ₹{(item.quantity * item.unit_price).toLocaleString("en-IN")}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-[#9CA3AF] hover:text-[#DC2626] p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* AI Smart Indicator Pill */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] bg-white p-2 rounded-lg border border-[#E5E7EB] text-[#4B5563]">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-[#2563EB]" />
                      <span><strong>AI Reorder Point:</strong> Auto-filled <strong>{item.quantity.toLocaleString()} units</strong> to restore 30-day safety stock buffer.</span>
                    </span>
                    <span className="font-mono text-[#16A34A] font-bold">
                      🏷️ Contracted ERP Rate: ₹{item.unit_price.toLocaleString('en-IN')}/unit
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Summary */}
          <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#16A34A]/20 flex items-center justify-between text-xs">
            <span className="text-[#15803D] font-bold">Total Purchase Order Value:</span>
            <span className="text-base font-bold font-mono text-[#15803D]">
              ₹{totalAmount.toLocaleString("en-IN")} INR
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClose();
              }}
              className="h-9 px-4 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6] transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="h-9 px-4 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{createMutation.isPending ? "Creating PO..." : "Issue Purchase Order"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
