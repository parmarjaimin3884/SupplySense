"use client";

import Link from "next/link";
import { Sparkles, Shield, Lock, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { AuthDashboardPreview } from "./auth-dashboard-preview";

interface AuthSplitLayoutProps {
  headline?: string;
  description?: string;
  badge?: string;
  previewMode?: "login" | "signup";
  children: React.ReactNode;
}

export function AuthSplitLayout({
  headline = "Prevent Stockouts Before They Happen.",
  description = "Monitor inventory, detect supply chain risks, and receive AI-powered recommendations before disruptions impact operations.",
  badge = "AI-Powered Supply Chain Intelligence",
  previewMode = "signup",
  children,
}: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden w-full flex bg-[#FAFAFA] text-[#111827]">
      {/* LEFT PANEL (50% on desktop): High-End Product Showcase */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-8 xl:p-12 border-r border-[#E5E7EB] bg-[#F9FAFB] relative overflow-hidden h-full">
        {/* Subtle grid pattern background */}
        <div 
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#E5E7EB 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />

        {/* Unified Container: Perfectly aligned Logo, Content, and Footer */}
        <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col justify-between h-full">
          {/* Top: Brand Logo (Aligned directly with headline & card below) */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <Logo size="md" />
            </Link>
          </div>

          {/* Center: Value Prop + Proportional Dashboard Showcase */}
          <div className="my-auto py-4 space-y-3.5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] border border-[#2563EB]/20 text-[#2563EB] text-[11px] font-semibold">
                <Sparkles className="h-3 w-3" />
                <span>{badge}</span>
              </div>

              <h1 className="text-2xl xl:text-[28px] font-extrabold tracking-tight text-[#111827] leading-snug">
                {headline}
              </h1>

              <p className="text-xs xl:text-sm text-[#4B5563] leading-relaxed max-w-lg">
                {description}
              </p>
            </div>

            {/* Proportional Dashboard Showcase Preview */}
            <div className="w-full pt-1">
              <AuthDashboardPreview mode={previewMode} />
            </div>
          </div>

          {/* Bottom: Enterprise Trust & Compliance Strip */}
          <div className="pt-3 border-t border-[#E5E7EB]/80 flex items-center justify-between text-xs text-[#6B7280]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" /> SOC-2 Type II
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" /> ISO 27001
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#16A34A]" /> 256-bit TLS
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#9CA3AF]">99.99% Enterprise SLA</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (50% on desktop): Auth Forms */}
      <div className="flex-1 lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-10 xl:p-14 bg-white overflow-y-auto h-full">
        {/* Mobile-only Top Brand Header */}
        <div className="flex lg:hidden items-center justify-between pb-6 mb-2 border-b border-[#E5E7EB]">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>
          <span className="text-xs text-[#6B7280] font-medium">Enterprise Auth</span>
        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-lg mx-auto my-auto py-2">
          {children}
        </div>

        {/* Minimal Footer Note */}
        <div className="w-full max-w-lg mx-auto pt-6 text-center text-xs text-[#9CA3AF]">
          Protected by enterprise reCAPTCHA & SupplySense Zero-Trust Security.
        </div>
      </div>
    </div>
  );
}
