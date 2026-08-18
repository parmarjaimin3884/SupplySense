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
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MOCK_REPORTS } from "@/data/mock-data";

export default function ReportsCenterPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const filteredReports =
    selectedCategory === "all"
      ? MOCK_REPORTS
      : MOCK_REPORTS.filter((r) => r.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
              Reports & Executive Briefings Center
            </h1>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Automated multi-facility inventory valuations, supplier SLA compliance audits, and scheduled PDF/Excel exports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="h-9 px-4 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Schedule Recurring Export</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 bg-white p-2 rounded-2xl border border-[#E5E7EB] shadow-xs text-xs font-semibold">
          {["all", "inventory", "risk", "supplier", "forecast"].map((cat) => (
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
              {cat === "all" ? "All Reports" : `${cat} Reports`}
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
                      <span className="text-[10px] font-mono text-[#6B7280]">{report.category} Domain</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F3F4F6] text-[#111827]">
                    {report.format}
                  </span>
                </div>

                <p className="text-xs text-[#4B5563] leading-relaxed">
                  {report.description}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-[#6B7280] pt-1">
                  <span>Frequency: <strong className="text-[#111827]">{report.frequency}</strong></span>
                  <span>Size: <strong className="text-[#111827]">{report.fileSize}</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between">
                <span className="text-[10px] text-[#9CA3AF]">
                  Last Generated: {report.lastGenerated}
                </span>

                <button
                  type="button"
                  onClick={() => alert(`Downloading ${report.title} (${report.format})...`)}
                  className="h-8 px-3 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#111827] hover:bg-[#F9FAFB] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="h-3 w-3 text-[#6B7280]" />
                  <span>Download {report.format}</span>
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
                    <option>Supplier OTIF & Lead-Time Audit Ledger (Excel)</option>
                    <option>90-Day ML Demand Forecast Variance (CSV)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">Cron Frequency</label>
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
                    defaultValue="executive-team@enterprise.com, ops-lead@enterprise.com"
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
                    alert("Report Cron Schedule Saved.");
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
