"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Check,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Mail,
  PieChart,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Truck,
  Zap,
  ClipboardList,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useDashboardSummary, useDashboardKPIs, useDashboardAlerts } from "@/hooks/useDashboard";
import { useLowStock } from "@/hooks/useInventory";
import { useHighRiskSuppliers } from "@/hooks/useSuppliers";
import { useDelayedShipments } from "@/hooks/useShipments";
import { useCriticalRisks, useRiskSummary } from "@/hooks/useRisks";
import { useWarehouseUtilization, useWarehouseCapacity } from "@/hooks/useWarehouses";
import { KPISkeleton, CardSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";

export default function PrimaryIntelligenceDashboard() {
  const [draftedPOs, setDraftedPOs] = useState<string[]>([]);
  const [supplierContacted, setSupplierContacted] = useState(false);

  // ── API Hooks ──
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: kpis, isLoading: kpisLoading, error: kpisError, refetch: refetchKpis } = useDashboardKPIs();
  const { data: alerts, isLoading: alertsLoading } = useDashboardAlerts();
  const { data: lowStockItems } = useLowStock();
  const { data: highRiskSuppliers } = useHighRiskSuppliers();
  const { data: delayedShipments } = useDelayedShipments();
  const { data: criticalRisks } = useCriticalRisks();
  const { data: warehouseUtils, isLoading: isWarehouseLoading } = useWarehouseUtilization();
  const { data: networkCapacity } = useWarehouseCapacity();

  const handleDraftPO = (skuId: string) => {
    setDraftedPOs((prev) => [...prev, skuId]);
  };

  const isDrafted = (skuId: string) => draftedPOs.includes(skuId);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                Supply Chain Intelligence Hub
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2 py-0.5 rounded-full">
                EMBEDDED INTELLIGENCE
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Continuous monitoring across inventory velocity, shipment transit integrity, and supplier reliability.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/purchase-orders"
              className="h-9 px-3.5 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#111827] hover:bg-[#F9FAFB] shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <ClipboardList className="h-3.5 w-3.5 text-[#6B7280]" />
              <span>Purchase Orders</span>
            </Link>
            <Link
              href="/assistant"
              className="h-9 px-3.5 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#60A5FA]" />
              <span>Ask SupplySense AI</span>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* WIDGET 8: EXECUTIVE SUMMARY PANEL (Top Briefing)                           */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-[#2563EB]/20 bg-gradient-to-r from-[#F0F7FF] via-[#F8FAFC] to-[#F0FDF4] p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB]">
              <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" />
              <span>EXECUTIVE BRIEFING</span>
            </div>
            <p className="text-sm font-semibold text-[#111827] leading-relaxed">
              &ldquo;Current supply chain health remains stable (94.2%). Two suppliers require attention due to increased lead-time variance. MacBook Pro inventory requires replenishment within 48 hours to avoid stockout.&rdquo;
            </p>
            <div className="text-[11px] text-[#6B7280] pt-0.5">
              Synthesized from active inventory velocity, shipment GPS logs, and supplier scorecard histories.
            </div>
          </div>
          <Link
            href="/executive"
            className="h-8 px-3 rounded-lg bg-white border border-[#E5E7EB] text-xs font-semibold text-[#111827] hover:bg-[#F9FAFB] shrink-0 flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <span>Open Briefing Center</span>
            <ArrowRight className="h-3 w-3 text-[#6B7280]" />
          </Link>
        </section>

        {/* ========================================================================= */}
        {/* WIDGETS 6 & 7: HEALTH SCORES & CORE KPIs                                  */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Widget 6: Inventory Health Score */}
          <div className="rounded-2xl border border-[#16A34A]/25 bg-white p-4 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#16A34A]">
              <span className="font-semibold">Inventory Health</span>
              <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#111827]">{summary?.forecast_accuracy_pct ?? 98.4}%</div>
            <div className="text-[11px] text-[#16A34A] font-semibold flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> Optimal buffer coverage
            </div>
            <div className="text-[10px] text-[#6B7280]">1 SKU at critical threshold</div>
          </div>

          {/* Widget 7: Supply Chain Health Score */}
          <div className="rounded-2xl border border-[#2563EB]/25 bg-white p-4 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#2563EB]">
              <span className="font-semibold">Supply Chain Health</span>
              <PieChart className="h-4 w-4 text-[#2563EB]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#111827]">{summary?.avg_warehouse_utilization_pct ?? 94.2}%</div>
            <div className="text-[11px] text-[#2563EB] font-semibold flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> Stable network resilience
            </div>
            <div className="text-[10px] text-[#6B7280]">88.5% on-time fulfillment</div>
          </div>

          {/* Active Inventory Valuation */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span className="font-semibold">Monitored Inventory</span>
              <Boxes className="h-4 w-4 text-[#9CA3AF]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#111827]">₹{summary ? Number(summary.total_inventory_value).toLocaleString('en-IN') : '14,250,890.50'}</div>
            <div className="text-[11px] text-[#16A34A] font-semibold flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> 5 core categories active
            </div>
            <div className="text-[10px] text-[#6B7280]">2,500 total active units across 5 hubs</div>
          </div>

          {/* Open Purchase Orders */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span className="font-semibold">Active POs in Pipeline</span>
              <Truck className="h-4 w-4 text-[#9CA3AF]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#111827]">{summary?.open_purchase_orders_count ?? 12} Orders</div>
            <div className="text-[11px] text-[#D97706] font-semibold flex items-center">
              <AlertTriangle className="h-3 w-3 mr-0.5" /> 1 shipment with lead-time drift
            </div>
            <div className="text-[10px] text-[#6B7280]">₹3,71,760 committed capital</div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* WIDGET 1: CRITICAL RISK ALERTS & WIDGET 3: SHIPMENT DISRUPTIONS           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Widget 1: Critical Risk Alerts */}
          <div className="rounded-2xl border border-[#DC2626]/30 bg-[#FEF2F2]/20 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#DC2626]/15 pb-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
                <h2 className="text-sm font-bold text-[#111827]">Critical Risk Alerts</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-[#DC2626] text-white px-2 py-0.2 rounded">
                  P0 IMMEDIATE
                </span>
                <Link
                  href="/notifications"
                  className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              {/* Alert 1 */}
              <div className="p-3.5 rounded-xl border border-[#DC2626]/20 bg-white space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#DC2626] font-mono">STOCKOUT IMMINENT</span>
                  <span className="text-[#6B7280] font-mono text-[11px]">6 Days Remaining</span>
                </div>
                <p className="text-xs text-[#111827] font-semibold leading-relaxed">
                  MacBook Pro inventory expected to stock out within 6 days.
                </p>
                <div className="text-[11px] text-[#4B5563]">
                  Current Stock: <strong className="text-[#111827]">12 units</strong> · Safety Buffer: <strong className="text-[#111827]">20 units</strong>
                </div>
                <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between">
                  <Link href="/inventory/sku-mbp16" className="text-[11px] font-semibold text-[#6B7280] hover:text-[#111827]">
                    Inspect Telemetry
                  </Link>
                  {isDrafted("mbp16") ? (
                    <span className="text-xs font-semibold text-[#16A34A] flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> PO-8921 Created (80 Units)
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDraftPO("mbp16")}
                      className="h-7 px-2.5 rounded-lg bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Zap className="h-3 w-3" />
                      <span>Create Purchase Order (80 Units)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Alert 2 */}
              <div className="p-3.5 rounded-xl border border-[#F59E0B]/20 bg-white space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#D97706] font-mono">BUFFER BREACH WATCH</span>
                  <span className="text-[#6B7280] font-mono text-[11px]">5 Days Remaining</span>
                </div>
                <p className="text-xs text-[#111827] font-semibold leading-relaxed">
                  Enterprise Tensor Core GPU buffer reduced below minimum threshold.
                </p>
                <div className="text-[11px] text-[#4B5563]">
                  Current Stock: <strong className="text-[#111827]">6 units</strong> · Safety Stock: <strong className="text-[#111827]">10 units</strong>
                </div>
                <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between">
                  <Link href="/inventory/sku-nv-a100" className="text-[11px] font-semibold text-[#6B7280] hover:text-[#111827]">
                    View Details
                  </Link>
                  <Link
                    href="/purchase-orders"
                    className="text-[11px] font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
                  >
                    <span>View Inbound PO-8799</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 3: Shipment Disruption Alerts */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#D97706]" />
                <h2 className="text-sm font-bold text-[#111827]">Shipment Disruption Alerts</h2>
              </div>
              <Link href="/shipments" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
                <span>All Shipments</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {(delayedShipments && delayedShipments.length > 0 ? delayedShipments : [
                {
                  id: "sh-1",
                  purchase_order_id: "PO-8890",
                  carrier: "DHL Express",
                  current_status: "DELAYED",
                  current_location: "Surat Inbound Hub",
                  delay_days: 5,
                  delay_reason: "Supplier QA verification backlog at facility.",
                  expected_arrival: "2026-08-25",
                }
              ]).slice(0, 2).map((sh) => (
                <div key={sh.id} className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#111827]">{sh.purchase_order_id || sh.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        sh.current_status === "DELAYED"
                          ? "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20"
                          : "bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20"
                      }`}
                    >
                      {sh.current_status}
                    </span>
                  </div>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    {sh.delay_reason || `Shipment via ${sh.carrier || "Carrier"} located at ${sh.current_location || "Transit Hub"}.`}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-[#6B7280] pt-1">
                    <span>Carrier: <strong className="text-[#111827]">{sh.carrier || "DHL Express"}</strong></span>
                    <span>ETA: <strong className={sh.current_status === "DELAYED" ? "text-[#DC2626]" : "text-[#111827]"}>{sh.expected_arrival ? String(sh.expected_arrival) : "2026-08-25"}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* WIDGET 2: RECOMMENDED REORDERS & WIDGET 4: SUPPLIER RISK ALERTS           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Widget 2: Recommended Reorders */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-[#2563EB]" />
                <h2 className="text-sm font-bold text-[#111827]">Recommended Reorders</h2>
              </div>
              <Link href="/inventory" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
                <span>Inventory Ledger</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {(lowStockItems && lowStockItems.length > 0 ? lowStockItems : [
                {
                  id: "sku-mbp16",
                  sku: "SKU-MBP16",
                  product_name: "MacBook Pro 16\" (M3 Max)",
                  stock_status: "CRITICAL",
                  quantity_on_hand: 12,
                  available_quantity: 8,
                  reserved_quantity: 4,
                },
                {
                  id: "sku-nv-a100",
                  sku: "SKU-NV-A100",
                  product_name: "Enterprise Tensor Core GPU A100",
                  stock_status: "LOW_STOCK",
                  quantity_on_hand: 6,
                  available_quantity: 5,
                  reserved_quantity: 1,
                },
              ]).slice(0, 2).map((sku) => (
                <div key={sku.id} className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-[#2563EB]">{sku.sku || sku.id}</span>
                      <span className="ml-2 font-semibold text-[#111827]">{sku.product_name || "SKU Item"}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      sku.stock_status === "CRITICAL"
                        ? "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20"
                        : "bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/20"
                    }`}>
                      {sku.stock_status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-[#4B5563] pt-1">
                    <div>On Hand: <strong className="text-[#111827]">{sku.quantity_on_hand} ea</strong></div>
                    <div>Available: <strong className="text-[#111827]">{sku.available_quantity} ea</strong></div>
                    <div>Reserved: <strong className="text-[#111827]">{sku.reserved_quantity} ea</strong></div>
                  </div>
                  <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                    <span className="text-[#6B7280]">
                      Status: <strong className="text-[#111827]">{sku.stock_status}</strong>
                    </span>
                    <Link
                      href="/inventory/reorder"
                      className="px-2.5 py-1 rounded bg-[#111827] text-white text-[11px] font-semibold hover:bg-black transition-colors"
                    >
                      Reorder SKU
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 4: Supplier Risk Alerts */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[#D97706]" />
                <h2 className="text-sm font-bold text-[#111827]">Supplier Risk Alerts</h2>
              </div>
              <Link href="/suppliers" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
                <span>Supplier Directory</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {/* Supplier Alert 1 */}
              <div className="p-3.5 rounded-xl border border-[#DC2626]/20 bg-[#FEF2F2]/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#111827]">ABC Electronics</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FEF2F2] text-[#DC2626]">
                    RELIABILITY DROPPED 18%
                  </span>
                </div>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  ABC Electronics delivery reliability dropped 18% during the last 60 days. Lead time expanded +5.2 days on PO-8890.
                </p>
                <div className="text-[11px] text-[#2563EB] font-medium">
                  Recommended Action: Shift networking allocations to Kyoto Micro Tech.
                </div>
                <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between">
                  <Link href="/suppliers/sup-abc" className="text-[11px] font-semibold text-[#6B7280] hover:text-[#111827]">
                    View Supplier Scorecard
                  </Link>
                  {supplierContacted ? (
                    <span className="text-xs font-semibold text-[#16A34A] flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Inquiry Sent
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSupplierContacted(true);
                        alert("Inquiry dispatched to ABC Electronics procurement desk.");
                      }}
                      className="h-7 px-2.5 rounded-lg bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Mail className="h-3 w-3" />
                      <span>Contact Supplier</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Supplier Alert 2: Healthy Spotlight */}
              <div className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#111827]">Nordic Extrusions</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F0FDF4] text-[#16A34A]">
                    99.2% OTIF (EXEMPLARY)
                  </span>
                </div>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  Consistently delivering ahead of schedule. Zero defect non-conformances across last 12 PO batches.
                </p>
                <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                  <span className="text-[#6B7280]">Active Spend: <strong className="text-[#111827]">₹3,40,000</strong></span>
                  <Link href="/suppliers/sup-nordic" className="font-semibold text-[#2563EB] hover:underline">
                    View Profile →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* WIDGET: MULTI-WAREHOUSE NETWORK CAPACITY & TELEMETRICS                    */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-[#2563EB]" />
                <h2 className="text-base font-bold text-[#111827]">Multi-Depot Distribution Network</h2>
                <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2 py-0.5 rounded-full">
                  {warehouseUtils?.length ?? 5} REGIONAL HUBS
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Live spatial capacity utilization across regional fulfillment hubs (Total Network: {networkCapacity?.total_network_capacity?.toLocaleString() ?? "175,171"} units, Avg Utilization: {networkCapacity?.avg_utilization_pct ?? "65.0"}%).
              </p>
            </div>
            <Link href="/inventory" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1 shrink-0">
              <span>View All Inventory</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {(warehouseUtils || [
              { warehouse_id: "1", name: "Ahmedabad Hub", warehouse_code: "WH-AHM", capacity: 27467, used_units: 11192, utilization_percentage: 40.75, status: "OPTIMAL" as const },
              { warehouse_id: "2", name: "Mumbai Hub", warehouse_code: "WH-MUM", capacity: 33173, used_units: 29504, utilization_percentage: 88.94, status: "NEAR_CAPACITY" as const },
              { warehouse_id: "3", name: "Delhi Depot", warehouse_code: "WH-DEL", capacity: 46401, used_units: 41788, utilization_percentage: 90.06, status: "NEAR_CAPACITY" as const },
              { warehouse_id: "4", name: "Surat Central", warehouse_code: "WH-SUR", capacity: 44398, used_units: 20818, utilization_percentage: 46.89, status: "OPTIMAL" as const },
              { warehouse_id: "5", name: "Bangalore Hub", warehouse_code: "WH-BAN", capacity: 23732, used_units: 15126, utilization_percentage: 63.74, status: "OPTIMAL" as const },
            ]).map((wh) => {
              const util = Number(wh.utilization_percentage) || 50;
              const isHigh = util > 85;
              const isOptimal = util >= 40 && util <= 85;

              return (
                <div
                  key={wh.warehouse_id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isHigh
                      ? "border-[#DC2626]/25 bg-[#FEF2F2]/10"
                      : isOptimal
                      ? "border-[#E5E7EB] bg-[#FAFAFA]"
                      : "border-[#F59E0B]/20 bg-[#FFFBEB]/10"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#2563EB] text-[11px]">{wh.warehouse_code}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        isHigh
                          ? "bg-[#FEF2F2] text-[#DC2626]"
                          : isOptimal
                          ? "bg-[#F0FDF4] text-[#16A34A]"
                          : "bg-[#FFFBEB] text-[#D97706]"
                      }`}
                    >
                      {util.toFixed(1)}%
                    </span>
                  </div>

                  <div className="font-bold text-xs text-[#111827] mt-1 truncate">{wh.name}</div>

                  <div className="w-full bg-[#E5E7EB] rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        isHigh ? "bg-[#DC2626]" : isOptimal ? "bg-[#16A34A]" : "bg-[#F59E0B]"
                      }`}
                      style={{ width: `${Math.min(100, util)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#6B7280] mt-2 pt-2 border-t border-[#E5E7EB]/60">
                    <span>Used: {wh.used_units?.toLocaleString()}</span>
                    <span>Cap: {wh.capacity?.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* WIDGET 5: FORECAST ANOMALIES & SURGE INTELLIGENCE                         */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#2563EB]" />
                <h2 className="text-base font-bold text-[#111827]">Forecast Anomalies & Demand Signals</h2>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Statistical anomalies detected against 90-day baseline consumption trends.
              </p>
            </div>
            <Link href="/forecasting" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
              <span>Detailed Forecasts</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#F59E0B]/30 bg-[#FFFBEB]/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#D97706] font-mono bg-white px-2 py-0.5 rounded border border-[#F59E0B]/20">
                  DEMAND SPIKE: +22% NEXT MONTH
                </span>
                <span className="font-mono text-xs font-bold text-[#2563EB]">94.5% Confidence</span>
              </div>
              <h3 className="text-sm font-bold text-[#111827]">Networking Devices & PoE+ Switches</h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Demand spike expected next week for networking devices driven by enterprise campus rollouts. Recommend forward buffer expansion of 20 units.
              </p>
              <div className="pt-2 border-t border-[#F59E0B]/20 flex items-center justify-between text-xs">
                <span className="text-[#6B7280]">Suggested Buffer Adjustment: <strong className="text-[#111827]">+15% ROP</strong></span>
                <Link href="/forecasting" className="font-semibold text-[#111827] hover:text-[#2563EB]">
                  Apply Buffer →
                </Link>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#16A34A] font-mono bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">
                  ACCELERATOR DEMAND: +18%
                </span>
                <span className="font-mono text-xs font-bold text-[#16A34A]">96.1% Confidence</span>
              </div>
              <h3 className="text-sm font-bold text-[#111827]">Enterprise Tensor Core GPUs</h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                AI cluster buildout pipelines require sustained GPU allocation. Lead times are 21 days from Kyoto Micro Tech.
              </p>
              <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                <span className="text-[#6B7280]">Pipeline Allocation: <strong className="text-[#111827]">15 units inbound</strong></span>
                <Link href="/purchase-orders" className="font-semibold text-[#2563EB] hover:underline">
                  View Inbound PO →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
