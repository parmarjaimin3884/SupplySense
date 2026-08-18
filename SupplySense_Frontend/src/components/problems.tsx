import { EyeOff, AlertOctagon, Truck, FileSpreadsheet } from "lucide-react";

export function Problems() {
  const problems = [
    {
      num: "01",
      icon: EyeOff,
      title: "Inventory Blind Spots",
      tag: "Visibility Gap",
      description:
        "Siloed ERP systems hide stock imbalances. Teams don't know which critical parts are depleting until assembly lines stall.",
      stat: "64%",
      statLabel: "of stockouts occur with stock sitting in the wrong facility",
    },
    {
      num: "02",
      icon: AlertOctagon,
      title: "Unexpected Stockouts",
      tag: "Revenue Loss",
      description:
        "Sudden channel demand shifts wipe out buffers overnight, causing missed customer delivery SLAs and lost revenue.",
      stat: "$1.8M",
      statLabel: "average annual cost of stockouts per division",
    },
    {
      num: "03",
      icon: Truck,
      title: "Supplier Disruptions",
      tag: "Lead-Time Drift",
      description:
        "Port congestion and factory power rationing arrive without early warning, forcing expensive expedited freight.",
      stat: "+14.2d",
      statLabel: "unforecasted lead-time drift during disruptions",
    },
    {
      num: "04",
      icon: FileSpreadsheet,
      title: "Manual Spreadsheets",
      tag: "Operational Lag",
      description:
        "Planners spend 20+ hours weekly stitching together static CSV exports, making slow decisions on stale data.",
      stat: "22 hrs",
      statLabel: "weekly manual spreadsheet wrangling per planner",
    },
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-28 bg-white border-b border-[#E5E7EB]">
      <div className="mx-auto max-w-[1280px]">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF2F2] px-4 py-1.5 text-xs font-bold text-[#DC2626] mb-5 border border-[#DC2626]/20">
            <span>Critical Friction</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-[56px] font-extrabold tracking-tight text-[#111827] leading-[1.08]">
            Supply chain problems cost millions.
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-[#6B7280]">
            Traditional ERPs record what happened yesterday. Modern operations require real-time
            predictive radar before disruptions occur.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((prob, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-8 flex flex-col justify-between hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-xs font-bold text-[#111827] border border-[#E5E7EB]">
                    {prob.num}
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#6B7280] bg-white border border-[#E5E7EB] px-2.5 py-0.5 rounded-full">
                    {prob.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#111827] mt-4">{prob.title}</h3>
                <p className="mt-3 text-sm text-[#6B7280] leading-relaxed">{prob.description}</p>
              </div>

              <div className="mt-8 pt-5 border-t border-[#E5E7EB]">
                <div className="text-3xl font-extrabold font-mono text-[#DC2626] tracking-tight">
                  {prob.stat}
                </div>
                <div className="text-xs font-medium text-[#6B7280] mt-1">{prob.statLabel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
