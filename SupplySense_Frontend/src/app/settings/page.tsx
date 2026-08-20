"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings,
  User,
  Bell,
  Building2,
  AlertTriangle,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Save,
  Radio,
  Lock,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useRole } from "@/context/role-context";
import { useProfile, useUpdateProfile, usePreferences, useUpdatePreferences } from "@/hooks/useSettings";
import { useAuthStore } from "@/stores/useAuthStore";

export default function SettingsPage() {
  const { isAdmin, role } = useRole();
  const authUser = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<
    "profile" | "warehouses" | "alerts" | "integrations" | "security"
  >("profile");

  const [savedMessage, setSavedMessage] = useState(false);

  // Settings API hooks
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const { data: preferences } = usePreferences();
  const updatePreferencesMutation = useUpdatePreferences();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        name: fullName || profile?.name || authUser?.employee_name || "Enterprise User",
        email: email || profile?.email || authUser?.email,
      });
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2000);
    } catch {
      // Show feedback
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
              Platform & Workspace Settings
            </h1>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Manage enterprise tenant configurations, warehouse node topology, ERP connectors, and alerting rules.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="h-9 px-4 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{savedMessage ? "Saved!" : "Save Changes"}</span>
          </button>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-2 rounded-2xl border border-[#E5E7EB] shadow-xs text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "profile"
                ? "bg-[#111827] text-white shadow-xs"
                : "text-[#6B7280] hover:text-[#111827]"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile & Account</span>
          </button>

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("warehouses")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "warehouses"
                    ? "bg-[#111827] text-white shadow-xs"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Warehouse Topology</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("alerts")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "alerts"
                    ? "bg-[#111827] text-white shadow-xs"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Alert Rules</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("integrations")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "integrations"
                    ? "bg-[#111827] text-white shadow-xs"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>ERP & Integrations</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "security"
                    ? "bg-[#111827] text-white shadow-xs"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Security & SSO</span>
              </button>
            </>
          )}
        </div>

        {/* TAB 1: Profile */}
        {activeTab === "profile" && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#111827]">User Profile Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#374151] mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={profile?.name || authUser?.employee_name || (isAdmin ? "Alex Sterling" : "Sarah Chen")}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#374151] mb-1">Work Email</label>
                <input
                  type="email"
                  defaultValue={profile?.email || authUser?.email || (isAdmin ? "alex.sterling@enterprise.com" : "sarah.chen@enterprise.com")}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#374151] mb-1">Assigned Role</label>
                <input
                  type="text"
                  readOnly
                  value={profile?.role || authUser?.role || "OPERATIONS_MANAGER"}
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#374151] mb-1">Department</label>
                <input
                  type="text"
                  readOnly
                  value={profile?.department || "Supply Chain Operations"}
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Warehouses (Admin Only) */}
        {activeTab === "warehouses" && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#111827]">Active Distribution Facility</h2>
                <p className="text-xs text-[#6B7280]">Primary operational warehouse configured for Version 1 telemetry.</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2 py-0.5 rounded-full">
                SINGLE-HUB OPERATION
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl border border-[#2563EB]/30 bg-[#EFF6FF]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#111827]">Surat Central Warehouse (WH-SUR)</div>
                  <span className="text-[10px] font-mono font-bold bg-[#F0FDF4] text-[#16A34A] px-2 py-0.2 rounded border border-[#16A34A]/20">Active Primary</span>
                </div>
                <div className="text-[11px] text-[#4B5563]">Primary Distribution & Logistics Center</div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#6B7280] pt-1">
                  <div>Capacity: <strong className="text-[#111827]">44,398 units</strong></div>
                  <div>Utilization: <strong className="text-[#111827]">46.89%</strong></div>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] space-y-2 opacity-80">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#111827]">Regional Multi-DC Expansion</div>
                  <span className="text-[10px] font-mono text-[#6B7280] bg-white px-2 py-0.2 rounded border border-[#E5E7EB]">Version 2</span>
                </div>
                <div className="text-[11px] text-[#6B7280]">Additional regional warehouse routing nodes (North, South, East) will activate in Version 2.</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Alert Rules (Admin Only) */}
        {activeTab === "alerts" && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#111827]">Automated Disruption Trigger Rules</h2>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#111827]">Critical Stockout Warning (P0)</div>
                  <div className="text-[11px] text-[#6B7280]">Trigger when days of supply &lt; 3.0 days</div>
                </div>
                <span className="font-mono text-[#16A34A] font-bold">Enabled</span>
              </div>
              <div className="p-3.5 rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#111827]">Supplier Lead Time Drift Alarm (P1)</div>
                  <div className="text-[11px] text-[#6B7280]">Trigger when vendor SLA drifts &gt; 5.0 days</div>
                </div>
                <span className="font-mono text-[#16A34A] font-bold">Enabled</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Integrations (Admin Only) */}
        {activeTab === "integrations" && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#111827]">Connected Enterprise Systems</h2>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#111827]">SAP S/4HANA Cloud ERP</div>
                  <div className="text-[11px] text-[#6B7280]">Real-time PO ledger & SKU master synchronization</div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20 px-2 py-0.5 rounded">
                  Connected
                </span>
              </div>
              <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#111827]">Oracle NetSuite WMS</div>
                  <div className="text-[11px] text-[#6B7280]">Multi-DC warehouse bin tracking and dispatch sync</div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20 px-2 py-0.5 rounded">
                  Connected
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Security (Admin Only) */}
        {activeTab === "security" && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#111827]">Security, SSO & Compliance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] space-y-1">
                <div className="font-bold text-[#111827]">SOC-2 Type II Certified</div>
                <div className="text-[11px] text-[#6B7280]">Continuous automated audit logs enabled</div>
              </div>
              <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] space-y-1">
                <div className="font-bold text-[#111827]">256-bit TLS Encryption</div>
                <div className="text-[11px] text-[#6B7280]">Zero-Trust token boundaries active</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
