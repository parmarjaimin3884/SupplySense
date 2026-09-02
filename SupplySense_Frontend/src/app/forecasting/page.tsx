"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Calendar,
  CheckCircle2,
  ChevronRight,
  LineChart,
  RefreshCw,
  Search,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useForecasts, useForecastSummary } from "@/hooks/useForecast";
import { useDemandAnomalies } from "@/hooks/useRisks";
import { TableRowSkeleton, Skeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import type { DemandForecast } from "@/types/forecast";

export default function DynamicForecastingPage() {
  // Simple horizon: 30 days, 60 days, 90 days
  const [horizon, setHorizon] = useState<"30D" | "60D" | "90D">("30D");
  const [selectedSku, setSelectedSku] = useState<string>("ALL");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Live Database Queries
  const {
    data: rawForecasts,
    isLoading: isForecastsLoading,
    error: forecastError,
    refetch: refetchForecasts,
  } = useForecasts({
    warehouse_id: selectedWarehouse !== "ALL" ? selectedWarehouse : undefined,
    category_id: selectedCategory !== "ALL" ? selectedCategory : undefined,
    search: searchQuery ? searchQuery : undefined,
    limit: 150,
  });

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useForecastSummary({
    warehouse_id: selectedWarehouse !== "ALL" ? selectedWarehouse : undefined,
    product_id: selectedSku !== "ALL" ? selectedSku : undefined,
  });

  const forecasts: DemandForecast[] = useMemo(() => {
    return rawForecasts || [];
  }, [rawForecasts]);

  // Deduplicated list of products for dropdown selector to guarantee unique React keys
  const uniqueProducts = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; name: string; sku: string }[] = [];
    for (const f of forecasts) {
      if (f.product_id && !seen.has(f.product_id)) {
        seen.add(f.product_id);
        list.push({ id: f.product_id, name: f.product_name, sku: f.sku });
      }
    }
    return list;
  }, [forecasts]);

  // Selected product name for chart title
  const activeProduct = useMemo(() => {
    if (selectedSku === "ALL") return null;
    return forecasts.find((f) => f.product_id === selectedSku || f.sku === selectedSku) || null;
  }, [selectedSku, forecasts]);

  // Monthly points from live database summary, filtered by selected horizon
  const monthlyDisplayPoints = useMemo(() => {
    const allPoints = summaryData?.monthly_comparison || [];
    if (allPoints.length === 0) {
      // Fallback while loading
      return [];
    }

    if (horizon === "30D") {
      return allPoints.slice(0, 4); // Jan, Feb, Mar, Apr
    } else if (horizon === "60D") {
      return allPoints.slice(0, 5); // Jan, Feb, Mar, Apr, May
    } else {
      return allPoints.slice(0, 6); // Jan, Feb, Mar, Apr, May, Jun
    }
  }, [summaryData, horizon]);

  // Max value for chart bar normalization
  const maxMonthlyVal = useMemo(() => {
    if (monthlyDisplayPoints.length === 0) return 50000;
    const maxDemand = Math.max(...monthlyDisplayPoints.map((p) => p.demand));
    const maxStock = Math.max(...monthlyDisplayPoints.map((p) => p.stock));
    return Math.max(maxDemand, maxStock, 1000) * 1.15;
  }, [monthlyDisplayPoints]);

  const handleRefreshAll = () => {
    refetchForecasts();
    refetchSummary();
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
                Demand & Sales Forecasting
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20 px-2.5 py-0.5 rounded-full">
                LIVE DATABASE SYNC
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Dynamic multi-warehouse demand projections, customer sales velocity, and inventory shortfall alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefreshAll}
              className="h-9 px-3 rounded-xl bg-white border border-[#E5E7EB] text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#6B7280]" />
              <span>Refresh Forecast</span>
            </button>

            <Link
              href="/purchase-orders"
              className="h-9 px-3.5 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Create Purchase Order</span>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DYNAMIC BUSINESS CARDS (CALCULATED FROM LIVE DATABASE)                   */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Expected Sales Next 30 Days */}
          <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs space-y-2">
            <span className="text-xs font-semibold text-[#6B7280]">
              Expected Sales (Next 30 Days)
            </span>
            {isSummaryLoading || !summaryData ? (
              <div className="space-y-2 pt-0.5">
                <Skeleton className="h-8 w-36 rounded-lg" />
                <Skeleton className="h-3.5 w-48 rounded-md" />
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-[#111827]">
                    {summaryData.total_expected_sales_30d.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#6B7280]">Units</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#16A34A]">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>+{summaryData.growth_rate_pct}% expected demand growth</span>
                </div>
              </>
            )}
          </div>

          {/* Card 2: Total Available Inventory in Network */}
          <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs space-y-2">
            <span className="text-xs font-semibold text-[#6B7280]">
              Total Available Stock
            </span>
            {isSummaryLoading || !summaryData ? (
              <div className="space-y-2 pt-0.5">
                <Skeleton className="h-8 w-44 rounded-lg" />
                <Skeleton className="h-3.5 w-40 rounded-md" />
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-[#2563EB]">
                    {summaryData.total_available_stock.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#6B7280]">Units in Network</span>
                </div>
                <div className="text-[11px] text-[#6B7280]">
                  Top Growth: <strong className="text-[#111827]">{summaryData.fastest_growing_category ?? "Laptops & Networking"}</strong>
                </div>
              </>
            )}
          </div>

          {/* Card 3: Reorder Recommendation */}
          <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs space-y-2">
            <span className="text-xs font-semibold text-[#6B7280]">
              Reorder Action Needed
            </span>
            {isSummaryLoading || !summaryData ? (
              <div className="space-y-2 pt-0.5">
                <Skeleton className="h-8 w-28 rounded-lg" />
                <Skeleton className="h-3.5 w-52 rounded-md" />
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-[#DC2626]">
                    {summaryData.reorder_needed_count}
                  </span>
                  <span className="text-xs text-[#DC2626] font-semibold">SKUs near or below ROP</span>
                </div>
                <div className="text-[11px] text-[#6B7280]">
                  Place POs or initiate transfers to avoid stockouts
                </div>
              </>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DYNAMIC MONTHLY DEMAND VS STOCK BAR CHART                                 */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <Boxes className="h-4 w-4 text-[#2563EB]" />
                <span>Monthly Customer Demand vs. Available Warehouse Stock</span>
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {activeProduct
                  ? `Live database demand vs stock for ${activeProduct.product_name} (${activeProduct.sku})`
                  : `Live network demand vs stock across ${selectedWarehouse === "ALL" ? "all 5 warehouses" : selectedWarehouse}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Product Selector */}
              <select
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="h-8 px-2.5 text-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg font-semibold text-[#111827] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Products (Combined)</option>
                {uniqueProducts.slice(0, 50).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.name}
                  </option>
                ))}
              </select>

              {/* Horizon Filter */}
              <div className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-lg">
                {[
                  { id: "30D", label: "Next 30 Days" },
                  { id: "60D", label: "Next 60 Days" },
                  { id: "90D", label: "Next 90 Days" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setHorizon(tab.id as any)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                      horizon === tab.id
                        ? "bg-[#111827] text-white shadow-xs"
                        : "text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Monthly Bars Comparison */}
          <div className="bg-[#FAFAFA] rounded-xl border border-[#E5E7EB] p-5 space-y-4">
            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 font-semibold text-[#1E3A8A]">
                  <span className="w-3 h-3 bg-[#2563EB] rounded-xs"></span>
                  <span>Expected Customer Demand (Units)</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-[#065F46]">
                  <span className="w-3 h-3 bg-[#10B981] rounded-xs"></span>
                  <span>Available Inventory in Depot</span>
                </div>
              </div>

              <div className="text-[11px] text-[#6B7280]">
                💡 <em>If blue demand bar is higher than green stock bar, order more inventory.</em>
              </div>
            </div>

            {/* Dynamic Monthly Bar Columns Grid */}
            {isSummaryLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-[#E5E7EB] bg-white space-y-3">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-3.5 w-16 rounded" />
                      <Skeleton className="h-3 w-10 rounded" />
                    </div>
                    <div className="h-28 flex items-end justify-center gap-2 pt-2 border-b border-[#F3F4F6] pb-2">
                      <Skeleton className="h-16 w-6 rounded-t" />
                      <Skeleton className="h-24 w-6 rounded-t" />
                    </div>
                    <Skeleton className="h-4 w-full rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                {monthlyDisplayPoints.map((item, idx) => {
                  const demandHeight = Math.min(100, Math.round((item.demand / maxMonthlyVal) * 100));
                  const stockHeight = Math.min(100, Math.round((item.stock / maxMonthlyVal) * 100));
                  const isDeficit = item.demand > item.stock;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex flex-col justify-between space-y-3 ${
                        item.is_future
                          ? "bg-white border-[#2563EB]/25 shadow-xs"
                          : "bg-white/70 border-[#E5E7EB]"
                      }`}
                    >
                      {/* Month Header */}
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-bold ${item.is_future ? "text-[#2563EB]" : "text-[#374151]"}`}>
                          {item.month}
                        </span>
                        {item.is_future && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#EFF6FF] text-[#2563EB]">
                            FORECAST
                          </span>
                        )}
                      </div>

                      {/* Side-by-side Visual Bars */}
                      <div className="h-28 flex items-end justify-center gap-2 pt-2 border-b border-[#F3F4F6] pb-2">
                        {/* Demand Bar */}
                        <div className="w-6 flex flex-col items-center gap-1 h-full justify-end">
                          <span className="text-[9px] font-mono font-bold text-[#2563EB]">
                            {(item.demand / 1000).toFixed(1)}k
                          </span>
                          <div
                            style={{ height: `${Math.max(8, demandHeight)}%` }}
                            className="w-full bg-[#2563EB] rounded-t-sm transition-all"
                          ></div>
                        </div>

                        {/* Stock Bar */}
                        <div className="w-6 flex flex-col items-center gap-1 h-full justify-end">
                          <span className="text-[9px] font-mono font-bold text-[#10B981]">
                            {(item.stock / 1000).toFixed(1)}k
                          </span>
                          <div
                            style={{ height: `${Math.max(8, stockHeight)}%` }}
                            className={`w-full rounded-t-sm transition-all ${
                              isDeficit ? "bg-[#F59E0B]" : "bg-[#10B981]"
                            }`}
                          ></div>
                        </div>
                      </div>

                      {/* Stock Health Status */}
                      <div className="text-center pt-1">
                        {isDeficit ? (
                          <span className="inline-block text-[10px] font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#DC2626]/20">
                            ⚠️ Shortfall: -{(item.demand - item.stock).toLocaleString()}
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-semibold text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#16A34A]/20">
                            ✓ Stock Healthy
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DYNAMIC MULTI-WAREHOUSE SKU FORECAST TABLE                                 */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search product or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#111827]"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Warehouse Filter */}
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="h-8 px-2.5 text-xs bg-white border border-[#E5E7EB] rounded-lg font-semibold text-[#111827] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Warehouses (5 Hubs)</option>
                <option value="WH-MUM">Mumbai Hub (WH-MUM)</option>
                <option value="WH-DEL">Delhi Hub (WH-DEL)</option>
                <option value="WH-SUR">Surat Hub (WH-SUR)</option>
                <option value="WH-BAN">Bangalore Hub (WH-BAN)</option>
                <option value="WH-AHM">Ahmedabad Hub (WH-AHM)</option>
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-8 px-2.5 text-xs bg-white border border-[#E5E7EB] rounded-lg font-semibold text-[#111827] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="Laptops">Laptops</option>
                <option value="Smartphones">Smartphones</option>
                <option value="Accessories">Accessories</option>
                <option value="Audio">Audio</option>
                <option value="Wearables">Wearables</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">PRODUCT / SKU</th>
                  <th className="py-3.5 px-4">WAREHOUSE</th>
                  <th className="py-3.5 px-4 text-right">AVAILABLE IN-STOCK</th>
                  <th className="py-3.5 px-4 text-right">EXPECTED 30D DEMAND</th>
                  <th className="py-3.5 px-4 text-center">DEMAND VELOCITY</th>
                  <th className="py-3.5 px-4 text-right">INVENTORY HEALTH</th>
                  <th className="py-3.5 px-4 text-right">ACTION</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F3F4F6]">
                {isForecastsLoading ? (
                  <TableRowSkeleton rows={6} cols={7} />
                ) : forecastError ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <ErrorState error={forecastError} onRetry={refetchForecasts} />
                    </td>
                  </tr>
                ) : forecasts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#6B7280]">
                      No product forecasts found for the selected warehouse or category.
                    </td>
                  </tr>
                ) : (
                  forecasts.map((item, i) => {
                    const isHighGrowth = item.growth_rate_pct > 18;
                    const key = `${item.product_id}-${item.warehouse_code}-${i}`;

                    return (
                      <tr
                        key={key}
                        onClick={() => setSelectedSku(item.product_id)}
                        className={`hover:bg-[#F9FAFB] transition-colors cursor-pointer ${
                          selectedSku === item.product_id ? "bg-[#EFF6FF]/60" : ""
                        }`}
                      >
                        {/* Product */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#111827]">{item.product_name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-[#2563EB] font-semibold">{item.sku}</span>
                            <span className="text-[10px] text-[#6B7280]">· {item.category_name}</span>
                          </div>
                        </td>

                        {/* Warehouse Hub */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#111827]">
                            {item.warehouse_name || "Mumbai Hub"}
                          </div>
                          <div className="font-mono text-[10px] text-[#6B7280]">
                            {item.warehouse_code || "WH-MUM"}
                          </div>
                        </td>

                        {/* Available Stock */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#111827]">
                          {(item.available_stock || 0).toLocaleString()} units
                        </td>

                        {/* Expected 30D Demand */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#2563EB]">
                          {(item.projected_30d || 0).toLocaleString()} units
                        </td>

                        {/* Demand Velocity */}
                        <td className="py-3.5 px-4 text-center">
                          {isHighGrowth ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20">
                              <TrendingUp className="h-3 w-3" /> High Surge (+{item.growth_rate_pct}%)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3F4F6] text-[#4B5563]">
                              Steady (+{item.growth_rate_pct}%)
                            </span>
                          )}
                        </td>

                        {/* Inventory Health & Shortfall */}
                        <td className="py-3.5 px-4 text-right">
                          {item.is_shortfall ? (
                            <div>
                              <span className="font-bold text-[#DC2626] text-xs block">
                                ⚠️ Shortfall: -{item.shortfall_units.toLocaleString()} u
                              </span>
                              <span className="text-[10px] text-[#6B7280]">Order before stockout</span>
                            </div>
                          ) : (
                            <span className="text-[#16A34A] font-semibold text-xs inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Stock Sufficient
                            </span>
                          )}
                        </td>

                        {/* Action Button */}
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href="/purchase-orders"
                            className="inline-flex items-center gap-1 h-7 px-3 rounded-lg bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all shadow-xs"
                          >
                            <span>Reorder</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
