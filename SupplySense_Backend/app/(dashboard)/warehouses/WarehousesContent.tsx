'use client';

import React from 'react';
import Link from 'next/link';
import { Warehouse, MapPin, ArrowRightLeft } from 'lucide-react';
import { useWarehouses } from '@/features/warehouses/hooks/useWarehouses';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function WarehousesContent() {
  const { data, isLoading, error, refetch } = useWarehouses();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Global Warehouse Hubs</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Spatial capacity utilization and inter-depot stock rebalancing guidance.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data.map((wh) => (
            <Card key={wh.id} className="relative overflow-hidden hover:border-indigo-300 transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{wh.code}</span>
                    <CardTitle className="text-base text-slate-900 mt-0.5">{wh.name}</CardTitle>
                  </div>
                  <StatusBadge status={wh.status} />
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{wh.location}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Capacity Utilization</span>
                    <span className={`font-bold ${wh.utilization > 90 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {wh.utilization}% Capacity
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        wh.utilization > 90 ? 'bg-rose-500' : wh.utilization > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${wh.utilization}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px]">Stored SKUs</span>
                    <div className="font-bold text-slate-800">{formatNumber(wh.storedSkus)}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Total Valuation</span>
                    <div className="font-bold text-slate-800">{formatCurrency(wh.inventoryValue)}</div>
                  </div>
                </div>

                {wh.utilization > 85 && (
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200/80 text-[11px] text-amber-800 flex items-start gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{wh.transferSuggestions}</span>
                  </div>
                )}

                <Link href={`/warehouses/${wh.id}`} className="block pt-1">
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    Inspect Depot Facility
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
