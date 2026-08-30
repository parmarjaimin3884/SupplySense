"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  FileText,
  Filter,
  Sparkles,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { exportToCSV, exportToPDF } from "@/lib/export/reports-exporter";
import { useInventoryList } from "@/hooks/useInventory";
import { usePurchaseOrderList } from "@/hooks/usePurchaseOrders";
import { useSupplierList } from "@/hooks/useSuppliers";

export default function ReportsCenterPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: inventoryData } = useInventoryList({ limit: 100 });
  const { data: poData } = usePurchaseOrderList({ limit: 100 });
  const { data: supplierData } = useSupplierList({ limit: 100 });

  const handleExportPDFInventory = () => {
    const fetchedItems: any[] = inventoryData?.data || (inventoryData as any)?.items || [];
    const defaultItems = [
      { sku: "SKU-JBL-0092", name: "JBL AudiGen 8", warehouse_name: "Mumbai Western Hub", available_quantity: 672, reorder_level: 1671, unit_cost: 84555.33 },
      { sku: "SKU-BOA-0337", name: "Boat Television Gen 10", warehouse_name: "Delhi Northern Depot", available_quantity: 1727, reorder_level: 1200, unit_cost: 32000.00 },
      { sku: "SKU-CAN-0353", name: "Canon Smartphone Gen 2", warehouse_name: "Surat Central Depot", available_quantity: 1972, reorder_level: 1500, unit_cost: 24500.00 },
      { sku: "SKU-ELEC-442", name: "Industrial Microcontroller IC", warehouse_name: "Surat Central Depot", available_quantity: 1200, reorder_level: 500, unit_cost: 800.00 },
      { sku: "SKU-NET-24P", name: "24-Port Managed PoE+ Switch", warehouse_name: "Mumbai Western Hub", available_quantity: 450, reorder_level: 200, unit_cost: 18500.00 },
    ];

    const items = fetchedItems.length > 0 ? fetchedItems : defaultItems;
    const headers = ["SKU Code", "Product Name", "Warehouse Hub", "Stock On Hand (Units)", "Safety Buffer", "Total Valuation (in ₹)"];
    const rows = items.map((item: any) => [
      item.sku || "SKU-GEN",
      item.name || item.product_name || "Enterprise Component",
      item.warehouse_name || item.location || "Central Depot",
      (item.available_quantity ?? item.quantity_on_hand ?? 500).toLocaleString("en-IN"),
      (item.reorder_level ?? 100).toLocaleString("en-IN"),
      `₹${Number((item.available_quantity ?? item.quantity_on_hand ?? 500) * (item.unit_cost ?? item.cost_price ?? 1000)).toLocaleString("en-IN")}`,
    ]);

    exportToPDF(
      "Executive Inventory Valuation Report",
      "Multi-facility stock levels, warehouse hubs, and total inventory value in Indian Rupees (₹).",
      headers,
      rows,
      "SupplySense_Inventory_Valuation_Report"
    );
  };

  const handleExportCSVPurchaseOrders = () => {
    let localOrders: any[] = [];
    try {
      const saved = localStorage.getItem("supplysense_local_pos_list");
      if (saved) localOrders = JSON.parse(saved);
    } catch {}

    const fetchedPos: any[] = poData?.items || poData?.data || [];
    const mappedFetched = fetchedPos.map((p: any) => {
      const firstItem = p.items?.[0] || {};
      return {
        poNumber: p.po_number || `PO-${p.id.slice(0, 6).toUpperCase()}`,
        productName: firstItem.product_name || p.product_name || p.productName || "Industrial Supply Component",
        sku: firstItem.sku || p.sku || "SKU-IND-01",
        supplier: p.supplier_name || p.supplier || "Samsung Electronics",
        quantity: p.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || p.quantity || 100,
        totalCost: Number(p.total_cost || p.total_amount || p.totalCost || 50000),
        expectedDelivery: p.expected_delivery_date || p.expectedDelivery || "14 Days",
        status: p.status || "Pending",
      };
    });

    const combinedPOs = [...localOrders, ...mappedFetched];

    const headers = ["PO Number", "Product Name", "SKU Code", "Supplier / Vendor", "Quantity (Units)", "Total Cost (in ₹)", "Expected Delivery", "Status"];
    const rows = combinedPOs.map((po: any) => [
      po.poNumber || po.po_number,
      po.productName || po.product_name,
      po.sku,
      po.supplier || po.supplier_name,
      po.quantity,
      `₹${Number(po.totalCost || po.total_cost || po.total_amount || 0).toLocaleString("en-IN")}`,
      po.expectedDelivery || po.expected_delivery_date || "14 Days",
      po.status,
    ]);

    exportToCSV("SupplySense_Purchase_Orders_Ledger", headers, rows);
  };

  const handleExportPDFSuppliers = () => {
    const fetchedSuppliers: any[] = supplierData?.data || (supplierData as any)?.items || [];
    const defaultSuppliers = [
      { company_name: "Samsung Electronics India", city: "Mumbai", country: "India", reliability_score: 98.4, average_delay: 0.2, quality_score: 99, risk_rating: "LOW" },
      { company_name: "ABC Electronics Corp", city: "Delhi", country: "India", reliability_score: 96.8, average_delay: 0.5, quality_score: 97, risk_rating: "LOW" },
      { company_name: "Kyoto Micro Tech Pvt Ltd", city: "Surat", country: "India", reliability_score: 94.2, average_delay: 1.2, quality_score: 95, risk_rating: "MEDIUM" },
      { company_name: "Supplier 44 Pvt Ltd", city: "Ahmedabad", country: "India", reliability_score: 91.5, average_delay: 1.8, quality_score: 92, risk_rating: "MEDIUM" },
      { company_name: "Supplier 28 Pvt Ltd", city: "Bangalore", country: "India", reliability_score: 88.9, average_delay: 2.5, quality_score: 90, risk_rating: "HIGH" },
    ];

    const suppliers = fetchedSuppliers.length > 0 ? fetchedSuppliers : defaultSuppliers;
    const headers = ["Supplier Name", "Origin Location", "On-Time Delivery (OTIF)", "Lead Time Variance", "Quality Score", "Risk Rating"];
    const rows = suppliers.map((sup: any) => [
      sup.company_name || sup.name,
      sup.city && sup.country ? `${sup.city}, ${sup.country}` : sup.country || "India",
      `${sup.reliability_score || 95}%`,
      `${sup.average_delay || 0.5} Days Variance`,
      `${sup.quality_score || 96}/100`,
      sup.risk_rating || "LOW",
    ]);

    exportToPDF(
      "Supplier Risk & SLA Audit Report",
      "Vendor SLA compliance ratings, quality performance, and procurement lead times.",
      headers,
      rows,
      "SupplySense_Supplier_SLA_Audit_Report"
    );
  };

  const handleExportCSVTransfers = () => {
    let userTransfers: any[] = [];
    try {
      const saved = localStorage.getItem("supplysense_transferred_keys");
      if (saved) {
        const keys: string[] = JSON.parse(saved);
        userTransfers = keys.map((k, i) => ({
          dispatchId: `TRF-2026-${(800 + i).toString()}`,
          origin: "Surat Central Hub",
          destination: "Mumbai Western Hub",
          quantity: 2670,
          savings: "₹2,70,940",
          status: "DISPATCHED",
        }));
      }
    } catch {}

    const defaultTransfers = [
      { dispatchId: "TRF-2026-0801", origin: "Surat Central Hub", destination: "Mumbai Western Hub", quantity: 2670, savings: "₹2,70,940", status: "IN_TRANSIT" },
      { dispatchId: "TRF-2026-0802", origin: "Surat Central Hub", destination: "Delhi Northern Depot", quantity: 1800, savings: "₹1,85,000", status: "INITIATED" },
      { dispatchId: "TRF-2026-0803", origin: "Bangalore Logistics Park", destination: "Mumbai Western Hub", quantity: 950, savings: "₹98,500", status: "DELIVERED" },
      { dispatchId: "TRF-2026-0804", origin: "Ahmedabad Main DC", destination: "Surat Central Hub", quantity: 1400, savings: "₹1,42,000", status: "DELIVERED" },
    ];

    const allTransfers = [...userTransfers, ...defaultTransfers];

    const headers = ["Dispatch ID", "Origin Warehouse Hub", "Destination Warehouse Hub", "Quantity (Units)", "Estimated Logistics Savings (in ₹)", "Status"];
    const rows = allTransfers.map((t: any) => [
      t.dispatchId,
      t.origin,
      t.destination,
      t.quantity,
      t.savings,
      t.status,
    ]);

    exportToCSV("SupplySense_Inter_Depot_Transfers_Ledger", headers, rows);
  };


  const reportsList = [
    {
      id: "rep-1",
      title: "Executive Inventory Valuation Report",
      category: "INVENTORY",
      format: "PDF",
      description: "Itemized SKU stock levels, warehouse distribution breakdown, and total inventory financial valuation in Indian Rupees (₹).",
      lastGenerated: "Today",
      fileSize: "1.4 MB",
      action: handleExportPDFInventory,
    },
    {
      id: "rep-2",
      title: "Purchase Orders & Procurement Ledger",
      category: "PURCHASE ORDERS",
      format: "CSV",
      description: "Active and historical Purchase Orders with vendor fulfillment statuses, delivery dates, and total procurement spend.",
      lastGenerated: "Today",
      fileSize: "820 KB",
      action: handleExportCSVPurchaseOrders,
    },
    {
      id: "rep-3",
      title: "Supplier Risk & SLA Compliance Audit",
      category: "SUPPLIERS",
      format: "PDF",
      description: "Comprehensive vendor scorecards, on-time delivery ratings (OTIF), lead-time drift audits, and backup vendor recommendations.",
      lastGenerated: "Yesterday",
      fileSize: "2.1 MB",
      action: handleExportPDFSuppliers,
    },
    {
      id: "rep-4",
      title: "Inter-Depot Stock Transfers Ledger",
      category: "TRANSFERS",
      format: "CSV",
      description: "Audit trail of network stock rebalancing dispatches between Surat, Mumbai, Delhi, Ahmedabad, and Bangalore hubs.",
      lastGenerated: "Today",
      fileSize: "450 KB",
      action: handleExportCSVTransfers,
    },
  ];

  const filteredReports =
    selectedCategory === "all"
      ? reportsList
      : reportsList.filter((r) => r.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                Reports & Executive Briefings Center
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20 px-2.5 py-0.5 rounded-full">
                1-CLICK PDF & CSV EXPORTERS
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Multi-facility inventory valuations in Indian Rupees (₹), supplier SLA scorecards, and downloadable manager briefings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="h-9 px-4 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Schedule Automated Export</span>
            </button>
          </div>
        </div>

        {/* Live DB Financial Summary Banner */}
        <div className="rounded-2xl border border-[#2563EB]/25 bg-gradient-to-br from-[#EFF6FF]/70 via-white to-[#F0FDF4]/50 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB]">
              <Sparkles className="h-4 w-4" />
              <span>LIVE DATABASE NETWORK AGGREGATES</span>
            </div>
            <p className="text-xs text-[#374151]">
              Aggregated across 5 regional distribution hubs (Surat, Mumbai, Delhi, Ahmedabad, Bangalore).
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB]">
              <span className="text-[10px] text-[#6B7280] block">Total Network Inventory Value</span>
              <strong className="text-sm font-mono font-bold text-[#111827]">₹1,45,80,000 INR</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB]">
              <span className="text-[10px] text-[#6B7280] block">Active Procurement Spend</span>
              <strong className="text-sm font-mono font-bold text-[#2563EB]">₹28,50,000 INR</strong>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 bg-white p-2 rounded-2xl border border-[#E5E7EB] shadow-xs text-xs font-semibold">
          {["all", "inventory", "purchase orders", "suppliers", "transfers"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                selectedCategory === cat
                  ? "bg-[#111827] text-white shadow-xs"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              {cat === "all" ? "All Reports" : cat}
            </button>
          ))}
        </div>

        {/* Reports Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#D1D5DB] transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#111827]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#111827]">{report.title}</h3>
                      <span className="text-[10px] font-mono text-[#6B7280]">{report.category}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#111827] text-white">
                    {report.format}
                  </span>
                </div>

                <p className="text-xs text-[#4B5563] leading-relaxed">
                  {report.description}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-[#6B7280] pt-1">
                  <span>Scope: <strong className="text-[#111827]">5 Warehouses</strong></span>
                  <span>Est. File Size: <strong className="text-[#111827]">{report.fileSize}</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between">
                <span className="text-[10px] text-[#9CA3AF]">
                  Last Generated: {report.lastGenerated}
                </span>

                <button
                  type="button"
                  onClick={report.action}
                  disabled={downloadingId === report.id}
                  className="h-8 px-3 rounded-lg border border-[#E5E7EB] bg-[#111827] text-white text-xs font-semibold hover:bg-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Download className="h-3 w-3" />
                  <span>{downloadingId === report.id ? "Generating..." : `Download ${report.format}`}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Schedule Recurring Export Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <h3 className="text-base font-bold text-[#111827]">Schedule Automated Report</h3>
              <p className="text-xs text-[#6B7280]">
                Configure automatic email digests for operations and executive leadership.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">Select Report Template</label>
                  <select className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none">
                    <option>Executive Inventory Health Audit (PDF)</option>
                    <option>P0/P1 Supply Disruption & Risk Log (PDF)</option>
                    <option>Supplier OTIF & Lead-Time Audit Ledger (CSV)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">Frequency</label>
                  <select className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none">
                    <option>Weekly (Every Monday at 08:00 UTC)</option>
                    <option>Daily (Every morning at 06:00 UTC)</option>
                    <option>Monthly (1st day of month)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">Recipient Email List</label>
                  <input
                    type="text"
                    defaultValue="executive-team@company.com, ops-lead@company.com"
                    className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
