import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";

export function CTASection() {
  return (
    <section id="demo" className="px-4 sm:px-6 lg:px-8 py-28 bg-white border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-[1280px]">
        {/* Cal.com Large Dark Rounded Banner with ScrollReveal */}
        <ScrollReveal animation="scale-up" duration={700}>
          <div className="rounded-3xl bg-[#111827] text-white p-10 sm:p-16 lg:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-4xl mx-auto">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#1F2937] px-4 py-1.5 text-xs font-bold text-[#9CA3AF] mb-6 border border-[#374151]">
                <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                <span>Enterprise Ready • SOC2 Certified • Sub-Second Sync</span>
              </div>

              {/* Massive Bold Headline */}
              <h2 className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight text-white leading-[1.06]">
                See supply chain risks before they become problems.
              </h2>

              <p className="mt-6 text-lg sm:text-xl text-[#9CA3AF] max-w-2xl mx-auto leading-relaxed">
                Transform your inventory visibility, eliminate unexpected stockouts, and equip your
                operations team with autonomous AI copilots.
              </p>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="#demo"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-[#111827] shadow-sm hover:bg-[#F3F4F6] active:scale-[0.98] transition-all"
                >
                  <span>Get started free</span>
                  <ChevronRight className="h-4 w-4 text-[#111827]" />
                </Link>

                <Link
                  href="#demo"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[#374151] bg-[#1F2937] px-8 py-4 text-base font-bold text-white shadow-xs hover:bg-[#374151] active:scale-[0.98] transition-all"
                >
                  <span>Book a demo</span>
                  <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
                </Link>
              </div>

              {/* Micro guarantees */}
              <div className="mt-10 pt-8 border-t border-[#374151] flex flex-wrap items-center justify-center gap-8 text-sm text-[#9CA3AF] font-medium">
                <span>✓ 2-Minute Connector Setup</span>
                <span>✓ Compatible with SAP, NetSuite & Oracle</span>
                <span>✓ 14-Day Enterprise Risk Pilot</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
