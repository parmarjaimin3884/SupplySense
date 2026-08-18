'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, ArrowRightLeft } from 'lucide-react';
import { warehousesApi } from '@/lib/api/warehouses';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatCurrency } from '@/lib/utils';

export default function WarehouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || '';

  const { data: warehouse, isLoading, error, refetch } = useQuery({
    queryKey: ['warehouseDetail', id],
    queryFn: () => warehousesApi.getWarehouseById(id),
    enabled: Boolean(id),
  });

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (error || !warehouse) return <ErrorState message="Warehouse record unavailable." onRetry={refetch} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Warehouses
      </Button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-6">
        <div className="flex justify-between border-b pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-slate-400">{warehouse.code}</span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{warehouse.name}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5" /> {warehouse.location}
            </p>
          </div>
          <StatusBadge status={warehouse.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Utilization Rate</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{warehouse.utilization}%</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Facility Size</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{warehouse.capacitySqFt}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Active Workforce</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{warehouse.activeWorkers} Staff</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Valuation</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(warehouse.inventoryValue)}</div>
          </div>
        </div>

        {warehouse.transferSuggestions && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-3 text-xs text-indigo-900">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <strong className="block font-bold">AI Inter-Depot Rebalancing Directive:</strong>
              <p className="mt-0.5">{warehouse.transferSuggestions}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
