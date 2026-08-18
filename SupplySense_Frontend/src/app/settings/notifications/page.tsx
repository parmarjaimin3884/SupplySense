"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  Mail,
  Save,
  ShieldAlert,
  Smartphone,
  Sparkles,
  TrendingUp,
  Truck,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

interface ChannelSetting {
  id: string;
  title: string;
  description: string;
  icon: any;
  channel: "in-app" | "email" | "both";
  severity: "Critical" | "High" | "Medium" | "Low";
}

export default function NotificationSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<ChannelSetting[]>([
    {
      id: "stockout",
      title: "Stockout & Inventory Depletion Alerts",
      description: "Triggered whenever safety stock drops below 7-day or 48-hour emergency thresholds.",
      icon: AlertTriangle,
      channel: "both",
      severity: "Critical",
    },
    {
      id: "supplier",
      title: "Supplier Lead-Time & Delay Alerts",
      description: "Triggered on delivery delays > 2 days, SLA breaches, or vendor reliability score drops > 10%.",
      icon: Truck,
      channel: "both",
      severity: "High",
    },
    {
      id: "forecast",
      title: "Demand Forecast Anomaly Alerts",
      description: "Triggered on statistical consumption spikes > 15% detected by machine learning models.",
      icon: TrendingUp,
      channel: "in-app",
      severity: "Medium",
    },
    {
      id: "inventory",
      title: "Inventory Buffer & Holding Telemetry",
      description: "Periodic buffer efficiency summaries, excess inventory warnings, and storage bay allocations.",
      icon: ShieldAlert,
      channel: "in-app",
      severity: "Low",
    },
    {
      id: "ai-recommendations",
      title: "AI Replenishment & Purchase Order Recommendations",
      description: "Automated PO drafts and vendor dual-sourcing suggestions ready for one-click authorization.",
      icon: Sparkles,
      channel: "both",
      severity: "High",
    },
  ]);

  const handleChannelChange = (id: string, channel: "in-app" | "email" | "both") => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, channel } : s))
    );
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href="/settings" className="hover:text-[#111827] flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Settings</span>
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-semibold">Notification Preferences</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                Notification Preferences
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2 py-0.5 rounded-full">
                DELIVERY CHANNELS
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Configure alert trigger thresholds, notification channels, and operational escalation pathways.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="h-9 px-4 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                <span>Preferences Saved</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>

        {/* Settings Cards */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs divide-y divide-[#F3F4F6]">
          {settings.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 max-w-xl">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#111827] mt-0.5">
                    <Icon className="h-4 w-4 text-[#4B5563]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#111827]">{item.title}</h3>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          item.severity === "Critical"
                            ? "bg-[#FEF2F2] text-[#DC2626]"
                            : item.severity === "High"
                            ? "bg-[#FFFBEB] text-[#D97706]"
                            : "bg-[#F3F4F6] text-[#4B5563]"
                        }`}
                      >
                        {item.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] leading-relaxed mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Channel Radio Options */}
                <div className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-xl text-xs font-medium shrink-0">
                  <button
                    type="button"
                    onClick={() => handleChannelChange(item.id, "in-app")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      item.channel === "in-app"
                        ? "bg-white text-[#111827] shadow-xs font-bold"
                        : "text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    In-App Only
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChannelChange(item.id, "email")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      item.channel === "email"
                        ? "bg-white text-[#111827] shadow-xs font-bold"
                        : "text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    Email
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChannelChange(item.id, "both")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      item.channel === "both"
                        ? "bg-white text-[#111827] shadow-xs font-bold"
                        : "text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    Both
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Dispatch Frequency */}
        <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#111827]">Delivery Cadence & Dispatch Frequency</h3>
          <p className="text-xs text-[#6B7280]">
            Critical (P0) stockout alerts are always dispatched immediately via real-time WebSocket push notifications and high-priority email.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl border border-[#2563EB] bg-[#EFF6FF]/40 text-xs space-y-1">
              <strong className="text-[#111827] block">Real-Time Instant Push</strong>
              <span className="text-[#4B5563]">Immediate in-app slide-over and toast notifications as events occur.</span>
            </div>
            <div className="p-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] text-xs space-y-1">
              <strong className="text-[#111827] block">Daily Morning Briefing Digest</strong>
              <span className="text-[#6B7280]">Aggregated PDF digest dispatched daily at 07:00 local time.</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
