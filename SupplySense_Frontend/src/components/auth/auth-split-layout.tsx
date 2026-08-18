"use client";

import Link from "next/link";
import { Boxes, Sparkles, Shield, Lock, CheckCircle2 } from "lucide-react";
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
    <div className="min-h-[100dvh] w-full flex bg-[#FAFAFA] text-[#111827]">
      {/* LEFT PANEL (60% on desktop): Large Product Showcase */}
      <div className="hidden lg:flex lg:w-[60%] flex-col justify-between p-8 xl:p-12 border-r border-[#E5E7EB] bg-[#F9FAFB] relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div 
          className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#E5E7EB 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111827] text-white shadow-xs group-hover:bg-black transition-colors">
              <Boxes className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#111827]">
              SupplySense
            </span>
          </Link>
        </div>

        {/* Center: Value Prop + Large Real Dashboard Showcase */}
        <div className="relative z-10 my-auto py-6 w-full max-w-2xl">
          <div className="space-y-3 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#2563EB]/20 text-[#2563EB] text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{badge}</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-[#111827] leading-[1.15]">
              {headline}
            </h1>

            <p className="text-sm xl:text-base text-[#4B5563] leading-relaxed max-w-[60ch]">
              {description}
            </p>
          </div>

          {/* Large Dashboard Showcase Preview */}
          <div className="w-full">
            <AuthDashboardPreview mode={previewMode} />
          </div>
        </div>

        {/* Bottom: Enterprise Trust & Compliance Strip */}
        <div className="relative z-10 pt-4 border-t border-[#E5E7EB]/80 flex items-center justify-between text-xs text-[#6B7280]">
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

      {/* RIGHT PANEL (40% on desktop): Role Selection & Account Creation */}
      <div className="flex-1 lg:w-[40%] flex flex-col justify-between p-6 sm:p-10 lg:p-10 xl:p-12 bg-white overflow-y-auto">
        {/* Mobile-only Top Brand Header */}
        <div className="flex lg:hidden items-center justify-between pb-6 mb-2 border-b border-[#E5E7EB]">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111827] text-white">
              <Boxes className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#111827]">
              SupplySense
            </span>
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
