"use client";

import { useState } from "react";
import {
  Cpu,
  Boxes,
  ShieldAlert,
  LineChart,
  Users,
  Check,
  Zap,
} from "lucide-react";
import { MOCK_AGENTS } from "@/data/mock-data";
import { ScrollReveal } from "@/components/scroll-reveal";

export function AIAgents() {
  const [executedMap, setExecutedMap] = useState<Record<string, boolean>>({});

  const handleExecute = (id: string) => {
    setExecutedMap((prev) => ({ ...prev, [id]: true }));
  };

  const getAgentIcon = (id: string) => {
    switch (id) {
      case "agent-inventory":
        return Boxes;
      case "agent-risk":
        return ShieldAlert;
      case "agent-forecast":
        return LineChart;
      case "agent-supplier":
        return Users;
      default:
        return Cpu;
    }
  };

  return (
    <section id="agents" className="px-4 sm:px-6 lg:px-8 py-28 bg-white border-y border-[#E5E7EB]">
      <div className="mx-auto max-w-[1280px]">
        {/* Header */}
        <ScrollReveal animation="fade-up">
          <div className="max-w-3xl mb-18">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-4 py-1.5 text-xs font-bold text-[#111827] mb-5 border border-[#E5E7EB]">
              <Cpu className="h-4 w-4 text-[#2563EB]" />
              <span>Autonomous Copilots</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-[56px] font-extrabold tracking-tight text-[#111827] leading-[1.08]">
              Meet your supply chain AI team.
            </h2>
            <p className="mt-5 text-lg sm:text-xl text-[#6B7280]">
              Not generic chatbots. SupplySense agents are autonomous operational copilots that continuously
              monitor live data, detect anomalies, and stage pre-configured business actions.
            </p>
          </div>
        </ScrollReveal>

        {/* 4 Agent Cards Grid with Staggered Scroll Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MOCK_AGENTS.map((agent, idx) => {
            const Icon = getAgentIcon(agent.id);
            const isExecuted = executedMap[agent.id];

            return (
              <ScrollReveal
                key={agent.id}
                animation="fade-up"
                delay={(idx % 2) * 120}
                duration={650}
                className="h-full"
              >
                <div className="h-full rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-9 hover:bg-white hover:shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between">
                  <div>
                    {/* Agent Header */}
                    <div className="flex items-center justify-between pb-5 border-b border-[#E5E7EB]">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111827] text-white">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-xl font-bold text-[#111827]">{agent.name}</h3>
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2.5 py-0.5 text-xs font-bold text-[#16A34A] border border-[#16A34A]/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" /> {agent.status}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-[#6B7280]">{agent.role}</p>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-[#111827] bg-white px-3 py-1.5 rounded-xl border border-[#E5E7EB]">
                        {agent.impactMetric}
                      </span>
                    </div>

                    {/* Purpose */}
                    <p className="mt-5 text-sm text-[#4B5563] leading-relaxed">{agent.tagline}</p>

                    {/* Live Insight Box */}
                    <div className="mt-5 rounded-2xl bg-white border border-[#E5E7EB] p-5">
                      <div className="text-xs font-mono uppercase tracking-wider text-[#6B7280] mb-1.5 font-bold">
                        Live Telemetry Insight
                      </div>
                      <p className="text-sm font-bold text-[#111827] leading-relaxed">
                        &ldquo;{agent.exampleInsight}&rdquo;
                      </p>
                    </div>

                    {/* Recommended Action Box */}
                    <div className="mt-3.5 rounded-2xl bg-[#EFF6FF]/60 border border-[#2563EB]/20 p-5">
                      <div className="text-xs font-mono uppercase tracking-wider text-[#2563EB] mb-1.5 font-bold">
                        Staged Autonomous Action
                      </div>
                      <p className="text-sm text-[#1F2937] leading-relaxed font-semibold">
                        {agent.exampleAction}
                      </p>
                    </div>
                  </div>

                  {/* Execution Footer */}
                  <div className="mt-8 pt-5 border-t border-[#E5E7EB] flex items-center justify-between">
                    <span className="text-xs text-[#6B7280] font-mono font-semibold">
                      {agent.activeRules} active heuristics
                    </span>

                    {isExecuted ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16A34A] bg-[#F0FDF4] border border-[#16A34A]/30 px-4 py-2 rounded-xl">
                        <Check className="h-4 w-4" /> Action Staged
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleExecute(agent.id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-black active:scale-[0.98] transition-all"
                      >
                        <Zap className="h-4 w-4 text-[#FBBF24]" />
                        <span>{agent.executionTag}</span>
                      </button>
                    )}
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
