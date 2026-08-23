"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Boxes,
  Check,
  Copy,
  ChevronRight,
  ClipboardList,
  Database,
  FileText,
  HelpCircle,
  Paperclip,
  PieChart,
  RotateCcw,
  Send,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Truck,
  User,
  Zap,
  Activity,
  Bot,
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

const INITIAL_MESSAGES: Message[] = [
  {
    id: "msg-1",
    sender: "assistant",
    content:
      "Hello! I am your SupplySense Intelligence Assistant. I have live access to inventory valuation, stockout predictions, supplier scorecards, and shipment transit logs.\n\nHow can I assist your operations today?",
    timestamp: "Just now",
    sources: ["Inventory Intelligence", "Supplier Risk Engine", "Shipment Telemetry"],
  },
];

const SUGGESTED_QUESTIONS = [
  {
    title: "Stock Status",
    query: "How many MacBooks and Dell XPS are currently in stock?",
    icon: Boxes,
  },
  {
    title: "Reorder Warnings",
    query: "Which products are below safety stock threshold and need reorder?",
    icon: TrendingUp,
  },
  {
    title: "Supplier Risk",
    query: "Show high-risk suppliers and recent delay trends.",
    icon: ShieldAlert,
  },
  {
    title: "Supply Chain Summary",
    query: "Summarize overall supply chain health and pending purchase orders.",
    icon: Activity,
  },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aiChat = useAIChat();
  const { data: aiHealth } = useAIHealth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        citations: response.sources?.map((s) => ({ title: s, source: s })) || [],
        confidence: response.confidence,
        sources: response.selected_agents?.length > 0 ? response.selected_agents : response.sources,
        suggestedAction:
          response.recommendations && response.recommendations.length > 0
            ? { label: "View Operational Dashboard", href: "/dashboard" }
            : undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        content:
          err instanceof Error
            ? `I encountered an error processing your request: ${err.message}. Please verify backend connection.`
            : "I encountered an unexpected error processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        confidence: 0,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages(INITIAL_MESSAGES);
    setInputQuery("");
    inputRef.current?.focus();
  };

  return (
    <AppShell>
      {/* Zero-page-scroll container that takes full viewport height */}
      <div className="flex flex-col h-[calc(100vh-6.5rem)] rounded-2xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden">
        
        {/* TOP BAR: Assistant Status & Header */}
        <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#111827] text-white shadow-xs">
              <Sparkles className="h-4 w-4 text-[#60A5FA]" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-[#111827]">
                  SupplySense AI Assistant
                </h1>
                <span className="hidden sm:inline-flex items-center text-[10px] font-mono font-semibold bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20 px-2 py-0.5 rounded-full">
                  LIVE MODEL
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280]">
                Autonomous supply chain queries across stock, risks, vendors & shipments
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] hover:bg-[#F3F4F6] text-[11px] font-medium text-[#4B5563] hover:text-[#111827] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Reset conversation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </div>

        {/* CHAT MESSAGES STREAM (Scrolls internally only) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FDFDFD]">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 items-start ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-white shadow-xs mt-0.5">
                    <Bot className="h-4 w-4 text-[#60A5FA]" />
                  </div>
                )}

                <div
                  className={`group relative max-w-2xl text-xs ${
                    isUser
                      ? "bg-[#111827] text-white p-3.5 rounded-2xl rounded-tr-xs shadow-xs"
                      : "bg-white border border-[#E5E7EB] p-4 rounded-2xl rounded-tl-xs text-[#111827] shadow-xs space-y-3"
                  }`}
                >
                  {/* Message Content */}
                  <div className="leading-relaxed whitespace-pre-line font-normal select-text">
                    {msg.content}
                  </div>

                  {/* Assistant Footer Info (Sources, Confidence & Actions) */}
                  {!isUser && (
                    <div className="pt-2 border-t border-[#F3F4F6] space-y-2 text-[11px]">
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[#6B7280]">
                          <span className="font-semibold text-[#374151]">Knowledge Sources:</span>
                          {msg.sources.map((src) => (
                            <span
                              key={src}
                              className="px-2 py-0.5 rounded-md bg-[#F3F4F6] border border-[#E5E7EB] font-mono text-[#374151]"
                            >
                              {src}
                            </span>
                          ))}
                        </div>
                      )}

                      {msg.citations && msg.citations.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-[#6B7280]">References:</span>
                          {msg.citations.map((cit) => (
                            <span
                              key={cit.title}
                              className="px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 text-[10px] font-medium"
                            >
                              {cit.title}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-[#9CA3AF] font-mono">{msg.timestamp}</span>
                          {msg.confidence !== undefined && msg.confidence > 0 && (
                            <span className="text-[10px] text-[#16A34A] font-mono font-semibold">
                              Confidence: {msg.confidence}%
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => copyMessage(msg.id, msg.content)}
                            className="p-1 rounded text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <Check className="h-3.5 w-3.5 text-[#16A34A]" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {msg.suggestedAction && (
                            <Link
                              href={msg.suggestedAction.href}
                              className="px-2.5 py-1 rounded-lg bg-[#111827] text-white text-[10px] font-semibold hover:bg-black transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <Zap className="h-3 w-3" />
                              <span>{msg.suggestedAction.label}</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {isUser && (
                    <div className="text-[9px] text-[#9CA3AF] font-mono text-right mt-1">
                      {msg.timestamp}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#111827] mt-0.5">
                    <User className="h-4 w-4 text-[#4B5563]" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start items-center">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-white">
                <Sparkles className="h-4 w-4 text-[#60A5FA] animate-pulse" />
              </div>
              <div className="px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-2xl rounded-tl-xs text-xs text-[#6B7280] shadow-xs flex items-center gap-2 font-medium">
                <span>Analyzing supply chain records</span>
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6] animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6] animate-bounce [animation-delay:0.4s]"></span>
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* BOTTOM FIXED INTERACTION DOCK */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#E5E7EB] shrink-0 space-y-3">
          {/* Quick Suggestion Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] shrink-0">
              Suggestions:
            </span>
            {SUGGESTED_QUESTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => handleSend(item.query)}
                  disabled={isTyping}
                  className="px-2.5 py-1 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB] text-[11px] text-[#4B5563] hover:text-[#111827] hover:border-[#D1D5DB] hover:bg-white transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                >
                  <Icon className="h-3 w-3 text-[#6B7280]" />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>

          {/* Clean Input Field Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                disabled={isTyping}
                placeholder="Ask about inventory levels, delayed shipments, or supplier risks... (Press Enter)"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="w-full h-11 pl-4 pr-10 text-xs sm:text-sm bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10 transition-all disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isTyping || !inputQuery.trim()}
              className="h-11 px-5 rounded-xl bg-[#111827] text-white text-xs sm:text-sm font-semibold hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <span>Ask AI</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
