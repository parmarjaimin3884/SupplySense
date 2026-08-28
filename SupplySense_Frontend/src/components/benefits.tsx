import {
  TrendingDown,
  RotateCw,
  Radar,
  Award,
  Zap,
} from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";

export function Benefits() {
  const benefits = [
    {
      num: "01",
      icon: TrendingDown,
      title: "Reduce Stockouts by 84%",
      description:
        "Sub-second days-of-supply monitoring flags impending buffer breaches days before assembly lines or retail shelves deplete.",
      metric: "84%",
      metricLabel: "Stockout reduction across multi-node operations",
    },
    {
      num: "02",
      icon: RotateCw,
      title: "Accelerate Inventory Turnover",
      description:
        "Identify slow-moving batches and deadstock early. Re-allocate inventory across facilities without purchasing duplicate stock.",
      metric: "+32%",
      metricLabel: "Working capital turnover velocity",
    },
    {
      num: "03",
      icon: Radar,
      title: "Detect Risks 14 Days Earlier",
      description:
        "Continuous port congestion telemetry, factory power rationing, and weather tracking surface disruptions before vendors call you.",
      metric: "14+ Days",
      metricLabel: "Average advance disruption warning window",
    },
    {
      num: "04",
      icon: Award,
      title: "Enforce Supplier SLAs & OTIF",
      description:
        "Automated vendor scorecards track lead-time drift and defect ratios per shipment, giving procurement rigorous contract leverage.",
      metric: "98.2%",
      metricLabel: "Contracted OTIF fidelity compliance",
    },
    {
      num: "05",
      icon: Zap,
      title: "10x Faster Decisions",
      description:
        "Eliminate 20+ hours of weekly spreadsheet wrangling. Planners review and approve pre-configured AI mitigation orders in seconds.",
      metric: "20+ hrs",
      metricLabel: "Saved per planner every single week",
    },
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-28 bg-white border-y border-[#E5E7EB]">
      <div className="mx-auto max-w-[1280px]">
        {/* Header */}
        <ScrollReveal animation="fade-up">
          <div className="max-w-3xl mb-18">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-4 py-1.5 text-xs font-bold text-[#111827] mb-5 border border-[#E5E7EB]">
              <span>Operational ROI</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-[56px] font-extrabold tracking-tight text-[#111827] leading-[1.08]">
              Built for tangible business outcomes.
            </h2>
            <p className="mt-5 text-lg sm:text-xl text-[#6B7280]">
              Every metric in SupplySense ties directly to working capital savings, revenue protection,
              and supply chain resilience.
            </p>
          </div>
        </ScrollReveal>

        {/* 5 Benefits Grid with Staggered Scroll Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((b, idx) => (
            <ScrollReveal
              key={idx}
              animation="fade-up"
              delay={(idx % 3) * 100}
              duration={650}
              className="h-full"
            >
              <div className="h-full rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-9 hover:bg-white hover:shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between">
                <div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-xs font-bold text-[#111827] border border-[#E5E7EB] mb-5">
                    {b.num}
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#111827] mt-4">{b.title}</h3>
                  <p className="mt-3 text-base text-[#6B7280] leading-relaxed">{b.description}</p>
                </div>

                <div className="mt-10 pt-5 border-t border-[#E5E7EB]">
                  <div className="text-4xl font-extrabold font-mono text-[#111827] tracking-tight">
                    {b.metric}
                  </div>
                  <div className="text-sm font-semibold text-[#6B7280] mt-1.5">{b.metricLabel}</div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
