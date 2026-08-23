"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { NotificationItem, INITIAL_NOTIFICATIONS } from "@/data/notifications-data";
import { useDashboardAlerts } from "@/hooks/useDashboard";
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
  triggerNewToast: (item?: Partial<NotificationItem>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATIONS_STORAGE_KEY = "supplysense_notifications_v1";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: apiAlerts } = useDashboardAlerts();

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);
  const [hasHydratedFromStorage, setHasHydratedFromStorage] = useState(false);
  const [hasSeededFromApi, setHasSeededFromApi] = useState(false);

  // 1. Hydrate notifications from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNotifications(parsed);
          }
        }
      } catch (err) {
        console.error("Failed to load notifications from localStorage:", err);
      } finally {
        setHasHydratedFromStorage(true);
      }
    }
  }, []);

  // Helper to update state and sync to localStorage
  const saveAndSetNotifications = (
    updater: (prev: NotificationItem[]) => NotificationItem[]
  ) => {
    setNotifications((prev) => {
      const next = updater(prev);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error("Failed to save notifications to localStorage:", e);
        }
      }
      return next;
    });
  };

  // 2. Merge API alerts into notifications (once after first successful fetch)
  useEffect(() => {
    if (isAuthenticated && apiAlerts && apiAlerts.length > 0 && !hasSeededFromApi && hasHydratedFromStorage) {
      const apiNotifications: NotificationItem[] = apiAlerts.map((alert) => ({
        id: alert.id,
        type: alert.severity === "CRITICAL" ? "Critical" : alert.severity === "HIGH" ? "High" : alert.severity === "MEDIUM" ? "Medium" : "Low",
        category: alert.alert_type === "INVENTORY" ? "Inventory" : alert.alert_type === "SUPPLIER" ? "Supplier" : alert.alert_type === "SHIPMENT" ? "Forecast" : "System",
        title: `${alert.alert_type} Alert`,
        summary: alert.message,
        description: alert.message,
        timestamp: alert.created_at,
        timeAgo: "Just now",
        isRead: alert.is_resolved,
        recommendedAction: "Review and take action",
        aiInsight: "Detected by SupplySense AI monitoring system.",
        actionLabel: "View Details",
        actionUrl: "/dashboard",
      }));

      saveAndSetNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const newItems = apiNotifications.filter((n) => !existingIds.has(n.id));
        return [...newItems, ...prev];
      });
      setHasSeededFromApi(true);
    }
  }, [isAuthenticated, apiAlerts, hasSeededFromApi, hasHydratedFromStorage]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    saveAndSetNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllRead = () => {
    saveAndSetNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    saveAndSetNotifications((prev) => prev.filter((n) => n.id !== id));
    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  const triggerNewToast = (item?: Partial<NotificationItem>) => {
    const defaultToast: NotificationItem = {
      id: `notif-toast-${Date.now()}`,
      type: "Critical",
      category: "Inventory",
      title: "Critical Stockout Alert",
      summary: "TX-8820-A may stock out within 48 hours.",
      description: "Current stock has dropped to 25 units. Immediate PO release recommended.",
      timestamp: new Date().toISOString(),
      timeAgo: "Just now",
      isRead: false,
      affectedSKU: "TX-8820-A",
      potentialLoss: "$48,000",
      recommendedAction: "Authorize Reorder of 500 Units",
      aiInsight: "Predicted stockout within 48 hours.",
      actionLabel: "View Alert",
      actionUrl: "/purchase-orders",
      ...item,
    };

    saveAndSetNotifications((prev) => [defaultToast, ...prev]);
    setActiveToast(defaultToast);
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
        triggerNewToast,
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
