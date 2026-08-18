'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Navigation, ShieldAlert } from 'lucide-react';
import { useShipmentItem } from '@/features/shipments/hooks/useShipments';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatCurrency } from '@/lib/utils';

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || '';

  const { data: shp, isLoading, error, refetch } = useShipmentItem(id);

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (error || !shp) return <ErrorState message="Shipment tracking record unavailable." onRetry={refetch} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Shipments
      </Button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">Tracking: {shp.trackingNo}</span>
              <StatusBadge status={shp.status} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{shp.shipmentNo}</h1>
            <p className="text-xs text-slate-500">Carrier: {shp.carrier} • Related PO: {shp.poNumber}</p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Cargo Value</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(shp.totalValue)}</div>
          </div>
        </div>

        {/* Location & Status Overview */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl relative overflow-hidden border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-indigo-400" />
              <span className="font-mono text-xs font-bold text-indigo-300 uppercase tracking-widest">
                Shipment Status & Location Overview
              </span>
            </div>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
              Active Tracking
            </span>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center text-xs font-mono">
              <div>
                <span className="text-slate-400">ORIGIN</span>
                <div className="text-base font-bold text-white mt-0.5">{shp.origin}</div>
              </div>
              <div className="text-center">
                <span className="text-indigo-400 font-bold">{shp.progressPercentage}% Completed</span>
                <div className="w-48 bg-slate-800 h-2 rounded-full mt-1 overflow-hidden">
                  <div className="bg-indigo-500 h-full" style={{ width: `${shp.progressPercentage}%` }} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400">DESTINATION</span>
                <div className="text-base font-bold text-white mt-0.5">{shp.destination}</div>
              </div>
            </div>

            {shp.currentCoordinates && (
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs font-mono flex items-center justify-between">
                <span className="text-slate-300">
                  Coordinates: Latitude {shp.currentCoordinates.lat}°N, Longitude {shp.currentCoordinates.lng}°E
                </span>
                <span className="text-emerald-400 font-bold">{shp.currentCoordinates.locationName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Delay Reason Alert */}
        {shp.delayReason && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-900">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Delay Notice (+{shp.estimatedDaysDelay} Days ETA Adjustment):</strong>
              <p className="mt-0.5">{shp.delayReason}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
