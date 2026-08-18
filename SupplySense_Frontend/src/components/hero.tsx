"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Boxes,
  ChevronRight,
  Clock,
  MapPin,
  Check,
  Zap,
  Star,
} from "lucide-react";

interface DateDetail {
  day: number;
  sku: string;
  badge: string;
  badgeType: "critical" | "warning" | "action" | "normal";
  detail: string;
  actionText: string;
  impactText: string;
}

const DATE_DETAILS: Record<number, DateDetail> = {
  15: {
    day: 15,
    sku: "SKU-8820 (Semiconductor IC)",
    badge: "P0 Stockout Imminent",
    badgeType: "critical",
    detail: "Buffer drops to 0.8 days. Recommended: Inter-DC Transfer from Chicago Hub.",
    actionText: "Approve Transfer",
    impactText: "Saves $38,400 Line Idle Loss",
  },
  20: {
    day: 20,
    sku: "SKU-4190 (Lithium Cell Module)",
    badge: "Lead-Time Drift (+6d)",
    badgeType: "warning",
    detail: "Trans-Pacific vessel delayed at Long Beach. Staged: Dual-source 35% batch to domestic supplier.",
    actionText: "Split Sourcing",
    impactText: "Protects $92,000 Production Schedule",
  },
  21: {
    day: 21,
    sku: "SKU-1044 (Industrial Sensor)",
    badge: "Port Congestion Alert",
    badgeType: "warning",
    detail: "Rotterdam customs delay flagged. Staged: Expedited air freight for critical sub-assembly.",
    actionText: "Reroute Air Freight",
    impactText: "Prevents Tier-1 Customer SLA Breach",
  },
  22: {
    day: 22,
    sku: "SKU-9941 (Microcontroller Unit)",
    badge: "Auto-Reorder Trigger",
    badgeType: "action",
    detail: "Safety buffer threshold reached. Automated purchase requisition staged for 8,500 units.",
    actionText: "Confirm PO Reorder",
    impactText: "Optimizes Working Capital Turnover",
  },
  23: {
    day: 23,
    sku: "SKU-6302 (Hydraulic Actuator)",
    badge: "Cross-Dock Balancing",
    badgeType: "action",
    detail: "Dallas node facing high demand; Dallas DC pulling 1,200 units from surplus Dallas North node.",
    actionText: "Authorize Cross-Dock",
    impactText: "Zero Duplicate Inventory Spend",
  },
  14: {
    day: 14,
    sku: "SKU-2051 (Power Inverter)",
    badge: "Buffer Health Nominal",
    badgeType: "normal",
    detail: "On-hand inventory healthy with 28.4 Days of Supply. Continuous telemetry active.",
    actionText: "View Diagnostics",
    impactText: "Zero Active Risk Detected",
  },
};

const AUTO_CYCLE_DATES = [15, 20, 21, 22, 23, 14];

