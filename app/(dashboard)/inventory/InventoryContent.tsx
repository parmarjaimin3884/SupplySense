'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Package, Search, Bot, Download, Eye, Warehouse } from 'lucide-react';
import { useInventory } from '@/features/inventory/hooks/useInventory';
import { CATEGORIES, BRANDS } from '@/lib/mock/fixtures';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs } from '@/components/ui/tabs';
import { Sheet } from '@/components/ui/sheet';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ProductItem, StockStatus } from '@/types';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { useRouter } from 'next/navigation';

export default function InventoryContent() {
  const router = useRouter();
  const { setContextQuery } = useAssistantStore();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StockStatus | 'ALL'>('ALL');
  const [category, setCategory] = useState('ALL');
  const [brand, setBrand] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  const { data, isLoading, error, refetch } = useInventory({
    page,
    limit: 10,
    search,
    status,
    category,
    brand,
    sortBy,
  });

  const handleAskAIAboutItem = (item: ProductItem) => {
    setContextQuery(`Provide a stock rebalancing and supplier risk analysis for ${item.name} (${item.sku}) in ${item.warehouse}.`);
    router.push('/assistant');
  };

  const statusTabs = [
    { id: 'ALL', label: 'All SKUs', count: data?.summary?.totalSkus },
    { id: 'LOW_STOCK', label: 'Low Stock', count: data?.summary?.lowStockCount },
    { id: 'CRITICAL', label: 'Critical Breaches', count: data?.summary?.criticalCount },
    { id: 'OVERSTOCK', label: 'Overstock', count: data?.summary?.overstockCount },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Electronics Inventory Ledger</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock balance tracking across distribution centers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-card">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Inventory Value</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(data?.summary?.totalValue || 0)}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-card">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Healthy Stock Ratio</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">{data?.summary?.healthyRatioPercentage || 0}% Optimal</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-card">
          <span className="text-[11px] font-semibold text-slate-500 uppercase font-sans">Low Stock Alerts</span>
          <div className="text-xl font-bold text-amber-600 mt-1">{data?.summary?.lowStockCount || 0} SKUs</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-card">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Critical Shortages</span>
          <div className="text-xl font-bold text-rose-600 mt-1">{data?.summary?.criticalCount || 0} SKUs</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
        <Tabs tabs={statusTabs} activeTab={status} onChange={(id) => { setStatus(id as StockStatus | 'ALL'); setPage(1); }} />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <Input
            placeholder="Search by SKU, Product Name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />

          <Select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            options={[{ value: 'ALL', label: 'All Categories' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
          />

          <Select
            value={brand}
            onChange={(e) => { setBrand(e.target.value); setPage(1); }}
            options={[{ value: 'ALL', label: 'All Brands' }, ...BRANDS.map(b => ({ value: b, label: b }))]}
          />

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'name', label: 'Sort by Name (A-Z)' },
              { value: 'stockAsc', label: 'Stock (Low to High)' },
              { value: 'stockDesc', label: 'Stock (High to Low)' },
              { value: 'valueDesc', label: 'Valuation (Highest First)' },
              { value: 'riskDesc', label: 'Risk Score (Highest First)' },
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={10} cols={7} />
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : data?.data.length === 0 ? (
        <EmptyState title="No inventory items found" description="Try clearing your search query or adjusting your category/status filters." />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU / Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Stock Level</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total Valuation</TableHead>
                <TableHead>Warehouse Hub</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((item) => (
                <TableRow key={item.id} onClick={() => setSelectedProduct(item)}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{item.sku}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-600 font-medium">{item.category}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className={`font-bold ${item.stockQuantity < item.minThreshold ? 'text-rose-600' : 'text-slate-900'}`}>
                        {formatNumber(item.stockQuantity)} units
                      </span>
                      <span className="text-[10px] text-slate-400">Min: {item.minThreshold}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right font-bold text-slate-900">{formatCurrency(item.totalValue)}</TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600 truncate max-w-[140px] block">{item.warehouse}</span>
                  </TableCell>
                  <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/inventory/${item.id}`}>
                        <Button variant="ghost" size="icon" title="View Details">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAskAIAboutItem(item)}
                        title="Analyze with AI Assistant"
                      >
                        <Bot className="w-4 h-4 text-indigo-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-2 text-xs text-slate-500">
            <span>
              Showing Page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{data?.totalPages}</strong> ({data?.total} SKUs)
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= (data?.totalPages || 1)} onClick={() => setPage(p => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      <Sheet
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.name || ''}
        subtitle={`SKU Code: ${selectedProduct?.sku} • Category: ${selectedProduct?.category}`}
      >
        {selectedProduct && (
          <div className="space-y-6 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Stock Status</span>
                <div className="mt-1">
                  <StatusBadge status={selectedProduct.status} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Stock Value</span>
                <div className="text-base font-bold text-slate-900 mt-1">{formatCurrency(selectedProduct.totalValue)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-500">Available Stock</span>
                <div className="text-base font-bold text-slate-900 mt-1">{formatNumber(selectedProduct.stockQuantity)} units</div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-500">Safety Threshold</span>
                <div className="text-base font-bold text-slate-900 mt-1">{formatNumber(selectedProduct.minThreshold)} units</div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-500">Unit Selling Price</span>
                <div className="text-base font-bold text-slate-900 mt-1">{formatCurrency(selectedProduct.unitPrice)}</div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-500">Lead Time</span>
                <div className="text-base font-bold text-slate-900 mt-1">{selectedProduct.leadTimeDays} days</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Warehouse className="w-4 h-4 text-indigo-600" />
                Primary Storage Facility
              </div>
              <p className="text-slate-600">{selectedProduct.warehouse}</p>
            </div>

            <div className="pt-2">
              <Button
                variant="ai"
                size="md"
                className="w-full justify-center"
                onClick={() => handleAskAIAboutItem(selectedProduct)}
              >
                <Bot className="w-4 h-4 mr-2" />
                Analyze Stock Rebalancing with AI
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
