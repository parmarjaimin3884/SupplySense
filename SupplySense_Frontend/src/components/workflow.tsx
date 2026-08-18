import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Workflow() {
  const steps = [
    {
      num: "01",
      title: "Connect your ERP & WMS",
      description:
        "We'll handle all the cross-referencing, multi-node sync, and lead-time drift so you don't have to worry about blind spots.",
    },
    {
      num: "02",
      title: "Set your buffer rules",
      description:
        "Want to protect seasonal spikes? Set customized Days of Supply targets and safety buffers. We make that easy.",
    },
    {
      num: "03",
      title: "Choose how to mitigate",
      description:
        "It could be an automated 1-click inter-DC transfer, dual-sourcing split, or expedited air freight before lines stall.",
    },
  ];

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-28 bg-[#F9FAFB]">
      <div className="mx-auto max-w-[1280px]">
        {/* Cal.com Centered Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFFFF] px-4 py-1.5 text-xs font-bold text-[#111827] mb-5 border border-[#E5E7EB] shadow-xs">
            <span className="text-xs">🏷️</span>
            <span>How it works</span>
          </div>

          {/* Cal.com Large Section Headline */}
          <h2 className="text-4xl sm:text-5xl md:text-[56px] font-extrabold tracking-tight text-[#111827] leading-[1.08]">
            With us, supply chain intelligence is easy
          </h2>

          <p className="mt-5 text-lg sm:text-xl text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            Effortless inventory & risk monitoring for operations and procurement, powerful automated
            solutions for fast-growing modern enterprises.
          </p>

          {/* Action Button Row */}
          <div className="mt-8 flex items-center justify-center gap-3.5">
            <Link
              href="#demo"
              className="flex items-center gap-1.5 rounded-xl bg-[#111827] px-6 py-3 text-sm font-bold text-white shadow-xs hover:bg-black active:scale-[0.98] transition-all"
            >
              <span>Get started</span>
              <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
            </Link>

            <Link
              href="#demo"
              className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-6 py-3 text-sm font-bold text-[#111827] shadow-xs hover:bg-[#F3F4F6] transition-all"
            >
              <span>Book a demo</span>
              <ChevronRight className="h-4 w-4 text-[#6B7280]" />
            </Link>
          </div>
        </div>

        {/* 3 Step Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-[#E5E7EB] bg-white p-9 shadow-[0_2px_14px_rgba(0,0,0,0.02)] hover:border-[#D1D5DB] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Step number badge (01, 02, 03) */}
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F3F4F6] text-xs font-bold text-[#4B5563]">
                  {step.num}
                </div>

                {/* Bold Step Title */}
                <h3 className="text-2xl font-extrabold text-[#111827] mt-6 tracking-tight">
                  {step.title}
                </h3>

                {/* Step Body */}
                <p className="mt-3.5 text-base text-[#6B7280] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
