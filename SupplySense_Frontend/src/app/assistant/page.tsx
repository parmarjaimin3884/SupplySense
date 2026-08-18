"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Boxes,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Database,
  FileText,
  HelpCircle,
  Paperclip,
  PieChart,
  Send,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useAIChat, useAIHealth } from "@/hooks/useAssistant";
import type { ChatResponse } from "@/types/assistant";

interface Message {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  citations?: { title: string; source: string; link?: string }[];
  confidence?: number;
  sources?: string[];
  suggestedAction?: { label: string; href: string };
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "assistant",
      content:
        "Hello. SupplySense Intelligence is active across inventory levels, supplier reliability records, and active shipment transit logs. What would you like to analyze today?",
      timestamp: "Just now",
      sources: ["Inventory Data", "Supplier Data", "Purchase Orders", "Knowledge Base"],
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const aiChat = useAIChat();
  const { data: aiHealth } = useAIHealth();

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      content: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputQuery("");
    setIsTyping(true);

    try {
      const response: ChatResponse = await aiChat.mutateAsync({ query });

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        content: response.response,
        timestamp: "Just now",
        citations: response.sources.map((s) => ({ title: s, source: s })),
        confidence: response.confidence,
        sources: response.selected_agents.length > 0 ? response.selected_agents : response.sources,
        suggestedAction: response.recommendations?.length > 0
          ? { label: "View Recommendations", href: "/dashboard" }
          : undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        content: err instanceof Error
          ? `I encountered an error processing your query: ${err.message}. Please try again.`
          : "I encountered an unexpected error. Please try again.",
        timestamp: "Just now",
        confidence: 0,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const samplePrompts = [
    "How many MacBooks are in stock?",
    "Which products need reorder?",
    "Show supplier risks.",
    "Analyze inventory health.",
    "Summarize supply chain health.",
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[#111827]">
                SupplySense Assistant
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2 py-0.5 rounded-full">
                NATURAL LANGUAGE INTELLIGENCE
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Direct conversational access to inventory valuation, vendor scorecards, shipment logs, and purchase order pipelines.
            </p>
          </div>
        </div>

        {/* Chat Canvas */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-xs flex flex-col h-[640px] overflow-hidden">
          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-white shadow-xs">
                    <Sparkles className="h-4 w-4 text-[#60A5FA]" />
                  </div>
                )}

                <div
                  className={`max-w-2xl space-y-2.5 ${
                    msg.sender === "user"
                      ? "bg-[#111827] text-white p-3.5 rounded-2xl rounded-tr-sm text-xs"
                      : "bg-[#FAFAFA] border border-[#E5E7EB] p-4 rounded-2xl rounded-tl-sm text-xs text-[#111827]"
                  }`}
                >
                  <div className="leading-relaxed whitespace-pre-line">
                    {msg.content}
                  </div>

                  {/* Analysis Sources & Citations (No Agent Names!) */}
                  {msg.sender === "assistant" && (
                    <div className="pt-2 border-t border-[#E5E7EB] space-y-2">
                      {msg.sources && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[#6B7280]">
                          <span className="font-semibold text-[#111827]">Analysis Sources:</span>
                          {msg.sources.map((src) => (
                            <span
                              key={src}
                              className="px-2 py-0.5 rounded bg-white border border-[#E5E7EB] font-mono text-[#374151]"
                            >
                              {src}
                            </span>
                          ))}
                        </div>
                      )}

                      {msg.citations && msg.citations.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-[#6B7280] block">Citations & References:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.citations.map((cit) => (
                              <Link
                                key={cit.title}
                                href={cit.link || "#"}
                                className="px-2 py-1 rounded bg-white border border-[#E5E7EB] text-[10px] font-medium text-[#2563EB] hover:underline flex items-center gap-1"
                              >
                                <span>{cit.title}</span>
                                <span className="text-[9px] text-[#9CA3AF]">({cit.source})</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {msg.suggestedAction && (
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-[#16A34A] font-mono font-semibold">
                            Confidence: {msg.confidence}%
                          </span>
                          <Link
                            href={msg.suggestedAction.href}
                            className="px-2.5 py-1 rounded bg-[#111827] text-white text-[11px] font-semibold hover:bg-black transition-colors flex items-center gap-1"
                          >
                            <Zap className="h-3 w-3" />
                            <span>{msg.suggestedAction.label}</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {msg.sender === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#111827]">
                    <User className="h-4 w-4 text-[#4B5563]" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start items-center text-xs text-[#6B7280]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-white">
                  <Sparkles className="h-4 w-4 text-[#60A5FA] animate-pulse" />
                </div>
                <div className="p-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl text-xs flex items-center gap-1.5 font-mono">
                  <span>Synthesizing enterprise records</span>
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Chips */}
          <div className="px-4 py-2 bg-[#FAFAFA] border-t border-[#E5E7EB] flex flex-wrap gap-1.5">
            {samplePrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E7EB] text-[11px] text-[#4B5563] hover:text-[#111827] hover:border-[#D1D5DB] transition-all cursor-pointer shadow-2xs"
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-[#E5E7EB] flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about inventory levels, delayed shipments, or supplier risks..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              className="flex-1 h-10 px-3.5 text-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#111827] transition-all"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              className="h-10 px-4 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Query</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
