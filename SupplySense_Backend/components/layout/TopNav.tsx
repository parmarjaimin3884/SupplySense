'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, Bot, ChevronRight, Menu } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';

const GlobalSearchModal = dynamic(
  () => import('./GlobalSearchModal').then((mod) => mod.GlobalSearchModal),
  { ssr: false }
);

export function TopNav() {
  const rawPathname = usePathname();
  const pathname = rawPathname || '';
  const { toggleSidebar, searchOpen, setSearchOpen } = useUIStore();
  const { role, user } = useAuthStore();

  // Create clean breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean);

  return (
    <>
      <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
        {/* Left Side: Mobile Menu + Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
              SupplySense
            </Link>
            {pathSegments.map((segment, index) => {
              const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
              const isLast = index === pathSegments.length - 1;
              const title = segment.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

              return (
                <React.Fragment key={href}>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {isLast ? (
                    <span className="font-semibold text-slate-900 truncate max-w-[200px]">{title}</span>
                  ) : (
                    <Link href={href} className="hover:text-slate-900 transition-colors capitalize">
                      {title}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Global Search Launcher */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 rounded-lg text-xs text-slate-500 transition-all w-48 md:w-64 justify-between select-none"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search platform...</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-300 rounded text-slate-500 shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* AI Shortcut Button */}
          <Link
            href="/assistant"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-all shadow-subtle"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">AI Assistant</span>
          </Link>

          {/* Notifications Bell */}
          <button
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
          </button>

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          {/* User Role Badge & Avatar */}
          <div className="flex items-center gap-2.5">
            <Badge variant={role === 'CSCO_EXECUTIVE' ? 'ai' : 'info'} size="sm" className="hidden sm:inline-flex">
              {role === 'CSCO_EXECUTIVE' ? 'CSCO Exec' : 'Ops Manager'}
            </Badge>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-200">
              {user?.name.charAt(0) || 'A'}
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      {searchOpen && <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />}
    </>
  );
}
