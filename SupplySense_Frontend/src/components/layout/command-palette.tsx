"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Boxes,
  ShieldAlert,
  ShoppingBag,
  TrendingUp,
  Cpu,
  FileSpreadsheet,
  Users,
  Settings,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useRole } from "@/context/role-context";
import { MOCK_SKUS, MOCK_SUPPLIERS, MOCK_RISKS } from "@/data/mock-data";

export function CommandPalette() {
  const router = useRouter();
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, isAdmin } = useRole();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isCommandPaletteOpen) {
      setSearchQuery("");
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const navigateTo = (path: string) => {
    setIsCommandPaletteOpen(false);
    router.push(path);
  };

  const filteredSKUs = MOCK_SKUS.filter(
    (s) =>
      s.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuppliers = MOCK_SUPPLIERS.filter((sup) =>
    sup.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigationItems = [
    { title: "Intelligence Hub (Dashboard)", path: "/dashboard", icon: Sparkles, role: "all" },
    { title: "Inventory Management", path: "/inventory", icon: Boxes, role: "all" },
    { title: "Supplier Intelligence", path: "/suppliers", icon: ShoppingBag, role: "all" },
    { title: "Purchase Orders & Reorders", path: "/purchase-orders", icon: Boxes, role: "all" },
    { title: "Shipment Tracking & Risk", path: "/shipments", icon: ShieldAlert, role: "all" },
    { title: "Demand Forecasting", path: "/forecasting", icon: TrendingUp, role: "all" },
    { title: "Risk Command Center", path: "/risks", icon: ShieldAlert, role: "all" },
    { title: "Executive Briefing Center", path: "/executive", icon: Sparkles, role: "all" },
    { title: "SupplySense AI Assistant", path: "/assistant", icon: Sparkles, role: "all" },
    { title: "User Management", path: "/settings/users", icon: Users, role: "admin" },
    { title: "Platform Settings", path: "/settings", icon: Settings, role: "admin" },
  ].filter((item) => item.role === "all" || (item.role === "admin" && isAdmin));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E7EB] bg-[#FAFAFA]">
          <Search className="h-4 w-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Type a command, SKU code, supplier, or navigation target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
          />
          <div className="flex items-center gap-1">
            <kbd className="hidden sm:inline-block rounded border border-[#E5E7EB] bg-white px-1.5 py-0.5 text-[10px] font-mono text-[#6B7280]">
              ESC
            </kbd>
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(false)}
              className="p-1 rounded-md text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Results / Navigation List */}
        <div className="p-2 overflow-y-auto divide-y divide-[#F3F4F6] text-xs">
          {/* Navigation Section */}
          <div className="pb-2">
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Navigation
            </div>
            <div className="space-y-0.5">
              {navigationItems
                .filter((item) =>
                  item.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => navigateTo(item.path)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F9FAFB] text-left text-[#111827] group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-[#6B7280] group-hover:text-[#111827]" />
                        <span className="font-medium text-xs">{item.title}</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-[#D1D5DB] group-hover:text-[#111827] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
            </div>
          </div>

          {/* SKU Matches */}
          {filteredSKUs.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                SKUs & Components
              </div>
              <div className="space-y-0.5">
                {filteredSKUs.slice(0, 4).map((sku) => (
                  <button
                    key={sku.id}
                    type="button"
                    onClick={() => navigateTo(`/inventory/${sku.sku}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F9FAFB] text-left text-[#111827] group transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#2563EB]">
                          {sku.sku}
                        </span>
                        <span className="font-medium">{sku.name}</span>
                      </div>
                      <div className="text-[10px] text-[#6B7280]">
                        {sku.location} · {sku.onHand.toLocaleString()} on hand ({sku.daysOfSupply}d supply)
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        sku.riskStatus === "Critical"
                          ? "bg-[#FEF2F2] text-[#DC2626]"
                          : "bg-[#F0FDF4] text-[#16A34A]"
                      }`}
                    >
                      {sku.riskStatus}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suppliers Matches */}
          {filteredSuppliers.length > 0 && isAdmin && (
            <div className="py-2">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Suppliers & Vendors
              </div>
              <div className="space-y-0.5">
                {filteredSuppliers.slice(0, 3).map((sup) => (
                  <button
                    key={sup.id}
                    type="button"
                    onClick={() => navigateTo(`/suppliers/${sup.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F9FAFB] text-left text-[#111827] group transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-xs">{sup.name}</span>
                      <div className="text-[10px] text-[#6B7280]">{sup.origin} · {sup.activeSpend} active spend</div>
                    </div>
                    <span className="text-[10px] font-mono font-medium text-[#111827]">
                      {sup.otifRate} OTIF
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 bg-[#FAFAFA] border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#9CA3AF]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>SupplySense Quick Command</span>
        </div>
      </div>
    </div>
  );
}
