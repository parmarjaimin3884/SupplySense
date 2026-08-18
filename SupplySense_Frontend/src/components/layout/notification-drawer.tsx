"use client";

import { useNotifications } from "@/context/notification-context";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Info,
  ShieldAlert,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";

export function NotificationDrawer() {
  const {
    notifications,
    unreadCount,
    isDrawerOpen,
    setIsDrawerOpen,
    markAllRead,
    markAsRead,
    setSelectedNotification,
  } = useNotifications();

  if (!isDrawerOpen) return null;

  const criticalNotifications = notifications.filter((n) => n.type === "Critical");
  const highNotifications = notifications.filter((n) => n.type === "High");
  const mediumNotifications = notifications.filter((n) => n.type === "Medium");
  const lowNotifications = notifications.filter((n) => n.type === "Low");

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />

      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <div className="w-[420px] max-w-full bg-white border-l border-[#E5E7EB] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#111827] text-white shadow-xs">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#111827]">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-mono font-bold bg-[#DC2626] text-white px-1.5 py-0.2 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Operational alerts & intelligence feed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Drawer Content Body: Grouped by Priority */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {notifications.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-[#16A34A] mx-auto" />
                <h4 className="text-xs font-bold text-[#111827]">No Active Notifications</h4>
                <p className="text-[11px] text-[#6B7280]">
                  All warehouse operations and supply chains are healthy.
                </p>
              </div>
            ) : (
              <>
                {/* SECTION 1: CRITICAL ALERTS */}
                {criticalNotifications.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#DC2626] flex items-center gap-1 text-[11px] tracking-tight">
                        <AlertTriangle className="h-3.5 w-3.5" /> CRITICAL ALERTS ({criticalNotifications.length})
                      </span>
                      <span className="text-[10px] text-[#DC2626] font-mono font-semibold">P0 · Highest</span>
                    </div>

                    <div className="space-y-2">
                      {criticalNotifications.map((n) => (
                        <NotificationDrawerCard
                          key={n.id}
                          notification={n}
                          onSelect={() => setSelectedNotification(n)}
                          onMarkRead={() => markAsRead(n.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 2: HIGH PRIORITY */}
                {highNotifications.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#D97706] flex items-center gap-1 text-[11px] tracking-tight">
                        <ShieldAlert className="h-3.5 w-3.5" /> HIGH PRIORITY ({highNotifications.length})
                      </span>
                      <span className="text-[10px] text-[#D97706] font-mono font-semibold">P1 · Elevated</span>
                    </div>

                    <div className="space-y-2">
                      {highNotifications.map((n) => (
                        <NotificationDrawerCard
                          key={n.id}
                          notification={n}
                          onSelect={() => setSelectedNotification(n)}
                          onMarkRead={() => markAsRead(n.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 3: MEDIUM PRIORITY */}
                {mediumNotifications.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#2563EB] flex items-center gap-1 text-[11px] tracking-tight">
                        <Sparkles className="h-3.5 w-3.5" /> MEDIUM PRIORITY ({mediumNotifications.length})
                      </span>
                      <span className="text-[10px] text-[#2563EB] font-mono font-semibold">P2 · Standard</span>
                    </div>

                    <div className="space-y-2">
                      {mediumNotifications.map((n) => (
                        <NotificationDrawerCard
                          key={n.id}
                          notification={n}
                          onSelect={() => setSelectedNotification(n)}
                          onMarkRead={() => markAsRead(n.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 4: LOW PRIORITY */}
                {lowNotifications.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#6B7280] flex items-center gap-1 text-[11px] tracking-tight">
                        <Info className="h-3.5 w-3.5" /> SYSTEM & REPORTS ({lowNotifications.length})
                      </span>
                      <span className="text-[10px] text-[#6B7280] font-mono font-semibold">P3 · Informational</span>
                    </div>

                    <div className="space-y-2">
                      {lowNotifications.map((n) => (
                        <NotificationDrawerCard
                          key={n.id}
                          notification={n}
                          onSelect={() => setSelectedNotification(n)}
                          onMarkRead={() => markAsRead(n.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between">
            <Link
              href="/notifications"
              onClick={() => setIsDrawerOpen(false)}
              className="text-xs font-semibold text-[#111827] hover:underline flex items-center gap-1"
            >
              <span>View All Notifications</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/settings/notifications"
              onClick={() => setIsDrawerOpen(false)}
              className="text-[11px] text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              Preferences
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationDrawerCard({
  notification,
  onSelect,
  onMarkRead,
}: {
  notification: any;
  onSelect: () => void;
  onMarkRead: () => void;
}) {
  const isCritical = notification.type === "Critical";
  const isHigh = notification.type === "High";
  const isMedium = notification.type === "Medium";

  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all space-y-2 ${
        !notification.isRead
          ? isCritical
            ? "border-[#DC2626]/40 bg-[#FEF2F2]/30 shadow-2xs"
            : isHigh
            ? "border-[#F59E0B]/40 bg-[#FFFBEB]/30 shadow-2xs"
            : "border-[#2563EB]/30 bg-[#EFF6FF]/20 shadow-2xs"
          : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full shrink-0 ${
              isCritical
                ? "bg-[#DC2626]"
                : isHigh
                ? "bg-[#D97706]"
                : isMedium
                ? "bg-[#2563EB]"
                : "bg-[#9CA3AF]"
            }`}
          />
          <h4
            className={`text-xs ${
              !notification.isRead ? "font-bold text-[#111827]" : "font-medium text-[#4B5563]"
            }`}
          >
            {notification.title}
          </h4>
        </div>
        <span className="text-[10px] text-[#6B7280] font-mono shrink-0">
          {notification.timeAgo}
        </span>
      </div>

      <p className="text-[11px] text-[#4B5563] line-clamp-2 leading-relaxed">
        {notification.summary}
      </p>

      <div className="pt-1 flex items-center justify-between text-[11px]">
        <span className="text-[#2563EB] font-semibold flex items-center gap-1 hover:underline">
          <span>{notification.actionLabel}</span>
          <ArrowRight className="h-3 w-3" />
        </span>

        {!notification.isRead && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead();
            }}
            className="text-[10px] text-[#6B7280] hover:text-[#111827] font-medium"
          >
            Mark read
          </button>
        )}
      </div>
    </div>
  );
}
