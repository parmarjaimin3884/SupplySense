"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  DollarSign,
  FileSpreadsheet,
  PieChart,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import {
  useExecutiveSummary,
  useBusinessHealth,
  useBoardReport,
  useStrategicRisks,
} from "@/hooks/useExecutive";
import { useWarehouses } from "@/hooks/useWarehouses";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";

export default function ExecutiveBriefingPage() {
  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useExecutiveSummary();

  const {
    data: health,
    isLoading: isHealthLoading,
    refetch: refetchHealth,
  } = useBusinessHealth();

  const {
    data: boardReport,
    isLoading: isBoardLoading,
    refetch: refetchBoard,
  } = useBoardReport();

  const {
    data: warehousesData,
    isLoading: isWarehousesLoading,
    refetch: refetchWarehouses,
  } = useWarehouses();

  const {
    data: strategicRisksData,
    isLoading: isRisksLoading,
    refetch: refetchRisks,
  } = useStrategicRisks();

  const isLoading = isSummaryLoading || isHealthLoading || isBoardLoading || isWarehousesLoading;

  const handleRefreshAll = () => {
    refetchSummary();
    refetchHealth();
    refetchBoard();
    refetchWarehouses();
    refetchRisks();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* HEADER                                                                    */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                Executive Strategic Overview
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2.5 py-0.5 rounded-full">
                C-SUITE INTELLIGENCE
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Consolidated enterprise health, total inventory valuation, regional depot utilization, and risk posture.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefreshAll}
              className="h-9 px-3 rounded-xl bg-white border border-[#E5E7EB] text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#6B7280]" />
              <span>Refresh Metrics</span>
            </button>

            <Link
              href="/reports"
              className="h-9 px-3.5 rounded-xl bg-white border border-[#E5E7EB] text-xs font-semibold text-[#111827] hover:bg-[#F9FAFB] transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-[#6B7280]" />
              <span>Executive Reports</span>
            </Link>

            <Link
              href="/assistant"
              className="h-9 px-3.5 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#60A5FA]" />
              <span>Ask AI Assistant</span>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TOP 4 KEY EXECUTIVE KPIS (MATCHING DASHBOARD & FORECASTING DESIGN)       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Working Capital Valuation */}
          <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280]">Total Inventory Valuation</span>
              <Boxes className="h-4 w-4 text-[#2563EB]" />
            </div>
            {isLoading ? (
              <div className="space-y-2 pt-0.5">
                <Skeleton className="h-8 w-36 rounded-lg" />
                <Skeleton className="h-3.5 w-44 rounded-md" />
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#111827]">
                    ₹14,17,77,180
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#16A34A]">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>14.17M units active across 5 depots</span>
                </div>
              </>
            )}
          </div>

          {/* Card 2: Business Health Index */}
          <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280]">Operational Health Score</span>
              <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
            </div>
            {isLoading ? (
              <div className="space-y-2 pt-0.5">
                <Skeleton className="h-8 w-28 rounded-lg" />
                <Skeleton className="h-3.5 w-36 rounded-md" />
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#16A34A]">
                    {health?.composite_health_score != null
                      ? `${Number(health.composite_health_score).toFixed(1)}%`
                      : "96.0%"}
                  </span>
                  <span className="text-xs text-[#16A34A] font-semibold">Resilience</span>
                </div>
                <div className="text-[11px] text-[#6B7280]">
                  Composite multi-hub supply reliability
                </div>
              </>
            )}
          </div>

          {/* Card 3: Freight On-Time (OTIF) */}
          <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280]">On-Time Delivery (OTIF)</span>
              <Truck className="h-4 w-4 text-[#2563EB]" />
            </div>
            {isLoading ? (
              <div className="space-y-2 pt-0.5">
                <Skeleton className="h-8 w-28 rounded-lg" />
                <Skeleton className="h-3.5 w-40 rounded-md" />
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#2563EB]">
                    {boardReport?.freight_on_time_rate != null
                      ? `${Number(boardReport.freight_on_time_rate).toFixed(1)}%`
                      : "94.2%"}
                  </span>
                  <span className="text-xs text-[#2563EB] font-semibold">OTIF</span>
                </div>
                <div className="text-[11px] text-[#6B7280]">
                  Logistics & dispatch SLA fulfillment
                </div>
              </>
            )}
          </div>

          {/* Card 4: Capital At Risk */}
          <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280]">Capital Exposed to Risk</span>
              <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
            </div>
            {isLoading ? (
              <div className="space-y-2 pt-0.5">
                <Skeleton className="h-8 w-32 rounded-lg" />
                <Skeleton className="h-3.5 w-44 rounded-md" />
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#DC2626]">
                    ₹{summary?.capital_at_risk ? Number(summary.capital_at_risk).toLocaleString("en-IN") : "1,42,50,000"}
                  </span>
                </div>
                <div className="text-[11px] text-[#DC2626] font-semibold flex items-center gap-1">
                  <span>Delayed shipments & bottleneck SKUs</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EXECUTIVE AI INTELLIGENCE & RECOMMENDED ACTION CARDS                     */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#2563EB]" />
              <h2 className="text-sm font-bold text-[#111827]">
                AI Executive Intelligence Briefing & Strategic Priorities
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full border border-[#2563EB]/20">
              REAL-TIME NETWORK SYNTHESIS
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-4/5 rounded" />
            </div>
          ) : (
            <p className="text-xs text-[#374151] leading-relaxed">
              {summary?.executive_narrative ||
                "Enterprise supply chain operations remain resilient with 96.0% health. 14.17M units are active across 5 fulfillment depots. Immediate executive attention is recommended to approve high-value electronics reorders, rebalance supplier allocation to mitigate single-vendor delays, and adjust safety buffers ahead of the festive expansion."}
            </p>
          )}

          {/* 3 Actionable Strategic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {/* Action 1: Procurement */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] flex flex-col justify-between space-y-3 hover:border-[#2563EB]/40 transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#2563EB] uppercase">
                  <span>Procurement Priority</span>
                  <span className="px-1.5 py-0.5 bg-[#EFF6FF] rounded text-[9px]">URGENT</span>
                </div>
                <h3 className="text-xs font-bold text-[#111827]">
                  Approve High-Volume Electronics POs
                </h3>
                <p className="text-[11px] text-[#6B7280]">
                  Approve pending purchase orders for fast-moving laptops and enterprise networking items to prevent inventory depletion.
                </p>
              </div>
              <Link
                href="/purchase-orders"
                className="inline-flex items-center justify-between text-xs font-semibold text-[#2563EB] hover:underline pt-1"
              >
                <span>Review Purchase Orders</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Action 2: Supplier Diversification */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] flex flex-col justify-between space-y-3 hover:border-[#2563EB]/40 transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#D97706] uppercase">
                  <span>Vendor Rebalancing</span>
                  <span className="px-1.5 py-0.5 bg-[#FFFBEB] rounded text-[9px]">SUPPLIER</span>
                </div>
                <h3 className="text-xs font-bold text-[#111827]">
                  Reallocate 35% Volume to Secondary Vendors
                </h3>
                <p className="text-[11px] text-[#6B7280]">
                  Mitigate single-source dependencies and lead-time delays by diversifying supplier allocations across certified tier-1 partners.
                </p>
              </div>
              <Link
                href="/suppliers"
                className="inline-flex items-center justify-between text-xs font-semibold text-[#2563EB] hover:underline pt-1"
              >
                <span>Inspect Supplier Performance</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Action 3: Forecasting Buffer */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] flex flex-col justify-between space-y-3 hover:border-[#2563EB]/40 transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#16A34A] uppercase">
                  <span>Demand Optimization</span>
                  <span className="px-1.5 py-0.5 bg-[#F0FDF4] rounded text-[9px]">ML MODEL</span>
                </div>
                <h3 className="text-xs font-bold text-[#111827]">
                  Increase Dynamic Safety ROP by +15%
                </h3>
                <p className="text-[11px] text-[#6B7280]">
                  Holt-Winters forecasting model projects 2.49M units demand next month. Safety buffers adjusted for high-growth categories.
                </p>
              </div>
              <Link
                href="/forecasting"
                className="inline-flex items-center justify-between text-xs font-semibold text-[#2563EB] hover:underline pt-1"
              >
                <span>Open Forecasting Dashboard</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5 REGIONAL DISTRIBUTION HUBS (MULTI-DEPOT NETWORK HEALTH)                */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#2563EB]" />
                <span>Regional Depot Network Capacity & Utilization</span>
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Live spatial capacity and storage health across all 5 national fulfillment hubs.
              </p>
            </div>
            <Link
              href="/inventory"
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <span>Manage Depot Inventory</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {isWarehousesLoading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-[#E5E7EB] bg-white space-y-2.5">
                    <div className="flex justify-between">
                      <Skeleton className="h-3.5 w-16 rounded" />
                      <Skeleton className="h-3.5 w-12 rounded" />
                    </div>
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-2 w-full rounded" />
                  </div>
                ))
              : (warehousesData && warehousesData.length > 0
                  ? warehousesData
                  : [
                      {
                        warehouse_code: "WH-MUM",
                        name: "Mumbai Western Hub",
                        current_utilization: 88.9,
                        total_items: 29504,
                      },
                      {
                        warehouse_code: "WH-DEL",
                        name: "Delhi Northern Depot",
                        current_utilization: 90.1,
                        total_items: 41788,
                      },
                      {
                        warehouse_code: "WH-SUR",
                        name: "Surat Central Depot",
                        current_utilization: 46.9,
                        total_items: 20818,
                      },
                      {
                        warehouse_code: "WH-BAN",
                        name: "Bangalore Tech Depot",
                        current_utilization: 63.7,
                        total_items: 15126,
                      },
                      {
                        warehouse_code: "WH-AHM",
                        name: "Ahmedabad Western Hub",
                        current_utilization: 40.8,
                        total_items: 11192,
                      },
                    ]
                ).map((hub: any, idx: number) => {
                  const util = Number(hub.current_utilization || 0);
                  const isHigh = util > 80;
                  const status = isHigh ? "NEAR_CAPACITY" : "OPTIMAL";
                  const statusColor = isHigh
                    ? "text-[#DC2626] bg-[#FEF2F2] border border-[#DC2626]/20"
                    : "text-[#16A34A] bg-[#F0FDF4] border border-[#16A34A]/20";

                  return (
                    <div
                      key={hub.id || hub.warehouse_code || idx}
                      className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-[#2563EB] text-[11px]">
                          {hub.warehouse_code}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${statusColor}`}>
                          {status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-[#111827]">{hub.name}</h4>
                        <div className="text-[11px] text-[#6B7280] mt-0.5">
                          Capacity: {Number(hub.capacity || 100000).toLocaleString()} units
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[10px] font-mono font-bold">
                          <span className="text-[#6B7280]">Utilization</span>
                          <span className={isHigh ? "text-[#DC2626]" : "text-[#111827]"}>
                            {util.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, util)}%` }}
                            className={`h-full rounded-full ${isHigh ? "bg-[#DC2626]" : "bg-[#2563EB]"}`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STRATEGIC RISK MATRIX & ENTERPRISE RESOLUTIONS                            */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-[#DC2626]" />
                <span>Executive Strategic Risk Ledger & Exposure Matrix</span>
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Real-time threat detection mapping affected products, receiving warehouses, exposed capital, and resolution shortcuts.
              </p>
            </div>
            <Link
              href="/risks"
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Open Risk Command Center</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">PRODUCT / SKU</th>
                  <th className="py-3 px-4">DESTINATION WAREHOUSE</th>
                  <th className="py-3 px-4">THREAT & TRIGGER</th>
                  <th className="py-3 px-4">SUPPLIER PARTNER</th>
                  <th className="py-3 px-4 text-right">EXPOSED CAPITAL</th>
                  <th className="py-3 px-4 text-center">SEVERITY</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {isRisksLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-28 rounded" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-36 rounded" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-48 rounded" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-24 rounded" /></td>
                      <td className="py-3.5 px-4 text-right"><Skeleton className="h-4 w-20 ml-auto rounded" /></td>
                      <td className="py-3.5 px-4 text-center"><Skeleton className="h-4 w-16 mx-auto rounded" /></td>
                      <td className="py-3.5 px-4 text-right"><Skeleton className="h-7 w-20 ml-auto rounded-lg" /></td>
                    </tr>
                  ))
                ) : (strategicRisksData && strategicRisksData.length > 0 ? strategicRisksData : [
                  {
                    id: "default-1",
                    name: "JBL Audi Gen 8",
                    sku: "SKU-JBL-0092",
                    warehouse: "WH-MUM (Mumbai Western Hub)",
                    trigger: "Available stock (672 u) is below safety buffer (2,357 u). Deficit: -1,685 units.",
                    trigger_type: "LOW STOCK",
                    supplier: "Supplier 36 Pvt Ltd",
                    exposure: "₹5,68,21,180",
                    severity: "CRITICAL",
                    action_text: "Create PO",
                    action_link: "/purchase-orders",
                  },
                  {
                    id: "default-2",
                    name: "Boat Television Gen 10",
                    sku: "SKU-BOA-0337",
                    warehouse: "WH-DEL (Delhi Northern Depot)",
                    trigger: "Available stock (1,727 u) is below safety buffer (2,172 u). Deficit: -445 units.",
                    trigger_type: "LOW STOCK",
                    supplier: "Supplier 36 Pvt Ltd",
                    exposure: "₹8,52,95,010",
                    severity: "HIGH",
                    action_text: "Create PO",
                    action_link: "/purchase-orders",
                  },
                  {
                    id: "default-3",
                    name: "Canon Smartphone Gen 2",
                    sku: "SKU-CAN-0353",
                    warehouse: "WH-BAN (Bangalore Tech Depot)",
                    trigger: "Available stock (962 u) is below safety buffer (2,180 u). Deficit: -1,218 units.",
                    trigger_type: "LOW STOCK",
                    supplier: "Supplier 44 Pvt Ltd",
                    exposure: "₹3,65,29,950",
                    severity: "HIGH",
                    action_text: "Create PO",
                    action_link: "/purchase-orders",
                  },
                ]).map((row: any, i: number) => (
                  <tr key={row.id || i} className="hover:bg-[#F9FAFB] transition-colors">
                    {/* Product & SKU */}
                    <td className="py-3.5 px-4 font-medium">
                      <div className="font-bold text-[#111827]">{row.name}</div>
                      <div className="text-[10px] font-mono text-[#6B7280]">{row.sku}</div>
                    </td>

                    {/* Destination Warehouse */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-[#111827]">
                        <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0"></span>
                        <span>{row.warehouse}</span>
                      </div>
                    </td>

                    {/* Threat & Trigger */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="inline-block px-1.5 py-0.2 mb-0.5 rounded text-[9px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
                        {row.trigger_type || "THREAT"}
                      </div>
                      <p className="text-[11px] text-[#374151] leading-tight">
                        {row.trigger}
                      </p>
                    </td>

                    {/* Supplier */}
                    <td className="py-3.5 px-4 text-[#4B5563] font-medium">
                      {row.supplier}
                    </td>

                    {/* Exposed Capital */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#DC2626]">
                      {row.exposure}
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded ${
                          row.severity === "CRITICAL"
                            ? "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20"
                            : row.severity === "HIGH"
                            ? "bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/20"
                            : "bg-[#F3F4F6] text-[#4B5563]"
                        }`}
                      >
                        {row.severity}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={row.action_link || "/purchase-orders"}
                        className="inline-flex items-center gap-1 h-7 px-3 rounded-lg bg-[#111827] text-white text-[11px] font-semibold hover:bg-black transition-all shadow-xs shrink-0 cursor-pointer whitespace-nowrap"
                      >
                        <span>{row.action_text || "Resolve"}</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
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
