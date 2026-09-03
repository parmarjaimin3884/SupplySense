"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/logo";

interface AuthCenteredLayoutProps {
  children: React.ReactNode;
}

export function AuthCenteredLayout({ children }: AuthCenteredLayoutProps) {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col justify-between bg-[#F9FAFB] text-[#111827] px-4 py-8 sm:py-12">
      {/* Top Bar with Brand Logo */}
      <div className="w-full max-w-md mx-auto flex items-center justify-center">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <Logo size="lg" />
        </Link>
      </div>

      {/* Main Centered Auth Card */}
      <div className="w-full max-w-[440px] mx-auto my-auto">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          {children}
        </div>
      </div>

      {/* Bottom Footer Details */}
      <div className="w-full max-w-md mx-auto text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs text-[#6B7280]">
          <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
          <span>SOC-2 Type II Certified & End-to-End Encrypted</span>
        </div>
        <p className="text-[11px] text-[#9CA3AF]">
          © {new Date().getFullYear()} SupplySense Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
}
