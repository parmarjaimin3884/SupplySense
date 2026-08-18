'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, Package, Users, ShoppingBag, Truck, Warehouse, Bot, X, ArrowRight, Loader2 } from 'lucide-react';
import { searchService, SearchResultItem } from '@/lib/services/searchService';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['globalSearch', query],
    queryFn: () => searchService.search(query),
    enabled: isOpen && Boolean(query.trim()),
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
  };

  const quickLinks: SearchResultItem[] = [
    { id: 'q-1', title: 'Inventory Stock Table', subtitle: 'Operations • Stock Balances', category: 'Products', href: '/inventory' },
    { id: 'q-2', title: 'Supplier SLA Performance', subtitle: 'Intelligence • Vendor Ratings', category: 'Suppliers', href: '/suppliers' },
    { id: 'q-3', title: 'Purchase Orders Lifecycle', subtitle: 'Operations • 9-Stage Orders', category: 'Purchase Orders', href: '/purchase-orders' },
    { id: 'q-4', title: 'Freight Shipment Tracking', subtitle: 'Operations • Carrier Tracking', category: 'Shipments', href: '/shipments' },
    { id: 'q-5', title: 'Warehouse Hub Utilization', subtitle: 'Operations • Depot Facilities', category: 'Products', href: '/warehouses' },
    { id: 'q-6', title: 'AI Operations Assistant', subtitle: 'AI Intelligence • Autonomous Agent', category: 'Products', href: '/assistant' },
  ];

  const resultsToDisplay = query.trim() ? searchResults : quickLinks;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Suppliers': return Users;
      case 'Purchase Orders': return ShoppingBag;
      case 'Shipments': return Truck;
      default: return Package;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/50 backdrop-blur-xs px-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SKUs, products, suppliers, POs, shipments..."
            className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          {isLoading && <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />}
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-80 overflow-y-auto p-2">
          {resultsToDisplay.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching pages or entities found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                {query ? `Search Results (${searchResults.length})` : 'Suggested Shortcuts'}
              </div>
              {resultsToDisplay.map((item) => {
                const Icon = getCategoryIcon(item.category);
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.href)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-100/80 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{item.title}</div>
                        <div className="text-[10px] text-slate-500">{item.subtitle}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between font-mono">
          <span>Tip: Press ESC or click outside to dismiss</span>
          <span>SupplySense Search Service</span>
        </div>
      </div>
    </div>
  );
}
