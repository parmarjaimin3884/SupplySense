'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  DollarSign,
  Package,
  AlertTriangle,
  ShieldAlert,
  Truck,
  Clock,
  ShoppingBag,
  TrendingUp,
  Bot,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { KPICard } from '@/components/shared/KPICard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge, Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { useAnalyticsKPIs } from '@/features/analytics/hooks/useAnalytics';
import { useShipments } from '@/features/shipments/hooks/useShipments';
import { usePurchaseOrders } from '@/features/purchase-orders/hooks/usePurchaseOrders';
import { useRisks } from '@/features/risks/hooks/useRisks';
import { useExecutiveSummary } from '@/features/executive/hooks/useExecutive';
import { useForecast } from '@/features/forecast/hooks/useForecast';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';

// Lazy-load recharts chart — it's ~500KB+ with d3 deps and compiles slowly
const DemandChart = dynamic(() => import('./DemandChart'), {
  ssr: false,
  loading: () => <CardSkeleton />,
});

export default function DashboardContent() {
  const { data: kpis, isLoading: kpiLoading, error: kpiError, refetch: refetchKPIs } = useAnalyticsKPIs();
  const { data: shipmentsData, isLoading: shpLoading } = useShipments();
  const { data: poData, isLoading: poLoading } = usePurchaseOrders();
  const { data: risksData, isLoading: rskLoading } = useRisks();
  const { data: execData, isLoading: execLoading } = useExecutiveSummary();
  const { data: forecastData, isLoading: fcLoading } = useForecast();

  if (kpiError) {
    return <ErrorState message="Failed to load telemetry analytics data." onRetry={refetchKPIs} />;
  }

  const shipments = shipmentsData?.data || [];
  const pos = poData?.data || [];
  const risks = risksData?.data || [];
  const health = execData?.healthScore;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Executive Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-mono">
              Operations Overview
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Telemetry Service Active
            </span>
          </div>
          <h1 className="text-xl font-black tracking-tight font-sans">Supply Chain Command Center</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time supply chain monitoring covering inventory balance, supplier SLA tracking, freight logistics, and risk alerts.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link href="/assistant">
            <Button variant="ai" size="md" className="font-semibold shadow-ai-glow">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Ask AI Assistant
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 8 KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiLoading ? (
          Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <KPICard
              title="Total Inventory Value"
              value={formatCurrency(kpis?.totalInventoryValue || 0)}
              label={`${kpis?.totalSkus || 0} Total SKUs`}
              icon={DollarSign}
              statusIndicator="info"
            />
            <KPICard
              title="Total SKUs"
              value={formatNumber(kpis?.totalSkus || 0)}
              label="Tracked Product Items"
              icon={Package}
              statusIndicator="success"
            />
            <KPICard
              title="Low Stock Items"
              value={kpis?.lowStockCount || 0}
              label="Below Safety Threshold"
              trend={{ value: 'Action Needed', direction: 'up', isGood: false }}
              icon={AlertTriangle}
              statusIndicator="warning"
            />
            <KPICard
              title="Critical Stockouts"
              value={kpis?.criticalCount || 0}
              label="Severe Stock Breaches"
              trend={{ value: 'Urgent', direction: 'up', isGood: false }}
              icon={ShieldAlert}
              statusIndicator="danger"
            />
            <KPICard
              title="Active Shipments"
              value={kpis?.activeShipmentsCount || 0}
              label="Freight Cargo In-Transit"
              icon={Truck}
              statusIndicator="info"
            />
            <KPICard
              title="Delayed Shipments"
              value={kpis?.delayedShipmentsCount || 0}
              label="Schedule Slippages"
              trend={{ value: 'ETA Adjusted', direction: 'up', isGood: false }}
              icon={Clock}
              statusIndicator="danger"
            />
            <KPICard
              title="Open Purchase Orders"
              value={kpis?.openPOsCount || 0}
              label="Active Purchase Orders"
              icon={ShoppingBag}
              statusIndicator="info"
            />
            <KPICard
              title="Critical Risks"
              value={kpis?.criticalRisksCount || 0}
              label="Active Operations Threats"
              icon={Activity}
              statusIndicator="ai"
            />
          </>
        )}
      </div>

      {/* Section 1: Supply Chain Health Score breakdown */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Supply Chain Health Index
            </CardTitle>
            <CardDescription>Composite operational score across supply chain domains</CardDescription>
          </div>
          <Badge variant="ai" size="md">
            Overall Health Score: {health?.overallScore || 88} / 100
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Inventory Health</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{health?.inventoryHealth || 92}%</div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${health?.inventoryHealth || 92}%` }} />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Supplier Health</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{health?.supplierHealth || 84}%</div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${health?.supplierHealth || 84}%` }} />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Shipment Health</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{health?.shipmentHealth || 79}%</div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${health?.shipmentHealth || 79}%` }} />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Demand Forecast</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{health?.demandHealth || 95}%</div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${health?.demandHealth || 95}%` }} />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Risk Defense</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{health?.riskHealth || 86}%</div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-indigo-500 h-full" style={{ width: `${health?.riskHealth || 86}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Charts & Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 2: Recharts Demand Projection — Lazy Loaded */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                12-Month Demand Projection Curve
              </CardTitle>
              <CardDescription>Historical demand baseline vs projected consumption trend</CardDescription>
            </div>
            <Link href="/forecast">
              <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                View Forecast <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              {fcLoading ? (
                <CardSkeleton />
              ) : (
                <DemandChart data={forecastData?.data} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 7: AI Agent Insights */}
        <Card className="border-indigo-200 bg-gradient-to-b from-indigo-50/40 to-white">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <Bot className="w-4 h-4 text-indigo-600 animate-bounce" />
                AI Operations Assistant Insights
              </CardTitle>
              <CardDescription>Generated by SupplySense AI Service</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 bg-white rounded-xl border border-indigo-100 shadow-subtle space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Shipment Alert
                </span>
                <span className="text-[10px] text-slate-400 font-mono">14m ago</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Shipment <code className="bg-slate-100 px-1 rounded">SHP-9021</code> is delayed by 4 days due to port clearance queues. Rerouting recommended.
              </p>
              <Link href="/shipments/SHP-9021">
                <Button variant="ghost" size="sm" className="text-[11px] text-indigo-600 p-0 h-auto font-semibold">
                  Inspect Shipment ➔
                </Button>
              </Link>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-indigo-100 shadow-subtle space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Inventory Alert
                </span>
                <span className="text-[10px] text-slate-400 font-mono">1h ago</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Apple ProBook Ultra 15&quot; stock dropped to 142 units. Reorder recommended.
              </p>
              <Link href="/inventory">
                <Button variant="ghost" size="sm" className="text-[11px] text-indigo-600 p-0 h-auto font-semibold">
                  Review Stock ➔
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Risks & Active Shipments Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Risks */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Active Operational Threats & Risks
              </CardTitle>
              <CardDescription>Prioritized by composite Likelihood x Impact score</CardDescription>
            </div>
            <Link href="/risks">
              <Button variant="ghost" size="sm" className="text-xs text-slate-600">
                View All Risks <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {risks.map((risk) => (
              <div key={risk.id} className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={risk.severity} />
                    <span className="text-xs font-bold text-slate-900">{risk.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{formatDate(risk.detectedTime)}</span>
                </div>
                <p className="text-xs text-slate-600">{risk.impact}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Freight In-Transit */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                Active Freight Tracking
              </CardTitle>
              <CardDescription>Carrier ETA and progress overview</CardDescription>
            </div>
            <Link href="/shipments">
              <Button variant="ghost" size="sm" className="text-xs text-slate-600">
                Track Shipments <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {shipments.map((shp) => (
              <div key={shp.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{shp.shipmentNo}</span>
                    <span className="text-[10px] text-slate-500 ml-2 font-mono">{shp.trackingNo}</span>
                  </div>
                  <StatusBadge status={shp.status} />
                </div>
                <div className="text-xs text-slate-600 flex items-center justify-between">
                  <span>{shp.origin} ➔ {shp.destination}</span>
                  <span className="font-semibold text-slate-800">ETA: {shp.revisedEta}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${shp.status === 'DELAYED' ? 'bg-rose-500' : 'bg-blue-600'}`}
                    style={{ width: `${shp.progressPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
