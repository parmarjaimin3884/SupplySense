import {
  Boxes,
  TrendingDown,
  ShieldAlert,
  LineChart,
  Cpu,
  BellRing,
  ChevronRight,
} from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";

export function Solutions() {
  const features = [
    {
      num: "01",
      icon: Boxes,
      title: "Real-Time Inventory Mesh",
      description:
        "Sub-second multi-node synchronization across ERPs, WMS, and 3PL nodes. Track on-hand and net-available stock in real time.",
      badge: "Unified View",
    },
    {
      num: "02",
      icon: TrendingDown,
      title: "Predictive Stockout Radar",
      description:
        "Continuous consumption velocity modeling calculates exact Days of Supply per SKU and flags buffer breaches 14 days out.",
      badge: "Early Warning",
    },
    {
      num: "03",
      icon: ShieldAlert,
      title: "Supplier Risk & Fidelity Scoring",
      description:
        "Real-time monitoring of on-time in-full (OTIF) rates, vendor lead-time drift, geopolitical risks, and port congestion.",
      badge: "Vendor Radar",
    },
    {
      num: "04",
      icon: LineChart,
      title: "Ensemble Demand Forecasting",
      description:
        "Machine learning demand projections with confidence envelopes (P50/P80/P95) and dynamic scenario what-if modeling.",
      badge: "ML Precision",
    },
    {
      num: "05",
      icon: Cpu,
      title: "Actionable AI Recommendations",
      description:
        "Autonomous copilots analyze inventory imbalances and stage 1-click inter-DC transfers, PO reorders, and dual-sourcing splits.",
      badge: "Autonomous Ops",
    },
    {
      num: "06",
      icon: BellRing,
      title: "Tiered Operational Alerts",
      description:
        "P0 to P3 priority matrix with deterministic escalation rules to Slack, email, SMS, and ERP purchase requisition drafts.",
      badge: "P0-P3 Matrix",
    },
  ];

  return (
    <section id="features" className="px-4 sm:px-6 lg:px-8 py-28 bg-[#F9FAFB]">
      <div className="mx-auto max-w-[1280px]">
        {/* Header */}
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-18">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-[#111827] mb-5 border border-[#E5E7EB] shadow-xs">
              <span>Intelligence Architecture</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-[56px] font-extrabold tracking-tight text-[#111827] leading-[1.08]">
              One platform for inventory and risk intelligence.
            </h2>
            <p className="mt-5 text-lg sm:text-xl text-[#6B7280]">
              Replace fragmented point solutions and static spreadsheets with an end-to-end operational
              system designed for modern enterprise scale.
            </p>
          </div>
        </ScrollReveal>

        {/* 6 Bento Grid Cards with Staggered Scroll Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <ScrollReveal
                key={idx}
                animation="fade-up"
                delay={(idx % 3) * 100}
                duration={650}
                className="h-full"
              >
                <div className="h-full rounded-3xl border border-[#E5E7EB] bg-white p-9 shadow-[0_2px_14px_rgba(0,0,0,0.02)] hover:border-[#D1D5DB] transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F3F4F6] text-xs font-bold text-[#4B5563]">
                        {feat.num}
                      </div>
                      <span className="text-[11px] font-mono font-bold text-[#6B7280] bg-[#F9FAFB] border border-[#E5E7EB] px-2.5 py-0.5 rounded-full">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-2xl font-extrabold text-[#111827] mt-4">{feat.title}</h3>
                    <p className="mt-3 text-base text-[#6B7280] leading-relaxed">{feat.description}</p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-[#F3F4F6] flex items-center gap-1.5 text-sm font-bold text-[#111827] hover:underline cursor-pointer">
                    <span>Learn more</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
