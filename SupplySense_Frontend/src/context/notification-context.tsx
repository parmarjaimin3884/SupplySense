"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { NotificationItem } from "@/data/notifications-data";
import { useDashboardAlerts, useDeleteAlert, useResolveAllAlerts } from "@/hooks/useDashboard";
import { useAuthStore } from "@/stores/useAuthStore";

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  selectedNotification: NotificationItem | null;
  setSelectedNotification: (item: NotificationItem | null) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  activeToast: NotificationItem | null;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: apiAlerts } = useDashboardAlerts();
  const resolveAllAlerts = useResolveAllAlerts();
  const deleteAlert = useDeleteAlert();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);

  // The database API is the single source of notification records.
  useEffect(() => {
    if (isAuthenticated && apiAlerts) {
      setNotifications(apiAlerts.map((alert) => ({
        id: alert.id,
        type: alert.severity === "CRITICAL" ? "Critical" : alert.severity === "HIGH" ? "High" : alert.severity === "MEDIUM" ? "Medium" : "Low",
        category: (alert.category || (alert.alert_type === "INVENTORY" ? "Inventory" : alert.alert_type === "SUPPLIER" ? "Supplier" : alert.alert_type === "SHIPMENT" ? "Shipment" : alert.alert_type === "PURCHASE_ORDER" ? "Purchase Order" : alert.alert_type === "WAREHOUSE" ? "Warehouse" : alert.alert_type === "QUALITY" ? "Quality" : "System")) as NotificationItem["category"],
        title: alert.title || `${alert.alert_type} Alert`,
        summary: alert.message,
        description: alert.message,
        timestamp: alert.created_at,
        timeAgo: new Date(alert.created_at).toLocaleString(),
        productName: alert.product_name,
        warehouseName: alert.warehouse_name,
        reorderLevel: alert.reorder_level,
        affectedSKU: alert.affected_sku,
        currentStock: alert.current_stock,
        supplier: alert.supplier_name,
        delayDays: alert.delay_days,
        isRead: alert.is_resolved,
        recommendedAction: alert.recommended_action || "Review and take action",
        aiInsight: alert.ai_insight || alert.message,
        actionLabel: "View Details",
        actionUrl: "/dashboard",
      })));
    } else if (!isAuthenticated) {
      setNotifications([]);
    }
  }, [isAuthenticated, apiAlerts]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    resolveAllAlerts.mutate();
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    deleteAlert.mutate(id);
    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  // Toast auto-dismiss after 5 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isDrawerOpen,
        setIsDrawerOpen,
        selectedNotification,
        setSelectedNotification,
        markAsRead,
        markAllRead,
        deleteNotification,
        activeToast,
        dismissToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
