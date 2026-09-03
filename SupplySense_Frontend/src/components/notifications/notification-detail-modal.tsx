"use client";

import { useNotifications } from "@/context/notification-context";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  Mail,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";

export function NotificationDetailModal() {
  const {
    selectedNotification,
    setSelectedNotification,
    markAsRead,
    deleteNotification,
  } = useNotifications();

  if (!selectedNotification) return null;

  const item = selectedNotification;
  const isCritical = item.type === "Critical";
  const isHigh = item.type === "High";
  const isMedium = item.type === "Medium";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="fixed inset-0"
        onClick={() => setSelectedNotification(null)}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-[#E5E7EB] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div
          className={`p-5 border-b flex items-start justify-between ${
            isCritical
              ? "bg-[#FEF2F2]/60 border-[#DC2626]/20"
              : isHigh
              ? "bg-[#FFFBEB]/60 border-[#F59E0B]/20"
              : "bg-[#FAFAFA] border-[#E5E7EB]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                isCritical
                  ? "bg-[#DC2626] text-white"
                  : isHigh
                  ? "bg-[#D97706] text-white"
                  : isMedium
                  ? "bg-[#2563EB] text-white"
                  : "bg-[#6B7280] text-white"
              }`}
            >
              {isCritical || isHigh ? (
                <AlertTriangle className="h-4 w-4" />
              ) : isMedium ? (
                <Sparkles className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isCritical
                      ? "bg-[#DC2626] text-white"
                      : isHigh
                      ? "bg-[#D97706] text-white"
                      : isMedium
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#6B7280] text-white"
                  }`}
                >
                  {item.type.toUpperCase()} PRIORITY
                </span>
                <span className="text-xs text-[#6B7280] font-mono flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {item.timeAgo}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#111827] mt-1">{item.title}</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedNotification(null)}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-black/5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Description */}
          <div className="space-y-1">
            <span className="text-[#6B7280] font-semibold text-[11px]">Overview</span>
            <p className="text-[#1F2937] text-xs leading-relaxed font-medium">
              {item.description}
            </p>
          </div>

          {/* Operational Metrics from the alert condition */}
          {(item.affectedSKU || item.productName || item.warehouseName || item.currentStock !== undefined || item.reorderLevel !== undefined || item.supplier || item.delayDays !== undefined) && (
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
            {item.productName && (
              <div>
                <span className="text-[10px] text-[#6B7280] block">Product</span>
                <strong className="text-[#111827] text-xs">{item.productName}</strong>
              </div>
            )}
            {item.affectedSKU && (
              <div>
                <span className="text-[10px] text-[#6B7280] block">Affected Inventory</span>
                <strong className="text-[#111827] font-mono text-xs">{item.affectedSKU}</strong>
                {item.currentStock !== undefined && (
                  <span className="block text-[10px] text-[#6B7280] mt-0.5">
                    Current Stock: <strong className="text-[#111827]">{item.currentStock} ea</strong>
                  </span>
                )}
              </div>
            )}

            {item.warehouseName && (
              <div>
                <span className="text-[10px] text-[#6B7280] block">Warehouse</span>
                <strong className="text-[#111827] text-xs">{item.warehouseName}</strong>
              </div>
            )}

            {item.reorderLevel !== undefined && (
              <div>
                <span className="text-[10px] text-[#6B7280] block">Reorder Threshold</span>
                <strong className="text-[#111827] font-mono text-xs">{item.reorderLevel} units</strong>
              </div>
            )}

            {item.potentialLoss && (
              <div>
                <span className="text-[10px] text-[#6B7280] block">Potential Impact</span>
                <strong className="text-[#DC2626] font-semibold text-xs">{item.potentialLoss}</strong>
                {item.daysRemaining !== undefined && (
                  <span className="block text-[10px] text-[#DC2626] mt-0.5 font-mono">
                    {item.daysRemaining} days remaining
                  </span>
                )}
              </div>
            )}

            {item.supplier && (
              <div>
                <span className="text-[10px] text-[#6B7280] block">Affected Supplier</span>
                <strong className="text-[#111827] text-xs">{item.supplier}</strong>
                {item.delayDays !== undefined && (
                  <span className="block text-[10px] text-[#D97706] mt-0.5 font-mono">
                    +{item.delayDays} days delay
                  </span>
                )}
              </div>
            )}

            {item.expectedDemandChange && (
              <div>
                <span className="text-[10px] text-[#6B7280] block">Demand Velocity</span>
                <strong className="text-[#16A34A] font-semibold text-xs">{item.expectedDemandChange}</strong>
                <span className="block text-[10px] text-[#6B7280] mt-0.5">Next 30 days</span>
              </div>
            )}
          </div>
          )}

          {/* AI Recommendation & Insight */}
          <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#2563EB]/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Recommendation & Operational Rationale</span>
            </div>
            <p className="text-xs text-[#1E3A8A] font-medium leading-relaxed">
              {item.aiInsight}
            </p>
            <div className="text-[11px] text-[#2563EB] pt-1">
              Suggested Action: <strong>{item.recommendedAction}</strong>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!item.isRead && (
              <button
                type="button"
                onClick={() => markAsRead(item.id)}
                className="h-8 px-2.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
              >
                Mark as Read
              </button>
            )}
            <button
              type="button"
              onClick={() => deleteNotification(item.id)}
              className="h-8 px-2.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition-colors flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Dismiss</span>
            </button>
          </div>

          <Link
            href={item.actionUrl}
            onClick={() => {
              markAsRead(item.id);
              setSelectedNotification(null);
            }}
            className="h-8 px-3.5 rounded-lg bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Zap className="h-3.5 w-3.5 text-[#60A5FA]" />
            <span>{item.actionLabel}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
