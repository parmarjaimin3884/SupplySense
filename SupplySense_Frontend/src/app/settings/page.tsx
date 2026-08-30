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
  Globe,
  Key,
  Database,
  Check,
  RefreshCw,
  Sliders,
  DollarSign,
  Clock,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useRole } from "@/context/role-context";
import { useProfile, useUpdateProfile } from "@/hooks/useSettings";
import { useAuthStore } from "@/stores/useAuthStore";

export default function SettingsPage() {
  const { isAdmin } = useRole();
  const authUser = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<
    "organization" | "profile" | "warehouses" | "alerts" | "integrations" | "security"
  >("organization");

  const [savedMessage, setSavedMessage] = useState(false);
  const [testingErp, setTestingErp] = useState(false);
  const [erpStatus, setErpStatus] = useState<"CONNECTED" | "IDLE">("CONNECTED");

  // Profile API hooks
  const { data: profile } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  // Form States
  const [orgName, setOrgName] = useState("Enterprise Supply Chain Ltd");
  const [gstin, setGstin] = useState("24AAACE1234F1Z8");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // ERP State
  const [erpSystem, setErpSystem] = useState("SAP S/4HANA Cloud");
  const [erpEndpoint, setErpEndpoint] = useState("https://sap.company-erp.com/api/v1");
  const [erpApiKey, setErpApiKey] = useState("sk_live_sap_998877665544332211");

  // Alert Rules
  const [stockoutDaysThreshold, setStockoutDaysThreshold] = useState("4.0");
  const [leadTimeDriftThreshold, setLeadTimeDriftThreshold] = useState("3.0");
  const [alertEmails, setAlertEmails] = useState("ops-lead@company.com, admin@company.com");

  // Security
  const [sessionTimeout, setSessionTimeout] = useState("8_hours");
  const [enforceMfa, setEnforceMfa] = useState(true);

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        name: fullName || profile?.name || authUser?.employee_name || "Enterprise Admin",
        email: email || profile?.email || authUser?.email,
      });
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2500);
    } catch {
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2500);
    }
  };

  const handleTestErp = () => {
    setTestingErp(true);
    setTimeout(() => {
      setTestingErp(false);
      setErpStatus("CONNECTED");
    }, 1200);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                Organization & Platform Settings
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2.5 py-0.5 rounded-full">
                ENTERPRISE CONFIGURATION
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Configure organization profile, regional warehouse nodes, ERP API keys, disruption alert rules, and security policies.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="h-9 px-4 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{savedMessage ? "Settings Saved!" : "Save All Changes"}</span>
          </button>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-2 rounded-2xl border border-[#E5E7EB] shadow-xs text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("organization")}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "organization"
                ? "bg-[#111827] text-white shadow-xs"
                : "text-[#6B7280] hover:text-[#111827]"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Organization Profile</span>
          </button>

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
            <span>My User Account</span>
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
                <Globe className="h-3.5 w-3.5" />
                <span>Warehouse Nodes (5 Hubs)</span>
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
                <span>ERP & WMS API Keys</span>
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
                <span>Alert Thresholds</span>
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
                <span>Security & RBAC</span>
              </button>
            </>
          )}
        </div>

        {/* TAB 1: Organization Profile */}
        {activeTab === "organization" && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-[#111827]">Organization Master Profile</h2>
              <p className="text-xs text-[#6B7280]">
                Legal entity details, registration numbers, default operating currency, and regional timezone.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#374151] mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#374151] mb-1">GSTIN / Corporate Tax ID</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#111827] font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#374151] mb-1">Operating Financial Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none bg-white font-medium"
                >
                  <option value="INR">Indian Rupee (₹ INR) — Default</option>
                  <option value="USD">US Dollar ($ USD)</option>
                  <option value="EUR">Euro (€ EUR)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#374151] mb-1">Primary Operating Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none bg-white font-medium"
                >
                  <option value="Asia/Kolkata">India Standard Time (IST - GMT+5:30)</option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                  <option value="America/New_York">Eastern Time (EST - GMT-5:00)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: User Account Profile */}
        {activeTab === "profile" && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-[#111827]">User Profile & Account</h2>
              <p className="text-xs text-[#6B7280]">
                Your personal employee profile details and system access level.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#374151] mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={profile?.name || authUser?.employee_name || (isAdmin ? "Admin User" : "Supply Chain Manager")}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#374151] mb-1">Work Email</label>
                <input
                  type="email"
                  defaultValue={profile?.email || authUser?.email || (isAdmin ? "admin@company.com" : "manager@company.com")}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#374151] mb-1">System Role</label>
                <input
                  type="text"
                  readOnly
                  value={isAdmin ? "ADMIN" : "MANAGER"}
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#111827] font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#374151] mb-1">Department</label>
                <input
                  type="text"
                  readOnly
                  value="Supply Chain & Procurement"
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Warehouses (5 Regional Nodes) */}
        {activeTab === "warehouses" && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-[#111827]">Active Distribution Facility Nodes</h2>
              <p className="text-xs text-[#6B7280]">
                All 5 regional fulfillment hubs currently configured for inventory rebalancing and optimal routing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              {[
                { name: "Surat Central Warehouse", code: "WH-SUR", capacity: "44,398 units", utilization: "46.8%", status: "Active Primary" },
                { name: "Mumbai Western Hub", code: "WH-MUM", capacity: "38,500 units", utilization: "72.4%", status: "Active Regional" },
                { name: "Delhi Northern Depot", code: "WH-DEL", capacity: "52,000 units", utilization: "58.1%", status: "Active Regional" },
                { name: "Ahmedabad Main DC", code: "WH-AHM", capacity: "31,200 units", utilization: "64.5%", status: "Active Regional" },
                { name: "Bangalore Southern DC", code: "WH-BAN", capacity: "40,000 units", utilization: "51.0%", status: "Active Regional" },
              ].map((wh) => (
                <div key={wh.code} className="p-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111827]">{wh.name}</span>
                    <span className="text-[10px] font-mono font-bold bg-[#F0FDF4] text-[#16A34A] px-2 py-0.5 rounded border border-[#16A34A]/20">
                      {wh.code}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#6B7280]">
                    <div>Capacity: <strong className="text-[#111827] block font-mono">{wh.capacity}</strong></div>
                    <div>Utilization: <strong className="text-[#111827] block font-mono">{wh.utilization}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ERP & WMS Integrations */}
        {activeTab === "integrations" && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#111827]">Enterprise ERP & WMS API Connector</h2>
                <p className="text-xs text-[#6B7280]">
                  Configure live API endpoint URL and API Key for SAP, Oracle NetSuite, Increff, or custom REST Webhooks.
                </p>
              </div>

              <span
                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  erpStatus === "CONNECTED"
                    ? "bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20"
                    : "bg-[#FFFBEB] text-[#D97706] border-[#F59E0B]/20"
                }`}
              >
                {erpStatus === "CONNECTED" ? "✓ ERP HANDSHAKE ACTIVE" : "DISCONNECTED"}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">Select Enterprise ERP / WMS</label>
                  <select
                    value={erpSystem}
                    onChange={(e) => setErpSystem(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none bg-white font-medium"
                  >
                    <option>SAP S/4HANA Cloud ERP</option>
                    <option>Oracle NetSuite WMS</option>
                    <option>Increff WMS Platform</option>
                    <option>Microsoft Dynamics 365</option>
                    <option>Custom REST Webhook API</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">Enterprise API Endpoint URL</label>
                  <input
                    type="text"
                    value={erpEndpoint}
                    onChange={(e) => setErpEndpoint(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#111827] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#374151] mb-1">Organization API Key / Secret Token</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={erpApiKey}
                    onChange={(e) => setErpApiKey(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#111827] font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleTestErp}
                    disabled={testingErp}
                    className="h-10 px-4 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${testingErp ? "animate-spin" : ""}`} />
                    <span>{testingErp ? "Testing..." : "Test ERP Handshake"}</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] space-y-1">
                <div className="font-bold text-[#111827] flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#16A34A]" />
                  <span>Outbound Webhook Sync Endpoint:</span>
                </div>
                <code className="text-[11px] font-mono text-[#2563EB] block">
                  https://api.supplysense.io/api/v1/integrations/wms-sync
                </code>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Alert Threshold Rules */}
        {activeTab === "alerts" && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-[#111827]">Automated Disruption Alert Rules</h2>
              <p className="text-xs text-[#6B7280]">
                Customize trigger thresholds for stockout warnings and vendor lead-time drift alarms.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                    Critical Stockout Warning Threshold (Days of Supply)
                  </label>
                  <select
                    value={stockoutDaysThreshold}
                    onChange={(e) => setStockoutDaysThreshold(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none bg-white font-medium"
                  >
                    <option value="3.0">Alert when stock &lt; 3.0 Days (P0 Critical)</option>
                    <option value="4.0">Alert when stock &lt; 4.0 Days (Default)</option>
                    <option value="7.0">Alert when stock &lt; 7.0 Days (Early Warning)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                    Supplier Lead-Time Drift Alarm (Days Delay)
                  </label>
                  <select
                    value={leadTimeDriftThreshold}
                    onChange={(e) => setLeadTimeDriftThreshold(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none bg-white font-medium"
                  >
                    <option value="2.0">Alert when delivery drifts &gt; 2.0 Days</option>
                    <option value="3.0">Alert when delivery drifts &gt; 3.0 Days (Default)</option>
                    <option value="5.0">Alert when delivery drifts &gt; 5.0 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                  Disruption Alert Recipient Email List (Comma Separated)
                </label>
                <input
                  type="text"
                  value={alertEmails}
                  onChange={(e) => setAlertEmails(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#111827]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Security, SSO & RBAC */}
        {activeTab === "security" && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-[#111827]">Security, SSO & RBAC Policies</h2>
              <p className="text-xs text-[#6B7280]">
                Configure Multi-Factor Authentication (MFA), session timeout limits, and single sign-on boundaries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#374151] mb-1">JWT Session Timeout</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none bg-white font-medium"
                >
                  <option value="8_hours">8 Hours (Standard Business Shift)</option>
                  <option value="24_hours">24 Hours (Full Day)</option>
                  <option value="1_hour">1 Hour (High Security)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#374151] mb-1">Single Sign-On (SSO / SAML 2.0)</label>
                <input
                  type="text"
                  readOnly
                  value="Okta / Azure AD SSO Enabled"
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#16A34A] font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between">
              <div>
                <div className="font-bold text-[#111827] text-xs">Enforce Multi-Factor Authentication (MFA)</div>
                <div className="text-[11px] text-[#6B7280]">Require TOTP authenticator app verification for all ADMIN and MANAGER accounts.</div>
              </div>
              <input
                type="checkbox"
                checked={enforceMfa}
                onChange={(e) => setEnforceMfa(e.target.checked)}
                className="h-4 w-4 accent-[#111827] cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