export function Hero() {
  const [selectedHorizon, setSelectedHorizon] = useState<"15d" | "30d" | "45d" | "90d">("15d");
  const [selectedDate, setSelectedDate] = useState<number>(15);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [actionDoneMap, setActionDoneMap] = useState<Record<number, boolean>>({});

  // Auto-cycle through dates like Cal.com's interactive animated calendar
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setSelectedDate((current) => {
        const currentIndex = AUTO_CYCLE_DATES.indexOf(current);
        const nextIndex = (currentIndex + 1) % AUTO_CYCLE_DATES.length;
        return AUTO_CYCLE_DATES[nextIndex];
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleDateClick = (day: number) => {
    setSelectedDate(day);
    setIsAutoPlaying(false); // Pause auto-cycle when user manually clicks
  };

  const handleApprove = (day: number) => {
    setActionDoneMap((prev) => ({ ...prev, [day]: true }));
  };

  // Calendar dates with risk statuses
  const calendarDays = [
    { day: null }, { day: null }, { day: null }, { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 },
    { day: 5 }, { day: 6 }, { day: 7 }, { day: 8 }, { day: 9 }, { day: 10 }, { day: 11 },
    { day: 12 }, { day: 13 }, { day: 14, risk: "normal", label: "Nominal" },
    { day: 15, risk: "critical", label: "Stockout" },
    { day: 16 }, { day: 17 }, { day: 18 }, { day: 19 },
    { day: 20, risk: "warning", label: "Lead Drift" },
    { day: 21, risk: "warning", label: "Port Delay" },
    { day: 22, risk: "action", label: "Reorder" },
    { day: 23, risk: "action", label: "Transfer" },
    { day: 24 }, { day: 25 }, { day: 26 }, { day: 27 }, { day: 28 }, { day: 29 }, { day: 30 },
  ];

  const currentDetail = DATE_DETAILS[selectedDate] || DATE_DETAILS[15];
  const isApproved = actionDoneMap[selectedDate];

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pt-4 pb-20">
      {/* Cal.com Signature Outer Rounded Hero Card */}
      <div className="mx-auto max-w-[1280px] rounded-3xl border border-[#E5E7EB] bg-white p-8 sm:p-12 lg:p-16 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Cal.com Large Display Headline & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-4 py-1.5 text-xs font-bold text-[#111827] mb-6 hover:bg-[#E5E7EB] transition-colors cursor-pointer">
              <span>SupplySense launches v2.4</span>
              <ChevronRight className="h-3.5 w-3.5 text-[#6B7280]" />
            </div>

            {/* Massive Cal.com Display Headline (68px - 76px) */}
            <h1 className="text-5xl sm:text-6xl md:text-[68px] lg:text-[72px] font-extrabold tracking-tight text-[#111827] leading-[1.04]">
              The better way to manage your supply chain
            </h1>

            {/* Large Cal.com Subtitle (19px - 20px) */}
            <p className="mt-6 text-lg sm:text-xl text-[#6B7280] leading-relaxed max-w-xl">
              A fully customizable inventory intelligence & risk platform for operations teams,
              procurement leaders, and supply chain analysts where risks meet instant mitigation.
            </p>

            {/* Cal.com Big Action Buttons (16px font, 16px padding) */}
            <div className="mt-9 w-full max-w-md flex flex-col gap-3">
              <Link
                href="#demo"
                className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#111827] py-4 px-7 text-base font-bold text-white shadow-sm hover:bg-black active:scale-[0.98] transition-all"
              >
                <Zap className="h-4 w-4 text-[#FBBF24]" />
                <span>Connect ERP & Start Free</span>
              </Link>

              <Link
                href="#demo"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#F3F4F6] py-3.5 px-7 text-base font-bold text-[#111827] hover:bg-[#E5E7EB] active:scale-[0.98] transition-all"
              >
                <span>Book executive demo</span>
                <ChevronRight className="h-4 w-4 text-[#6B7280]" />
              </Link>
            </div>

            {/* Helper text */}
            <div className="mt-4 text-xs text-[#9CA3AF] font-medium">
              No credit card required • Instant 2-minute SAP & NetSuite connect
            </div>
          </div>

          {/* Right Column: Cal.com Live Interactive Operational Widget */}
          <div
            className="lg:col-span-6"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
                
                {/* Widget Left Half: Action / Facility Details */}
                <div className="md:col-span-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E5E7EB] pb-6 md:pb-0 md:pr-4 lg:pr-6">
                  <div>
                    {/* Facility Avatar */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111827] text-white text-xs font-bold font-mono">
                        DC
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#111827]">Dallas Logistics Node</div>
                        <div className="text-xs text-[#6B7280]">Central Region Hub</div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-[#111827] leading-snug">
                      Inventory Health & Risk Radar
                    </h3>

                    <p className="mt-2.5 text-xs text-[#6B7280] leading-relaxed">
                      Real-time SKU consumption velocity, buffer breaches, and autonomous reorder schedules.
                    </p>

                    {/* Horizon Filter Pills */}
                    <div className="mt-6">
                      <div className="text-xs font-bold text-[#6B7280] mb-2 uppercase tracking-wider">
                        Buffer Horizon
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 max-w-[210px]">
                        {(["15d", "30d", "45d", "90d"] as const).map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setSelectedHorizon(h)}
                            className={`rounded-lg py-1.5 text-xs font-bold text-center transition-colors ${
                              selectedHorizon === h
                                ? "bg-[#111827] text-white shadow-xs"
                                : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"
                            }`}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Metadata Corridor */}
                  <div className="mt-6 pt-4 border-t border-[#F3F4F6] space-y-2.5 text-xs font-medium text-[#4B5563]">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#6B7280]" />
                      <span>Lead-time: 14.2d avg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#6B7280]" />
                      <span>Trans-Pacific Route</span>
                    </div>
                  </div>
                </div>

                {/* Widget Right Half: Cal.com Calendar / Live Risk Grid */}
                <div className="md:col-span-7">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-base font-bold text-[#111827] flex items-center gap-2">
                      <span>May <span className="text-[#6B7280] font-normal">2026</span></span>
                      {isAutoPlaying && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563EB] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563EB]" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
                      <span className="text-xs font-bold">Critical Breach</span>
                    </div>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#9CA3AF] mb-2 uppercase">
                    <span>SUN</span>
                    <span>MON</span>
                    <span>TUE</span>
                    <span>WED</span>
                    <span>THU</span>
                    <span>FRI</span>
                    <span>SAT</span>
                  </div>

                  {/* Date Grid with Smooth Animated Transitions */}
                  <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {calendarDays.map((d, i) => {
                      if (!d.day) {
                        return <div key={i} className="h-10 w-full" />;
                      }
                      const isSelected = selectedDate === d.day;
                      const isCritical = d.day === 15;
                      const isAction = d.day === 22 || d.day === 23;
                      const isWarning = d.day === 20 || d.day === 21;

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleDateClick(d.day as number)}
                          className={`relative h-10 w-full rounded-xl font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                            isSelected
                              ? "bg-[#111827] text-white shadow-md scale-105 z-10 ring-2 ring-[#111827]/10"
                              : isCritical
                              ? "bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]"
                              : isWarning
                              ? "bg-[#FFFBEB] text-[#D97706] hover:bg-[#FEF3C7]"
                              : isAction
                              ? "bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE]"
                              : "text-[#374151] hover:bg-[#F3F4F6]"
                          }`}
                        >
                          <span>{d.day}</span>
                          {(isCritical || isWarning || isAction) && !isSelected && (
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isCritical ? "bg-[#DC2626]" : isWarning ? "bg-[#D97706]" : "bg-[#2563EB]"
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Event Action Card (Updates dynamically as dates cycle) */}
                  <div className="mt-5 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] p-4 text-left transition-all duration-300">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                      <span className="text-xs font-bold text-[#111827]">
                        May {currentDetail.day}, 2026 • {currentDetail.sku}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
                          currentDetail.badgeType === "critical"
                            ? "text-[#DC2626] bg-[#FEF2F2] border-[#DC2626]/20"
                            : currentDetail.badgeType === "warning"
                            ? "text-[#D97706] bg-[#FFFBEB] border-[#D97706]/20"
                            : currentDetail.badgeType === "action"
                            ? "text-[#2563EB] bg-[#EFF6FF] border-[#2563EB]/20"
                            : "text-[#16A34A] bg-[#F0FDF4] border-[#16A34A]/20"
                        }`}
                      >
                        {currentDetail.badge}
                      </span>
                    </div>

                    <p className="text-xs text-[#4B5563] leading-relaxed">
                      {currentDetail.detail}
                    </p>

                    <div className="mt-3.5 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#16A34A] truncate">
                        {currentDetail.impactText}
                      </span>
                      {isApproved ? (
                        <span className="text-xs font-bold text-[#16A34A] flex items-center gap-1 shrink-0 bg-[#F0FDF4] px-3 py-1.5 rounded-xl border border-[#16A34A]/20">
                          <Check className="h-4 w-4" /> Staged
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApprove(currentDetail.day)}
                          className="rounded-xl bg-[#111827] text-white px-3.5 py-1.5 text-xs font-bold hover:bg-black transition-all shrink-0 active:scale-95 shadow-xs"
                        >
                          {currentDetail.actionText}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Cal.com Ratings / Trustproof Row */}
      <div className="mx-auto max-w-[1280px] mt-10 flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-sm font-bold text-[#4B5563]">
        <div className="flex items-center gap-2.5">
          <div className="flex text-[#16A34A]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <span className="text-[#111827] font-extrabold text-base">4.9/5</span>
          <span className="text-[#6B7280]">Trustpilot</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EA580C] text-white text-xs font-bold">
            P
          </span>
          <span className="text-[#111827] font-extrabold text-base">#1 Product of the Day</span>
          <span className="text-[#6B7280]">ProductHunt</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#DC2626] text-white text-xs font-bold">
            G
          </span>
          <span className="text-[#111827] font-extrabold text-base">Leader 2026</span>
          <span className="text-[#6B7280]">G2 Supply Chain</span>
        </div>
      </div>
    </section>
  );
}
