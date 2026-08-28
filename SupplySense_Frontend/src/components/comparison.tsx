import { Check, X } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";

export function Comparison() {
  const comparisons = [
    {
      dimension: "Stockout Prevention",
      traditional: "Reactive expediting after manufacturing line or store shelf runs empty.",
      supplysense: "Predictive Days-of-Supply radar detects buffer breach risk 14 days in advance.",
    },
    {
      dimension: "Data Latency & Ingestion",
      traditional: "Manual weekly CSV exports stitched together into fragile spreadsheets.",
      supplysense: "Sub-second native bi-directional synchronization with SAP, NetSuite, & EDI.",
    },
    {
      dimension: "Supplier Disruption Radar",
      traditional: "Discovered only when the vendor fails to deliver at the loading dock.",
      supplysense: "Continuous tracking of port congestion, weather corridors, and lead-time drift.",
    },
    {
      dimension: "Action Execution",
      traditional: "Planners manually craft POs and draft emails across siloed teams.",
      supplysense: "Autonomous AI Copilots stage 1-click inter-DC transfers & dual-source splits.",
    },
    {
      dimension: "Multi-Node Rebalancing",
      traditional: "Siloed warehouses lead to deadstock in Node A while Node B faces stockouts.",
      supplysense: "Global balance optimization re-routes excess inventory with zero duplicate spend.",
    },
    {
      dimension: "Audit & SLA Accountability",
      traditional: "Subjective vendor relationships with zero historical SLA penalty enforcement.",
      supplysense: "Automated line-by-line OTIF scorecards and contract defect tracking.",
    },
  ];

  return (
    <section id="comparison" className="px-4 sm:px-6 lg:px-8 py-28 bg-[#F9FAFB]">
      <div className="mx-auto max-w-[1280px]">
        {/* Header */}
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-18">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-[#111827] mb-5 border border-[#E5E7EB] shadow-xs">
              <span>Competitive Matrix</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-[56px] font-extrabold tracking-tight text-[#111827] leading-[1.08]">
              Why leading operations choose SupplySense.
            </h2>
            <p className="mt-5 text-lg sm:text-xl text-[#6B7280]">
              See how modern AI inventory intelligence compares against traditional spreadsheet-heavy ERP
              workflows.
            </p>
          </div>
        </ScrollReveal>

        {/* Comparison Table with Scale & Fade */}
        <ScrollReveal animation="scale-up" delay={120}>
          <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-[0_4px_30px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 bg-[#FAFAFA] border-b border-[#E5E7EB] p-6 text-xs font-bold">
              <div className="text-[#6B7280] uppercase tracking-wider">CAPABILITY</div>
              <div className="text-[#DC2626] hidden md:block uppercase tracking-wider">
                TRADITIONAL SPREADSHEETS
              </div>
              <div className="text-[#111827] hidden md:block uppercase tracking-wider">
                SUPPLYSENSE AI
              </div>
            </div>

            <div className="divide-y divide-[#E5E7EB]">
              {comparisons.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-3 p-6 text-sm hover:bg-[#F9FAFB] transition-colors gap-4 items-start"
                >
                  <div className="font-bold text-[#111827] text-base">{row.dimension}</div>

                  <div className="flex items-start gap-2.5 text-[#4B5563] bg-[#FEF2F2]/40 p-4 rounded-2xl md:bg-transparent md:p-0">
                    <X className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{row.traditional}</span>
                  </div>

                  <div className="flex items-start gap-2.5 text-[#111827] font-semibold bg-[#F3F4F6] p-4 rounded-2xl md:bg-transparent md:p-0">
                    <Check className="h-4 w-4 text-[#111827] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{row.supplysense}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
