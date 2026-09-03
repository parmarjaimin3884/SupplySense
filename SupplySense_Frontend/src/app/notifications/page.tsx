"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  Filter,
  Info,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useNotifications } from "@/context/notification-context";
import { NotificationItem } from "@/data/notifications-data";

export default function FullNotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    deleteNotification,
    setSelectedNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<"all" | "unread" | "critical" | "high" | "medium" | "low">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Filtered Notifications List
  const filteredNotifications = notifications.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.affectedSKU && item.affectedSKU.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "unread") return !item.isRead;
    if (activeTab === "critical") return item.type === "Critical";
    if (activeTab === "high") return item.type === "High";
    if (activeTab === "medium") return item.type === "Medium";
    if (activeTab === "low") return item.type === "Low";

    return true;
  });

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 400);
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                Operational Notification Center
              </h1>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono font-bold bg-[#DC2626] text-white px-2 py-0.5 rounded-full">
                  {unreadCount} UNREAD
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Mission-critical supply chain alerts, inventory breach warnings, and AI-guided resolution triggers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="h-9 px-3.5 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#111827] hover:bg-[#F9FAFB] shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <CheckCheck className="h-4 w-4 text-[#16A34A]" />
                <span>Mark All Read</span>
              </button>
            )}

          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E7EB] shadow-xs">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1">
              {[
                { key: "all", label: "All", count: notifications.length },
                { key: "unread", label: "Unread", count: unreadCount },
                { key: "critical", label: "Critical", count: notifications.filter((n) => n.type === "Critical").length },
                { key: "high", label: "High", count: notifications.filter((n) => n.type === "High").length },
                { key: "medium", label: "Medium", count: notifications.filter((n) => n.type === "Medium").length },
                { key: "low", label: "Low", count: notifications.filter((n) => n.type === "Low").length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key as any);
                    simulateLoading();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === tab.key
                      ? "bg-[#111827] text-white shadow-2xs"
                      : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                      activeTab === tab.key
                        ? "bg-white/20 text-white"
                        : "bg-[#F3F4F6] text-[#6B7280]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search SKUs, suppliers, alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#111827] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
          {isLoading ? (
            /* Skeleton Loading State (No large spinners!) */
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="h-12 rounded-xl bg-[#F3F4F6] animate-pulse" />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            /* Empty State */
            <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0FDF4] text-[#16A34A] mx-auto border border-[#16A34A]/20 shadow-xs">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#111827]">No Active Notifications</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Your inventory buffers, inbound shipments, and supplier fulfillments are operating within optimal parameters.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex h-8 px-3.5 rounded-xl bg-[#111827] text-white text-xs font-semibold items-center justify-center hover:bg-black transition-all shadow-xs"
              >
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-semibold bg-[#FAFAFA]">
                    <th className="py-3.5 px-4 w-28">PRIORITY</th>
                    <th className="py-3.5 px-4">TITLE & SUMMARY</th>
                    <th className="py-3.5 px-4 w-32">CATEGORY</th>
                    <th className="py-3.5 px-4 w-32">CREATED</th>
                    <th className="py-3.5 px-4 w-24">STATUS</th>
                    <th className="py-3.5 px-4 text-right w-44">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6] text-[#111827]">
                  {filteredNotifications.map((item) => {
                    const isCritical = item.type === "Critical";
                    const isHigh = item.type === "High";
                    const isMedium = item.type === "Medium";

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedNotification(item)}
                        className={`hover:bg-[#F9FAFB] transition-colors cursor-pointer ${
                          !item.isRead
                            ? isCritical
                              ? "bg-[#FEF2F2]/25"
                              : isHigh
                              ? "bg-[#FFFBEB]/25"
                              : "bg-[#EFF6FF]/20"
                            : ""
                        }`}
                      >
                        {/* Priority Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              isCritical
                                ? "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20"
                                : isHigh
                                ? "bg-[#FFFBEB] text-[#D97706] border border-[#F59E0B]/20"
                                : isMedium
                                ? "bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20"
                                : "bg-[#F3F4F6] text-[#4B5563]"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isCritical
                                  ? "bg-[#DC2626]"
                                  : isHigh
                                  ? "bg-[#D97706]"
                                  : isMedium
                                  ? "bg-[#2563EB]"
                                  : "bg-[#9CA3AF]"
                              }`}
                            />
                            {item.type}
                          </span>
                        </td>

                        {/* Title & Summary */}
                        <td className="py-3.5 px-4">
                          <div
                            className={`text-xs ${
                              !item.isRead ? "font-bold text-[#111827]" : "font-medium text-[#374151]"
                            }`}
                          >
                            {item.title}
                          </div>
                          <div className="text-[11px] text-[#6B7280] line-clamp-1 mt-0.5">
                            {item.summary}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 font-medium text-[#4B5563]">
                          {item.category}
                        </td>

                        {/* Created At */}
                        <td className="py-3.5 px-4 font-mono text-[#6B7280] text-[11px]">
                          {item.timeAgo}
                        </td>

                        {/* Read Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-mono font-semibold ${
                              !item.isRead ? "text-[#DC2626] font-bold" : "text-[#9CA3AF]"
                            }`}
                          >
                            {!item.isRead ? "Unread" : "Read"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedNotification(item)}
                              className="px-2 py-1 rounded bg-[#FAFAFA] border border-[#E5E7EB] text-[11px] font-semibold text-[#111827] hover:bg-[#F3F4F6]"
                            >
                              Details
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm("Delete this notification permanently?")) {
                                  deleteNotification(item.id);
                                }
                              }}
                              className="px-2.5 py-1 rounded bg-[#DC2626] text-white text-[11px] font-semibold hover:bg-[#B91C1C] transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
