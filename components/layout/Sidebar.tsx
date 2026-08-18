'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
  Package,
  Boxes,
  Warehouse,
  Users,
  ShoppingBag,
  Truck,
  TrendingUp,
  AlertTriangle,
  Award,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { canAccessRoute } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/auth';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: UserRole[];
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export function Sidebar() {
  const rawPathname = usePathname();
  const pathname = rawPathname || '';

  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { role, setRole, user, logout } = useAuthStore();

  const navigation: NavGroup[] = [
    {
      group: 'OVERVIEW',
      items: [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { title: 'AI Assistant', href: '/assistant', icon: Bot, badge: 'AI Service' },
      ],
    },
    {
      group: 'OPERATIONS',
      items: [
        { title: 'Inventory', href: '/inventory', icon: Package },
        { title: 'Products', href: '/products', icon: Boxes },
        { title: 'Warehouses', href: '/warehouses', icon: Warehouse },
        { title: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingBag },
        { title: 'Shipments', href: '/shipments', icon: Truck },
      ],
    },
    {
      group: 'INTELLIGENCE',
      items: [
        { title: 'Suppliers', href: '/suppliers', icon: Users },
        { title: 'Demand Forecast', href: '/forecast', icon: TrendingUp },
        { title: 'Risk & Alerts', href: '/risks', icon: AlertTriangle, badge: '3 Critical' },
        { title: 'Executive Overview', href: '/executive', icon: Award, roles: ['CSCO_EXECUTIVE'] },
      ],
    },
    {
      group: 'SYSTEM',
      items: [{ title: 'Settings', href: '/settings', icon: Settings }],
    },
  ];

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 h-screen bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col select-none',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/40">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-ai-glow shrink-0">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-base font-bold text-white tracking-wider font-sans">
                SUPPLY<span className="text-indigo-400">SENSE</span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-medium">
                AI Intelligence v2.4
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden lg:flex"
          title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Development Role Preview Banner */}
      {sidebarOpen && (
        <div className="mx-3 my-3 p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Dev Role Preview</span>
              <span className="text-xs font-bold text-white truncate">
                {role === 'CSCO_EXECUTIVE' ? 'CSCO Executive' : 'Ops Manager'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setRole(role === 'CSCO_EXECUTIVE' ? 'OPERATIONS_MANAGER' : 'CSCO_EXECUTIVE')}
            className="px-2 py-1 text-[10px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
            title="Switch Development Role Preview"
          >
            Switch
          </button>
        </div>
      )}

      {/* Navigation Group Items */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-6 scrollbar-thin">
        {navigation.map((group) => {
          const visibleItems = group.items.filter((item) => canAccessRoute(role, item.href));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.group} className="space-y-1">
              {sidebarOpen && (
                <div className="px-3 text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1 font-mono">
                  {group.group}
                </div>
              )}
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    )}
                    title={!sidebarOpen ? item.title : undefined}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')} />
                    {sidebarOpen && <span className="truncate">{item.title}</span>}
                    {sidebarOpen && item.badge && (
                      <span
                        className={cn(
                          'ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight',
                          isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/30">
        <div className={cn('flex items-center gap-3', sidebarOpen ? 'justify-between' : 'justify-center')}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {user?.name.charAt(0) || 'A'}
            </div>
            {sidebarOpen && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-white truncate">{user?.name || 'Alex Vance'}</span>
                <span className="text-[10px] text-slate-400 truncate">{user?.department || 'Operations'}</span>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
