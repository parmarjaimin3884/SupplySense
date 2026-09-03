"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Zap,
  RotateCcw,
  ChevronDown,
  ShoppingBag,
  Truck,
  PackagePlus,
  ShieldAlert,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDemoStatus,
  startDemoFeed,
  stopDemoFeed,
  triggerDemoEvent,
  resetDemoData,
} from "@/lib/api/demo";

export function DemoControlBar() {
  const queryClient = useQueryClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lastActionToast, setLastActionToast] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll demo status every 5 seconds
  const { data: status, refetch } = useQuery({
    queryKey: ["demoStatus"],
    queryFn: getDemoStatus,
    refetchInterval: 5000,
  });

  const isRunning = status?.is_running ?? true;

  // Toggle Start / Stop
  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (isRunning) {
        return await stopDemoFeed();
      } else {
        return await startDemoFeed(6.0);
      }
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(["demoStatus"], newData);
      queryClient.invalidateQueries();
      showToast(newData.is_running ? "🟢 Cloud ERP Feed Resumed" : "⏸️ Cloud ERP Feed Paused");
    },
  });

  // Trigger Event
  const triggerMutation = useMutation({
    mutationFn: async (eventType: string) => {
      return await triggerDemoEvent(eventType);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries();
      refetch();
      const title = res?.title || "ERP Event Triggered";
      showToast(`⚡ ${title}`);
      setDropdownOpen(false);
    },
  });

  // Reset Baseline
  const resetMutation = useMutation({
    mutationFn: async () => {
      return await resetDemoData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      refetch();
      showToast("🔄 Demo Data Reset to Pristine Baseline");
      setDropdownOpen(false);
    },
  });

  const showToast = (msg: string) => {
    setLastActionToast(msg);
    setTimeout(() => {
      setLastActionToast(null);
    }, 4000);
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex items-center gap-1.5" ref={dropdownRef}>
      {/* Live Status Toggle Pill */}
      <button
        type="button"
        onClick={() => toggleMutation.mutate()}
        disabled={toggleMutation.isPending}
        title={isRunning ? "Click to Pause live cloud ERP event loop" : "Click to Resume live cloud ERP event loop"}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer shadow-2xs border ${
          isRunning
            ? "border-[#16A34A]/30 bg-[#F0FDF4] text-[#16A34A] hover:bg-[#DCFCE7]"
            : "border-[#E5E7EB] bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
        }`}
      >
        <span className="relative flex h-2 w-2">
          {isRunning && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isRunning ? "bg-[#16A34A]" : "bg-[#9CA3AF]"
            }`}
          ></span>
        </span>
        <span>{isRunning ? "Live ERP Feed" : "Feed Paused"}</span>
        {isRunning ? (
          <Pause className="h-2.5 w-2.5 ml-0.5 opacity-60 hover:opacity-100" />
        ) : (
          <Play className="h-2.5 w-2.5 ml-0.5 opacity-60 hover:opacity-100" />
        )}
      </button>

      {/* On-Demand Event Trigger Button & Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          disabled={triggerMutation.isPending}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#2563EB]/25 bg-[#EFF6FF] text-[11px] font-semibold text-[#2563EB] shadow-2xs hover:bg-[#DBEAFE] active:scale-95 transition-all cursor-pointer"
        >
          {triggerMutation.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Zap className="h-3 w-3 text-[#2563EB]" />
          )}
          <span>Simulate Event</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E5E7EB] shadow-xl p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
            <div className="px-2.5 py-1.5 border-b border-[#F3F4F6] mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#9CA3AF]">
                On-Demand ERP Triggers
              </span>
            </div>

            {/* Event 1: Sales Dispatch */}
            <button
              type="button"
              onClick={() => triggerMutation.mutate("SALES_DISPATCH")}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[#111827] hover:bg-[#F9FAFB] transition-colors text-left cursor-pointer group"
            >
              <div className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#2563EB] group-hover:bg-[#DBEAFE]">
                <ShoppingBag className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[11px] leading-tight text-[#111827]">Customer Sales Order</p>
                <p className="text-[10px] text-[#6B7280]">Drains -15 to -45 SKU units</p>
              </div>
            </button>

            {/* Event 2: Shipment Transit */}
            <button
              type="button"
              onClick={() => triggerMutation.mutate("SHIPMENT_TRANSIT")}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[#111827] hover:bg-[#F9FAFB] transition-colors text-left cursor-pointer group"
            >
              <div className="p-1.5 rounded-lg bg-[#F0FDF4] text-[#16A34A] group-hover:bg-[#DCFCE7]">
                <Truck className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[11px] leading-tight text-[#111827]">Carrier Telemetry & GPS</p>
                <p className="text-[10px] text-[#6B7280]">Moves truck on highway / adds delay</p>
              </div>
            </button>

            {/* Event 3: Stock Inflow */}
            <button
              type="button"
              onClick={() => triggerMutation.mutate("STOCK_INFLOW")}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[#111827] hover:bg-[#F9FAFB] transition-colors text-left cursor-pointer group"
            >
              <div className="p-1.5 rounded-lg bg-[#FAF5FF] text-[#9333EA] group-hover:bg-[#F3E8FF]">
                <PackagePlus className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[11px] leading-tight text-[#111827]">Inbound Dock Receipt</p>
                <p className="text-[10px] text-[#6B7280]">Restocks +80 to +200 units</p>
              </div>
            </button>

            {/* Event 4: ROP Sentinel Check */}
            <button
              type="button"
              onClick={() => triggerMutation.mutate("ROP_CHECK")}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[#111827] hover:bg-[#F9FAFB] transition-colors text-left cursor-pointer group"
            >
              <div className="p-1.5 rounded-lg bg-[#FEF2F2] text-[#DC2626] group-hover:bg-[#FEE2E2]">
                <ShieldAlert className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[11px] leading-tight text-[#111827]">AI Sentinel Buffer Check</p>
                <p className="text-[10px] text-[#6B7280]">Scans for safety stock breaches</p>
              </div>
            </button>

            <div className="my-1 border-t border-[#F3F4F6]" />

            {/* Reset Baseline */}
            <button
              type="button"
              onClick={() => resetMutation.mutate()}
              disabled={resetMutation.isPending}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[11px] font-semibold text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            >
              <RotateCcw className={`h-3 w-3 ${resetMutation.isPending ? "animate-spin" : ""}`} />
              <span>Reset Baseline Data</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Demo Feedback Toast */}
      {lastActionToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#111827] text-white text-xs font-semibold shadow-2xl border border-[#374151] animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
          <Sparkles className="h-3.5 w-3.5 text-[#38BDF8]" />
          <span>{lastActionToast}</span>
        </div>
      )}
    </div>
  );
}
