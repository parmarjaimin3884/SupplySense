"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Boxes,
  CheckCircle2,
  ChevronRight,
  Shield,
  Radio,
  Sliders,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Lock,
  Plus,
} from "lucide-react";
import { ENTERPRISE_ROLES, UserRole, RoleDefinition } from "@/data/roles-data";

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const roleParam = (searchParams.get("role") as UserRole) || "admin";
  const [currentRole, setCurrentRole] = useState<UserRole>(
    roleParam === "inventory_manager" ? "inventory_manager" : "admin"
  );

  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    step_0: true, // First step pre-active
  });

  // Admin dynamic mock states
  const [teamMembers, setTeamMembers] = useState([
    { email: "marcus.vance@supply.io", role: "Inventory Lead" },
  ]);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  // Inventory Manager dynamic mock states
  const [safetyBufferDays, setSafetyBufferDays] = useState(7);
  const [activeDCLocations, setActiveDCLocations] = useState(["Surat Central Warehouse (WH-SUR)"]);

  const currentRoleMeta: RoleDefinition = useMemo(() => {
    return ENTERPRISE_ROLES.find((r) => r.id === currentRole) || ENTERPRISE_ROLES[0];
  }, [currentRole]);

  const steps = currentRoleMeta.onboarding.steps;
  const totalSteps = steps.length;
  const completedCount = steps.filter((_, idx) => completedSteps[`step_${idx}`]).length;
  const isAllComplete = completedCount === totalSteps;

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [`step_${idx}`]: !prev[`step_${idx}`],
    }));
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail || !newMemberEmail.includes("@")) return;
    setTeamMembers((prev) => [...prev, { email: newMemberEmail, role: "Inventory Lead" }]);
    setNewMemberEmail("");
    setCompletedSteps((prev) => ({ ...prev, step_1: true }));
  };

  return (
    <div className="min-h-[100dvh] bg-[#F9FAFB] text-[#111827] flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#111827] text-white">
                <Boxes className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#111827]">
                SupplySense
              </span>
            </Link>
            <span className="text-xs text-[#6B7280]">/</span>
            <span className="text-xs font-semibold text-[#111827]">Onboarding Setup</span>
          </div>

          {/* Role Switcher Pill (Admin vs Inventory Manager) */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B7280] hidden sm:inline">Role View:</span>
            <select
              value={currentRole}
              onChange={(e) => {
                const newRole = e.target.value as UserRole;
                setCurrentRole(newRole);
                setCompletedSteps({ step_0: true });
                router.replace(`/onboarding?role=${newRole}`);
              }}
              className="text-xs font-semibold bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10 cursor-pointer"
            >
              <option value="admin">Admin</option>
              <option value="inventory_manager">Inventory Manager</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Workspace Setup Container */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1">
        {/* Role Onboarding Header */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#111827] text-white text-xs font-mono font-medium">
              <Shield className="h-3 w-3" />
              {currentRoleMeta.title} Profile
            </span>
            <span className="text-xs font-mono text-[#6B7280]">
              {completedCount} of {totalSteps} tasks configured
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
            {currentRoleMeta.onboarding.title}
          </h1>
          <p className="text-sm sm:text-base text-[#4B5563] max-w-2xl">
            {currentRoleMeta.onboarding.subtitle}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden mt-4">
            <div
              className="bg-[#111827] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(completedCount / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Dynamic Role-Based Setup Modules */}
        <div className="space-y-6">
          {/* STEP 1 */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#F3F4F6]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111827] text-white text-[11px] font-bold">
                    1
                  </span>
                  <h2 className="text-base font-bold text-[#111827]">
                    {steps[0]?.title}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[#6B7280]">
                  {steps[0]?.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleStep(0)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  completedSteps.step_0
                    ? "bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20"
                    : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{completedSteps.step_0 ? "Completed" : "Mark Done"}</span>
              </button>
            </div>

            {/* Step 1 Interactive Content */}
            <div className="pt-4 text-xs">
              {currentRole === "admin" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA]">
                    <div className="font-semibold text-[#111827] mb-1">Organization Name</div>
                    <div className="font-mono text-[#4B5563]">Apex Global Operations</div>
                  </div>
                  <div className="p-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA]">
                    <div className="font-semibold text-[#111827] mb-1">SSO Policy</div>
                    <div className="text-[#16A34A] font-medium flex items-center gap-1">
                      <Lock className="h-3 w-3" /> SAML / Okta Enforced
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA]">
                    <div className="font-semibold text-[#111827] mb-1">Audit Logging</div>
                    <div className="text-[#2563EB] font-medium">SOC-2 Continuous Trail</div>
                  </div>
                </div>
              )}

              {currentRole === "inventory_manager" && (
                <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#111827]">Safety Buffer Threshold (Days of Supply)</span>
                    <span className="font-mono font-bold text-[#2563EB]">{safetyBufferDays} Days</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={21}
                    value={safetyBufferDays}
                    onChange={(e) => setSafetyBufferDays(Number(e.target.value))}
                    className="w-full accent-[#111827] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#6B7280]">
                    <span>Lean (3d)</span>
                    <span>Standard (7d)</span>
                    <span>High Resilience (21d)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2 */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#F3F4F6]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111827] text-white text-[11px] font-bold">
                    2
                  </span>
                  <h2 className="text-base font-bold text-[#111827]">
                    {steps[1]?.title}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[#6B7280]">
                  {steps[1]?.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleStep(1)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  completedSteps.step_1
                    ? "bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20"
                    : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{completedSteps.step_1 ? "Completed" : "Mark Done"}</span>
              </button>
            </div>

            {/* Step 2 Interactive Content */}
            <div className="pt-4 text-xs">
              {currentRole === "admin" && (
                <div className="space-y-3">
                  <form onSubmit={handleAddMember} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="teammate@company.com"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-lg border border-[#E5E7EB] text-xs bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#111827]/10"
                    />
                    <button
                      type="submit"
                      className="h-9 px-3.5 bg-[#111827] text-white rounded-lg font-semibold flex items-center gap-1 hover:bg-black"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Invite</span>
                    </button>
                  </form>

                  <div className="divide-y divide-[#F3F4F6] border border-[#E5E7EB] rounded-xl overflow-hidden bg-white">
                    {teamMembers.map((m) => (
                      <div key={m.email} className="p-2.5 flex items-center justify-between">
                        <span className="font-mono text-[#111827]">{m.email}</span>
                        <span className="px-2 py-0.5 rounded bg-[#F3F4F6] text-[#4B5563] text-[10px] font-semibold">
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentRole === "inventory_manager" && (
                <div className="space-y-2">
                  <div className="font-semibold text-[#111827]">Active Distribution Centers</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {["Surat Central Warehouse (WH-SUR)", "Hazira Inbound Customs Terminal"].map((node) => (
                      <div
                        key={node}
                        className="p-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-[#111827]">{node}</div>
                          <div className="text-[10px] text-[#16A34A] font-mono">Status: Connected</div>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 3 */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#F3F4F6]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111827] text-white text-[11px] font-bold">
                    3
                  </span>
                  <h2 className="text-base font-bold text-[#111827]">
                    {steps[2]?.title}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[#6B7280]">
                  {steps[2]?.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleStep(2)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  completedSteps.step_2
                    ? "bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20"
                    : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{completedSteps.step_2 ? "Completed" : "Mark Done"}</span>
              </button>
            </div>

            {/* Step 3 Content */}
            <div className="pt-4 text-xs">
              <div className="p-4 rounded-xl border border-[#2563EB]/20 bg-[#EFF6FF]/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB] text-white">
                    <Radio className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#111827]">Autonomous Telemetry Stream Active</div>
                    <div className="text-[11px] text-[#4B5563]">
                      Continuous risk evaluation pipeline running with sub-second latency.
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#16A34A] text-white px-2 py-1 rounded">
                  ONLINE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Action Bar */}
        <div className="mt-8 pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#6B7280]">
            {isAllComplete ? (
              <span className="text-[#16A34A] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> All onboarding requirements fulfilled.
              </span>
            ) : (
              <span>You can modify these configurations later in Workspace Settings.</span>
            )}
          </div>

          <Link
            href="/"
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#111827] text-white text-sm font-semibold shadow-xs hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Launch Command Center</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-[#111827] text-sm">
          Loading workspace onboarding...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
