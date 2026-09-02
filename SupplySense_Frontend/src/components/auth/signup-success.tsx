"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Building2 } from "lucide-react";
import { ENTERPRISE_ROLES, UserRole } from "@/data/roles-data";

interface SignupSuccessProps {
  fullName: string;
  companyName: string;
  role: UserRole;
}

export function SignupSuccess({ fullName, companyName, role }: SignupSuccessProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const selectedRoleMeta = ENTERPRISE_ROLES.find((r) => r.id === role) || ENTERPRISE_ROLES[0];

  useEffect(() => {
    if (countdown <= 0) {
      router.push("/dashboard");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="space-y-6 text-center py-4">
      {/* Top Success Badge */}
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/25 shadow-xs">
        <CheckCircle2 className="h-7 w-7" />
      </div>

      {/* Main Title & Subtitle */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold border border-[#2563EB]/20">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Tenant Provisioned</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
          Workspace Created Successfully
        </h2>
        <p className="text-sm text-[#4B5563] max-w-sm mx-auto">
          Welcome aboard, <strong className="text-[#111827]">{fullName}</strong>. Your enterprise instance for{" "}
          <strong className="text-[#111827]">{companyName}</strong> is ready.
        </p>
      </div>

      {/* Provisioned Configuration Summary Card */}
      <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 text-left space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] text-xs">
          <span className="text-[#6B7280]">Assigned Role</span>
          <span className="font-semibold text-[#111827] flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#2563EB]" />
            {selectedRoleMeta.title}
          </span>
        </div>

        <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] text-xs">
          <span className="text-[#6B7280]">Workspace URL</span>
          <span className="font-mono text-[11px] text-[#111827] flex items-center gap-1">
            <Building2 className="h-3 w-3 text-[#6B7280]" />
            {companyName.toLowerCase().replace(/[^a-z0-9]/g, "") || "org"}.supplysense.io
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[#6B7280]">Security Status</span>
          <span className="text-[11px] text-[#16A34A] font-medium flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#16A34A] animate-pulse" />
            Zero-Trust Isolation Active
          </span>
        </div>
      </div>

      {/* Primary CTA with Countdown Indicator */}
      <div className="space-y-2 pt-2">
        <Link
          href="/dashboard"
          className="w-full h-11 rounded-xl bg-[#111827] text-white text-sm font-semibold shadow-xs hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Go to Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={`/onboarding?role=${role}`}
          className="w-full h-10 rounded-xl border border-[#E5E7EB] bg-white text-[#374151] text-xs font-medium hover:bg-[#F9FAFB] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Optional: Guided Role Setup</span>
        </Link>
        <p className="text-[11px] text-[#9CA3AF]">
          Automatically redirecting to dashboard in {countdown}s...
        </p>
      </div>
    </div>
  );
}
