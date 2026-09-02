"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  Save,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Truck,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

interface AlertTriggerDef {
  id: string;
  title: string;
  description: string;
  severity: "Critical" | "High" | "Medium" | "Low";
}

const ALERT_DEFINITIONS: AlertTriggerDef[] = [
  {
    id: "stockout",
    title: "Stockout & Inventory Depletion Alerts",
    description: "Trigger real-time web alerts whenever warehouse stock drops below safety buffer or emergency ROP thresholds.",
    severity: "Critical",
  },
  {
    id: "supplier",
    title: "Supplier Lead-Time & Delay Alerts",
    description: "Trigger web alerts on carrier shipment delays > 2 days, supplier SLA breaches, or vendor reliability score drops.",
    severity: "High",
  },
  {
    id: "forecast",
    title: "Demand Forecast Anomaly & Spike Alerts",
    description: "Trigger web alerts on sudden statistical consumption spikes (>15%) detected by machine learning models.",
    severity: "Medium",
  },
  {
    id: "warehouse-capacity",
    title: "Depot Capacity & Spatial Utilization Alerts",
    description: "Trigger web alerts when any regional fulfillment hub exceeds 85% storage capacity utilization.",
    severity: "Low",
  },
  {
    id: "ai-recommendations",
    title: "AI Replenishment & Purchase Order Recommendations",
    description: "Trigger actionable web notifications when AI generates ready-to-approve draft purchase orders.",
    severity: "High",
  },
];

const ALERT_ICONS: Record<string, any> = {
  stockout: AlertTriangle,
  supplier: Truck,
  forecast: TrendingUp,
  "warehouse-capacity": ShieldAlert,
  "ai-recommendations": Sparkles,
};

export default function NotificationSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastEnabled, setToastEnabled] = useState(true);
  const [badgeEnabled, setBadgeEnabled] = useState(true);

  // Store enabled state as an ID-to-boolean map (safe for localStorage JSON serialization)
  const [enabledTriggers, setEnabledTriggers] = useState<Record<string, boolean>>({
    stockout: true,
    supplier: true,
    forecast: true,
    "warehouse-capacity": true,
    "ai-recommendations": true,
  });

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem("supplysense_web_notification_settings_v2");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed.enabledTriggers) setEnabledTriggers(parsed.enabledTriggers);
        if (parsed.soundEnabled !== undefined) setSoundEnabled(parsed.soundEnabled);
        if (parsed.toastEnabled !== undefined) setToastEnabled(parsed.toastEnabled);
        if (parsed.badgeEnabled !== undefined) setBadgeEnabled(parsed.badgeEnabled);
      }
    } catch {}
  }, []);

  const handleToggle = (id: string) => {
    setEnabledTriggers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setSaved(false);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(
        "supplysense_web_notification_settings_v2",
        JSON.stringify({
          enabledTriggers,
          soundEnabled,
          toastEnabled,
          badgeEnabled,
        })
      );
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const activeCount = Object.values(enabledTriggers).filter(Boolean).length;

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href="/settings" className="hover:text-[#111827] flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Settings</span>
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-semibold">In-App Notification Preferences</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                In-App Notification Preferences
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2.5 py-0.5 rounded-full">
                WEB DASHBOARD ONLY
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Configure real-time web alerts, bell notification counter, and operational trigger thresholds.
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

        {/* Web Display & Sound Controls */}
        <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <Bell className="h-4 w-4 text-[#2563EB]" />
            <h2 className="text-sm font-bold text-[#111827]">Web Notification Behavior</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Control 1: Toast Popups */}
            <div
              onClick={() => {
                setToastEnabled(!toastEnabled);
                setSaved(false);
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                toastEnabled ? "bg-[#F0FDF4] border-[#16A34A]/30" : "bg-[#FAFAFA] border-[#E5E7EB]"
              }`}
            >
              <div>
                <div className="text-xs font-bold text-[#111827]">Live Toast Popups</div>
                <div className="text-[11px] text-[#6B7280]">Show bottom-right alert cards</div>
              </div>
              <div
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-all ${
                  toastEnabled ? "bg-[#16A34A] justify-end" : "bg-[#D1D5DB] justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
              </div>
            </div>

            {/* Control 2: Bell Icon Counter */}
            <div
              onClick={() => {
                setBadgeEnabled(!badgeEnabled);
                setSaved(false);
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                badgeEnabled ? "bg-[#F0FDF4] border-[#16A34A]/30" : "bg-[#FAFAFA] border-[#E5E7EB]"
              }`}
            >
              <div>
                <div className="text-xs font-bold text-[#111827]">Bell Counter Badge</div>
                <div className="text-[11px] text-[#6B7280]">Show unread badge in top navbar</div>
              </div>
              <div
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-all ${
                  badgeEnabled ? "bg-[#16A34A] justify-end" : "bg-[#D1D5DB] justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
              </div>
            </div>

            {/* Control 3: Sound Alerts */}
            <div
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                setSaved(false);
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                soundEnabled ? "bg-[#F0FDF4] border-[#16A34A]/30" : "bg-[#FAFAFA] border-[#E5E7EB]"
              }`}
            >
              <div>
                <div className="text-xs font-bold text-[#111827]">Critical Audio Alert</div>
                <div className="text-[11px] text-[#6B7280]">Chime sound on emergency stockouts</div>
              </div>
              <div
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-all ${
                  soundEnabled ? "bg-[#16A34A] justify-end" : "bg-[#D1D5DB] justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Web Trigger Alert Categories */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs divide-y divide-[#F3F4F6]">
          <div className="p-4 bg-[#FAFAFA] border-b border-[#E5E7EB] flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Active Supply Chain Web Triggers
            </h2>
            <span className="text-[11px] text-[#6B7280]">
              {activeCount} of {ALERT_DEFINITIONS.length} Triggers Active
            </span>
          </div>

          {ALERT_DEFINITIONS.map((item) => {
            const Icon = ALERT_ICONS[item.id] || Bell;
            const isEnabled = enabledTriggers[item.id] ?? true;

            return (
              <div
                key={item.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F9FAFB]/60 transition-colors"
              >
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
                            ? "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20"
                            : item.severity === "High"
                            ? "bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/20"
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

                {/* Clean Toggle Switch */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`text-xs font-semibold ${
                      isEnabled ? "text-[#16A34A]" : "text-[#9CA3AF]"
                    }`}
                  >
                    {isEnabled ? "Active" : "Disabled"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggle(item.id)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-all cursor-pointer ${
                      isEnabled ? "bg-[#111827] justify-end" : "bg-[#E5E7EB] justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
