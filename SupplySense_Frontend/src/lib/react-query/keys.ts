/**
 * SupplySense — Centralized React Query Key Factory
 *
 * Provides type-safe, consistent query keys for cache management.
 */

import type { InventoryListParams } from "@/types/inventory";
import type { SupplierListParams } from "@/types/supplier";
import type { ShipmentListParams } from "@/types/shipment";

export const queryKeys = {
  // ── Auth ──
  auth: {
    me: ["auth", "me"] as const,
  },

  // ── Dashboard ──
  dashboard: {
    all: ["dashboard"] as const,
    summary: ["dashboard", "summary"] as const,
    kpis: ["dashboard", "kpis"] as const,
    alerts: ["dashboard", "alerts"] as const,
  },

  // ── Inventory ──
  inventory: {
    all: ["inventory"] as const,
    list: (params?: InventoryListParams) => ["inventory", "list", params] as const,
    detail: (id: string) => ["inventory", "detail", id] as const,
    lowStock: ["inventory", "low-stock"] as const,
    outOfStock: ["inventory", "out-of-stock"] as const,
    deadStock: ["inventory", "dead-stock"] as const,
    movements: ["inventory", "movements"] as const,
  },

  // ── Suppliers ──
  suppliers: {
    all: ["suppliers"] as const,
    list: (params?: SupplierListParams) => ["suppliers", "list", params] as const,
    detail: (id: string) => ["suppliers", "detail", id] as const,
    highRisk: ["suppliers", "high-risk"] as const,
    performance: ["suppliers", "performance"] as const,
    scorecards: ["suppliers", "scorecards"] as const,
  },

  // ── Shipments ──
  shipments: {
    all: ["shipments"] as const,
    list: (params?: ShipmentListParams) => ["shipments", "list", params] as const,
    detail: (id: string) => ["shipments", "detail", id] as const,
    delayed: ["shipments", "delayed"] as const,
    inTransit: ["shipments", "in-transit"] as const,
    carrierPerformance: ["shipments", "carrier-performance"] as const,
  },

  // ── Forecast ──
  forecast: {
    all: ["forecast"] as const,
    list: ["forecast", "list"] as const,
    accuracy: ["forecast", "accuracy"] as const,
    topProducts: ["forecast", "top-products"] as const,
  },

  // ── Risks ──
  risks: {
    all: ["risks"] as const,
    list: ["risks", "list"] as const,
    critical: ["risks", "critical"] as const,
    summary: ["risks", "summary"] as const,
  },

  // ── Executive ──
  executive: {
    all: ["executive"] as const,
    summary: ["executive", "summary"] as const,
    businessHealth: ["executive", "business-health"] as const,
    boardReport: ["executive", "board-report"] as const,
  },

  // ── AI Assistant ──
  assistant: {
    health: ["assistant", "health"] as const,
  },

  // ── Settings ──
  settings: {
    profile: ["settings", "profile"] as const,
    preferences: ["settings", "preferences"] as const,
  },
};
