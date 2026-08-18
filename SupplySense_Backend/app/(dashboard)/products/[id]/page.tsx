'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Warehouse } from 'lucide-react';
import { inventoryApi } from '@/lib/api/inventory';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { useAssistantStore } from '@/stores/useAssistantStore';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || '';
  const { setContextQuery } = useAssistantStore();

  const { data: product, isLoading, error, refetch } = useQuery({
    queryKey: ['productDetail', id],
    queryFn: () => inventoryApi.getInventoryItemById(id),
    enabled: Boolean(id),
  });

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (error || !product) return <ErrorState message="Product not found" onRetry={refetch} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Products
      </Button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-6">
        <div className="flex justify-between border-b pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-slate-400">{product.sku}</span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{product.name}</h1>
            <p className="text-xs text-slate-500">{product.category} • Brand: {product.brand}</p>
          </div>
          <StatusBadge status={product.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Unit Price</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(product.unitPrice)}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Stock Quantity</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{formatNumber(product.stockQuantity)} units</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Total Valuation</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(product.totalValue)}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Sales Velocity</span>
            <div className="text-lg font-bold text-indigo-600 mt-1">{product.salesVelocity} units / mo</div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-indigo-600" /> Storage & Supplier Linkage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Assigned Warehouse:</span>
              <span className="font-bold text-slate-900">{product.warehouse}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Primary Supplier:</span>
              <span className="font-bold text-slate-900">{product.supplier}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
