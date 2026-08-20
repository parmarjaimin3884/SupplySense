"use client";

import { useState } from "react";
import Link from "next/link";
import { Boxes, ChevronDown, ChevronRight, Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2 sticky top-0 z-50 bg-gradient-to-b from-white/95 via-white/50 to-transparent backdrop-blur-[2px] transition-all">
      <header className="mx-auto max-w-[1280px] rounded-2xl border border-[#E5E7EB] bg-white px-6 py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#111827] text-white">
              <Boxes className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#111827]">
              SupplySense
            </span>
          </Link>

          {/* Center Navigation Links (Cal.com text-sm font-semibold) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[#4B5563]">
            <div className="relative group cursor-pointer flex items-center gap-1 hover:text-[#111827] transition-colors">
              <span>Solutions</span>
              <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
            </div>
            <Link href="#features" className="hover:text-[#111827] transition-colors">
              Enterprise
            </Link>
            <Link href="#intelligence" className="hover:text-[#111827] transition-colors flex items-center gap-1.5">
              <span>Intelligence</span>
              <span className="rounded-full bg-[#111827] text-white text-[10px] px-2 py-0.5 font-mono font-bold">
                PRO
              </span>
            </Link>
            <Link href="/dashboard" className="text-[#2563EB] font-bold hover:text-[#1D4ED8] transition-colors flex items-center gap-1">
              <span>Live App</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] animate-pulse" />
            </Link>
            <Link href="#comparison" className="hover:text-[#111827] transition-colors">
              Pricing
            </Link>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-5">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#4B5563] hover:text-[#111827] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-1.5 rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-black transition-all active:scale-[0.98]"
          >
            <span>Get started</span>
            <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-[#4B5563] hover:bg-[#F3F4F6]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="mx-auto max-w-[1280px] px-4 pb-4 lg:hidden">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white/95 backdrop-blur-md p-5 shadow-lg">
          <nav className="flex flex-col gap-3 text-base font-semibold text-[#4B5563]">
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#111827]"
            >
              Solutions
            </Link>
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#111827]"
            >
              Enterprise
            </Link>
            <Link
              href="#agents"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#111827]"
            >
              AI Agents
            </Link>
            <Link
              href="#showcase"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#111827]"
            >
              Platform
            </Link>
            <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex flex-col gap-3">
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-xl bg-[#111827] py-3 text-sm font-bold text-white"
              >
                Get started
              </Link>
            </div>
          </nav>
        </div>
      </div>
      )}
    </div>
  );
}
