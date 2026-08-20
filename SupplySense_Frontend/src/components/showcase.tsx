"use client";

import { useState } from "react";
import {
  Boxes,
  ShieldAlert,
  Users,
  LineChart,
} from "lucide-react";
import { MOCK_SKUS, MOCK_RISKS, MOCK_SUPPLIERS } from "@/data/mock-data";

export function Showcase() {
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<
    "inventory" | "risk" | "suppliers" | "forecast"
  >("inventory");

  return (
    <section id="showcase" className="px-4 sm:px-6 lg:px-8 py-28 bg-[#F9FAFB]">
      <div className="mx-auto max-w-[1280px]">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-[#111827] mb-5 border border-[#E5E7EB] shadow-xs">
            <span>Enterprise Workspace</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-[56px] font-extrabold tracking-tight text-[#111827] leading-[1.08]">
            Built for operational excellence.
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-[#6B7280]">
            No mock vanity charts. Explore the real workspaces your inventory and operations teams use
            daily.
          </p>
        </div>

        {/* Cal.com Pill Tabs Switcher */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveShowcaseTab("inventory")}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                activeShowcaseTab === "inventory"
                  ? "bg-[#111827] text-white shadow-xs"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              <Boxes className="h-4 w-4" />
              <span>Inventory Command</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveShowcaseTab("risk")}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                activeShowcaseTab === "risk"
                  ? "bg-[#111827] text-white shadow-xs"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Risk Radar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveShowcaseTab("suppliers")}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                activeShowcaseTab === "suppliers"
                  ? "bg-[#111827] text-white shadow-xs"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Supplier Scorecards</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveShowcaseTab("forecast")}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                activeShowcaseTab === "forecast"
                  ? "bg-[#111827] text-white shadow-xs"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              <LineChart className="h-4 w-4" />
              <span>ML Forecasting</span>
            </button>
          </div>
        </div>

        {/* Tab Showcase Card */}
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-8 sm:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
          {activeShowcaseTab === "inventory" && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
                <div>
                  <h3 className="text-xl font-bold text-[#111827]">
                    Multi-Node Inventory Ledger & Safety Stock Buffer
                  </h3>
                  <p className="text-sm text-[#6B7280] mt-1">
                    Sub-second telemetry sync for Surat Central Warehouse (WH-SUR)
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-xl bg-[#111827] text-white text-xs font-bold px-4 py-2.5 hover:bg-black transition-all"
                >
                  + Create Transfer
                </button>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-[#6B7280] bg-[#FAFAFA] font-bold text-xs">
                      <th className="py-3.5 px-4">SKU CODE</th>
                      <th className="py-3.5 px-4">DESCRIPTION</th>
                      <th className="py-3.5 px-4">LOCATION</th>
                      <th className="py-3.5 px-4 text-right">ON HAND</th>
                      <th className="py-3.5 px-4 text-right">DAYS OF SUPPLY</th>
                      <th className="py-3.5 px-4">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {MOCK_SKUS.map((s) => (
                      <tr key={s.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#111827]">{s.sku}</td>
                        <td className="py-3.5 px-4 font-semibold text-[#111827]">{s.name}</td>
                        <td className="py-3.5 px-4 text-[#4B5563] font-medium">{s.location}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-medium">{s.onHand.toLocaleString()} ea</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                          <span
                            className={
                              s.daysOfSupply <= 3
                                ? "text-[#DC2626]"
                                : s.daysOfSupply <= 7
                                ? "text-[#D97706]"
                                : "text-[#16A34A]"
                            }
                          >
                            {s.daysOfSupply.toFixed(1)} d
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              s.riskStatus === "Critical"
                                ? "bg-[#FEF2F2] text-[#DC2626]"
                                : s.riskStatus === "Low Buffer"
                                ? "bg-[#FFFBEB] text-[#D97706]"
                                : "bg-[#F0FDF4] text-[#16A34A]"
                            }`}
                          >
                            {s.riskStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeShowcaseTab === "risk" && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
                <div>
                  <h3 className="text-xl font-bold text-[#111827]">
                    Disruption Radar & Active Escalation Matrix
                  </h3>
                  <p className="text-sm text-[#6B7280] mt-1">
                    2 P0 Critical Threats • $800k Capital Exposure Monitored
                  </p>
                </div>
                <span className="rounded-xl bg-[#FEF2F2] border border-[#DC2626]/20 text-[#DC2626] text-xs font-mono font-bold px-3.5 py-1.5">
                  2 Active P0 Incidents
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_RISKS.map((risk) => (
                  <div
                    key={risk.id}
                    className="rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`rounded-lg px-2.5 py-0.5 text-xs font-mono font-bold ${
                            risk.severity === "P0"
                              ? "bg-[#DC2626] text-white"
                              : "bg-[#F59E0B] text-white"
                          }`}
                        >
                          {risk.severity} ALERT
                        </span>
                        <span className="text-sm font-mono text-[#DC2626] font-bold">
                          {risk.exposureValue}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#111827]">{risk.title}</h4>
                      <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">{risk.impact}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#E5E7EB] bg-white p-4 rounded-2xl border">
                      <div className="text-[11px] font-mono text-[#111827] uppercase font-bold mb-1">
                        Autonomous Mitigation Staged
                      </div>
                      <p className="text-xs text-[#111827] font-semibold leading-relaxed">{risk.recommendedAction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeShowcaseTab === "suppliers" && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
                <div>
                  <h3 className="text-xl font-bold text-[#111827]">
                    Supplier Performance Scorecards & SLA Audit
                  </h3>
                  <p className="text-sm text-[#6B7280] mt-1">
                    Automated OTIF verification, defect ratios, and contracted lead-time drift tracking
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-xl border border-[#E5E7EB] bg-white text-xs font-bold px-4 py-2.5 hover:bg-[#F9FAFB]"
                >
                  Export Scorecard PDF
                </button>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-[#6B7280] bg-[#FAFAFA] font-bold text-xs">
                      <th className="py-3.5 px-4">SUPPLIER NAME</th>
                      <th className="py-3.5 px-4">ORIGIN</th>
                      <th className="py-3.5 px-4">STATUS</th>
                      <th className="py-3.5 px-4 text-right">OTIF FIDELITY</th>
                      <th className="py-3.5 px-4 text-right">LEAD TIME DRIFT</th>
                      <th className="py-3.5 px-4 text-right">ACTIVE SPEND</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {MOCK_SUPPLIERS.map((sup) => (
                      <tr key={sup.id} className="hover:bg-[#F9FAFB]">
                        <td className="py-3.5 px-4 font-bold text-[#111827]">{sup.name}</td>
                        <td className="py-3.5 px-4 text-[#4B5563] font-medium">{sup.origin}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              sup.status.includes("P0")
                                ? "bg-[#FEF2F2] text-[#DC2626]"
                                : "bg-[#F0FDF4] text-[#16A34A]"
                            }`}
                          >
                            {sup.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold">{sup.otifRate}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#D97706]">
                          {sup.leadTimeVariance}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold">{sup.activeSpend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeShowcaseTab === "forecast" && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
                <div>
                  <h3 className="text-xl font-bold text-[#111827]">
                    Ensemble Demand Modeler & Scenario Horizon
                  </h3>
                  <p className="text-sm text-[#6B7280] mt-1">
                    90-Day Rolling Forecast with P50 / P80 / P95 Confidence Envelopes
                  </p>
                </div>
                <span className="rounded-xl bg-[#F5F3FF] border border-[#7C3AED]/20 text-[#7C3AED] text-xs font-mono font-bold px-3.5 py-1.5">
                  MAPE: 3.8% Accuracy
                </span>
              </div>

              <div className="mt-6 rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-8">
                <div className="flex items-center justify-between text-xs text-[#6B7280] mb-5">
                  <div className="flex items-center gap-5 font-semibold">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-4 bg-[#111827] rounded" /> P50 Expected Demand
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-4 bg-[#CBD5E1] rounded" /> P95 Confidence Band
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-0.5 w-4 bg-[#DC2626]" /> Safety Stock Buffer (2,400 ea)
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#111827] font-bold">
                    Model: Transformer-Ensemble v4
                  </span>
                </div>

                <div className="h-52 w-full relative flex items-end">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <line
                      x1="0%"
                      y1="70%"
                      x2="100%"
                      y2="70%"
                      stroke="#DC2626"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <polygon
                      points="0,120 150,110 300,90 450,70 600,50 750,30 900,20 900,100 750,110 600,120 450,130 300,140 150,145 0,150"
                      fill="#E2E8F0"
                      opacity="0.6"
                    />
                    <polyline
                      fill="none"
                      stroke="#111827"
                      strokeWidth="2.5"
                      points="0,135 150,125 300,105 450,85 600,65 750,45 900,35"
                    />
                  </svg>
                </div>

                <div className="flex justify-between text-xs font-mono text-[#6B7280] mt-5 border-t border-[#E5E7EB] pt-3 font-semibold">
                  <span>Week 1 (Current)</span>
                  <span>Week 4</span>
                  <span>Week 8</span>
                  <span>Week 12 (Horizon)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
