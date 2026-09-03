"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Cpu,
  FileSpreadsheet,
  Flame,
  Globe,
  LayoutDashboard,
  Menu,
  PieChart,
  Search,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  X,
  Building2,
  PackageCheck,
  ClipboardList,
  Bell,
  ChevronDown,
  Shield,
  LogOut,
  Zap,
  FileText,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/context/role-context";
import { useNotifications } from "@/context/notification-context";
import { useAuthStore } from "@/stores/useAuthStore";
import { getStoredAuth } from "@/lib/api/client";
import { CommandPalette } from "./command-palette";
import { NotificationDrawer } from "./notification-drawer";
import { NotificationToast } from "@/components/notifications/notification-toast";
import { NotificationDetailModal } from "@/components/notifications/notification-detail-modal";
import { DemoControlBar } from "./demo-control-bar";
import { Logo } from "@/components/ui/logo";

interface AppShellProps {
  children: React.ReactNode;
}

interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: number;
}

interface NavSection {
  id: string;
  label: string;
  role?: string;
  items: NavItem[];
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { role, setRole, isAdmin, setIsCommandPaletteOpen } = useRole();
  const { unreadCount, setIsDrawerOpen } = useNotifications();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authVerified, setAuthVerified] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsSyncing(false), 600);
  };

  useEffect(() => {
    const verifyAuthentication = () => {
      const auth = getStoredAuth();
      const hasCookie =
        typeof document !== "undefined" &&
        document.cookie.includes("supplysense_authenticated=true");
      const hasStoredUser =
        typeof window !== "undefined" &&
        localStorage.getItem("supplysense_user");

      if (!auth?.accessToken && !hasCookie && !hasStoredUser) {
        setAuthVerified(false);
        window.location.replace("/login");
        return false;
      }

      setAuthVerified(true);
      return true;
    };

    verifyAuthentication();

    // Prevent Back-Forward Cache (BFCache) from displaying cached protected state after logout
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        verifyAuthentication();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [pathname]);

  // Grouped Navigation Sections (Cal.com & Linear Information Architecture)
  const navSections: NavSection[] = [
    {
      id: "operations",
      label: "Operations",
      role: "all",
      items: [
        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { title: "Inventory", href: "/inventory", icon: Boxes },
        { title: "Suppliers", href: "/suppliers", icon: ShoppingBag },
        { title: "Purchase Orders", href: "/purchase-orders", icon: ClipboardList },
        { title: "Shipments", href: "/shipments", icon: Truck },
      ],
    },
    {
      id: "intelligence",
      label: "Intelligence",
      role: "all",
      items: [
        { title: "Risks Center", href: "/risks", icon: ShieldAlert },
        { title: "Demand Spikes & Surges", href: "/risks/demand", icon: Zap },
        { title: "Forecasts", href: "/forecasting", icon: TrendingUp },
        { title: "Executive Insights", href: "/executive", icon: PieChart },
        { title: "Reports & Exporters", href: "/reports", icon: FileText },
        { title: "AI Assistant", href: "/assistant", icon: Sparkles },
      ],
    },
    {
      id: "system",
      label: "System",
      role: "all",
      items: [
        { title: "Notifications", href: "/notifications", icon: Bell, badge: unreadCount },
      ],
    },
    {
      id: "administration",
      label: "Administration",
      role: "admin",
      items: [
        { title: "User Management", href: "/settings/users", icon: Users },
        { title: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ].filter((sec) => sec.role === "all" || (sec.role === "admin" && isAdmin));

  if (!authVerified) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <div className="h-6 w-6 rounded-full border-2 border-[#111827] border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-[#6B7280]">Verifying secure session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col">
      {/* ⌘K Global Command Palette Modal */}
      <CommandPalette />

      {/* Slide-Over Notification Drawer */}
      <NotificationDrawer />

      {/* Real-Time Toast System */}
      <NotificationToast />

      {/* Notification Detailed Telemetry Modal */}
      <NotificationDetailModal />

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 h-14 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shadow-2xs">
        {/* Left: Brand Identity + Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-[#4B5563] hover:text-[#111827] rounded-lg hover:bg-[#F3F4F6]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <Logo size="sm" />
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded-full border border-[#2563EB]/20">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] animate-pulse" />
              <span>MULTI-DEPOT NETWORK</span>
            </span>
          </Link>
        </div>

        {/* Center: Global Search & Command Trigger (⌘K) */}
        <div className="hidden sm:flex flex-1 max-w-md mx-6">
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between h-9 px-3.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] text-xs text-[#9CA3AF] hover:bg-[#F3F4F6] hover:border-[#D1D5DB] transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-[#9CA3AF]" />
              <span>Search SKUs, suppliers, alerts...</span>
            </div>
            <kbd className="font-mono text-[10px] bg-white border border-[#E5E7EB] px-1.5 py-0.5 rounded text-[#6B7280]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Role Switcher, Notifications & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud Demo Simulator & On-Demand Event Controls */}
          <div className="hidden md:flex items-center">
            <DemoControlBar />
          </div>

          {/* Authenticated Role Badge (Read-Only) */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] text-xs font-semibold text-[#111827] shadow-2xs">
            {isAdmin ? (
              <Shield className="h-3.5 w-3.5 text-[#2563EB]" />
            ) : (
              <Boxes className="h-3.5 w-3.5 text-[#059669]" />
            )}
            <span>{isAdmin ? "Admin" : "Inventory Mgr"}</span>
          </div>

          {/* Notification Bell with Dynamic Unread Badge */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="relative p-2 rounded-xl text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[9px] font-mono font-bold text-white shadow-xs">
                {unreadCount > 15 ? "15+" : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            >
              <div className="h-7 w-7 rounded-lg bg-[#111827] text-white flex items-center justify-center text-xs font-bold">
                {user?.employee_name
                  ? user.employee_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : isAdmin
                  ? "AD"
                  : "MN"}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[#9CA3AF] hidden sm:inline" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-lg z-50 text-xs animate-in fade-in">
                <div className="px-3 py-2 border-b border-[#F3F4F6]">
                  <div className="font-bold text-[#111827]">
                    {user?.employee_name || user?.username || (isAdmin ? "Administrator" : "Manager")}
                  </div>
                  <div className="text-[11px] text-[#6B7280] truncate">
                    {user?.email || (isAdmin ? "admin@supplysense.io" : "manager@supplysense.io")}
                  </div>
                  <div className="mt-1 inline-block px-2 py-0.5 rounded bg-[#F3F4F6] text-[10px] font-mono font-bold text-[#111827]">
                    {user?.role ? user.role.toUpperCase() : (isAdmin ? "ADMIN" : "MANAGER")}
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>Workspace Settings</span>
                  </Link>
                  <Link
                    href="/settings/notifications"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    <span>Notification Preferences</span>
                  </Link>
                  <Link
                    href="/settings/users"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Security & RBAC</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-[#F3F4F6]">
                  <button
                    type="button"
                    onClick={async () => {
                      setUserDropdownOpen(false);
                      await logout();
                      window.location.replace("/login");
                    }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* APPLICATION BODY LAYOUT */}
      <div className="flex-1 flex mx-auto w-full max-w-[1600px] px-4 sm:px-6 py-6 gap-6 items-start">
        {/* DESKTOP SIDEBAR: LOGICAL ENTERPRISE WORKFLOW (Sticky) */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 space-y-5 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-6">
          {navSections.map((section) => (
            <div key={section.id} className="space-y-1">
              {/* Section Header with Subtle Styling */}
              <div className="text-[10px] font-mono font-bold tracking-wider text-[#9CA3AF] uppercase px-3 py-1">
                {section.label}
              </div>

              {/* Section Navigation Items */}
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[#111827] text-white shadow-xs"
                          : "text-[#4B5563] hover:text-[#111827] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive ? "text-white" : "text-[#6B7280]"
                          }`}
                        />
                        <span className="truncate">{item.title}</span>
                      </div>

                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-[#DC2626] text-white"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </aside>

        {/* MAIN ROUTE CONTENT CANVAS */}
        <main className="flex-1 min-w-0 pb-12">{children}</main>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111827] text-white">
                    <Boxes className="h-4 w-4" />
                  </div>
                  <span className="font-extrabold text-sm text-[#111827]">SupplySense</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-[#9CA3AF] hover:text-[#111827]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Grouped Mobile Navigation */}
              <div className="space-y-5">
                {navSections.map((section) => (
                  <div key={section.id} className="space-y-1">
                    <div className="text-[10px] font-mono font-bold tracking-wider text-[#9CA3AF] uppercase px-3 py-1">
                      {section.label}
                    </div>

                    <nav className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                              isActive
                                ? "bg-[#111827] text-white shadow-xs"
                                : "text-[#4B5563] hover:bg-[#F3F4F6]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="h-4 w-4 shrink-0" />
                              <span>{item.title}</span>
                            </div>
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#DC2626] text-white">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
