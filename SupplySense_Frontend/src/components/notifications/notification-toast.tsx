"use client";

import { useNotifications } from "@/context/notification-context";
import { AlertTriangle, ArrowRight, CheckCircle2, Info, Sparkles, X, Zap } from "lucide-react";
import Link from "next/link";

export function NotificationToast() {
  const { activeToast, dismissToast, setSelectedNotification } = useNotifications();

  if (!activeToast) return null;

  const isCritical = activeToast.type === "Critical";
  const isHigh = activeToast.type === "High";

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`p-4 rounded-2xl border shadow-xl bg-white flex flex-col gap-3 ${
          isCritical
            ? "border-[#DC2626]/30 bg-[#FEF2F2]/40"
            : isHigh
            ? "border-[#F59E0B]/30 bg-[#FFFBEB]/40"
            : "border-[#E5E7EB]"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                isCritical
                  ? "bg-[#DC2626] text-white"
                  : isHigh
                  ? "bg-[#D97706] text-white"
                  : "bg-[#2563EB] text-white"
              }`}
            >
              {isCritical ? (
                <AlertTriangle className="h-4 w-4" />
              ) : isHigh ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    isCritical
                      ? "bg-[#DC2626] text-white"
                      : isHigh
                      ? "bg-[#D97706] text-white"
                      : "bg-[#2563EB] text-white"
                  }`}
                >
                  {activeToast.type.toUpperCase()} ALERT
                </span>
                <span className="text-[11px] text-[#6B7280] font-mono">Just now</span>
              </div>
              <h4 className="text-xs font-bold text-[#111827] mt-0.5">{activeToast.title}</h4>
            </div>
          </div>

          <button
            type="button"
            onClick={dismissToast}
            className="text-[#9CA3AF] hover:text-[#111827] p-1 rounded-lg hover:bg-black/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-[#374151] leading-relaxed">
          {activeToast.summary}
        </p>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => {
              setSelectedNotification(activeToast);
              dismissToast();
            }}
            className="text-xs font-semibold text-[#111827] hover:underline flex items-center gap-1"
          >
            <span>View Details</span>
            <ArrowRight className="h-3 w-3" />
          </button>

          <Link
            href={activeToast.actionUrl}
            onClick={dismissToast}
            className="h-7 px-2.5 rounded-lg bg-[#111827] text-white text-[11px] font-semibold hover:bg-black transition-all flex items-center gap-1 shadow-xs"
          >
            <Zap className="h-3 w-3 text-[#60A5FA]" />
            <span>{activeToast.actionLabel}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
