'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Bot, Warehouse } from 'lucide-react';
import { inventoryApi } from '@/lib/api/inventory';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { useAssistantStore } from '@/stores/useAssistantStore';

export default function InventoryItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || '';
  const { setContextQuery } = useAssistantStore();

  const { data: product, isLoading, error, refetch } = useQuery({
    queryKey: ['inventoryItem', id],
    queryFn: () => inventoryApi.getInventoryItemById(id),
    enabled: Boolean(id),
  });

  const handleAskAI = () => {
    if (product) {
      setContextQuery(`Provide a deep stock rebalancing and supplier risk analysis for ${product.name} (${product.sku}).`);
      router.push('/assistant');
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  if (error || !product) {
    return <ErrorState message="Could not find specified inventory record." onRetry={refetch} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Inventory Ledger
        </Button>
        <Button variant="ai" size="sm" onClick={handleAskAI}>
          <Bot className="w-4 h-4 mr-1.5" />
          Analyze SKU with AI
        </Button>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">{product.sku}</span>
              <StatusBadge status={product.status} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">{product.name}</h1>
            <p className="text-xs text-slate-500 mt-1">Category: {product.category} • Brand: {product.brand}</p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Valuation</span>
              <div className="text-xl font-extrabold text-slate-900">{formatCurrency(product.totalValue)}</div>
            </div>
          </div>
        </div>

        {/* Operational Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Available Quantity</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{formatNumber(product.stockQuantity)} units</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Safety Stock Threshold</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{formatNumber(product.minThreshold)} units</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Unit Price</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(product.unitPrice)}</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Supplier Lead Time</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{product.leadTimeDays} days</div>
          </div>
        </div>

        {/* Warehouse Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-indigo-600" />
              Depot Storage & Logistics Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Primary Hub:</span>
              <span className="font-bold text-slate-900">{product.warehouse}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Primary Supplier:</span>
              <span className="font-bold text-slate-900">{product.supplier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Last Stock Receipt:</span>
              <span className="font-mono font-medium text-slate-700">{product.lastRestocked}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
