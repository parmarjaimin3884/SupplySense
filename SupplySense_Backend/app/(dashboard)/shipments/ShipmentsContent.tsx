'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Truck, Search, Eye } from 'lucide-react';
import { useShipments } from '@/features/shipments/hooks/useShipments';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatCurrency } from '@/lib/utils';
import { ShipmentStatus } from '@/types';

export default function ShipmentsContent() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ShipmentStatus | 'ALL'>('ALL');

  const { data, isLoading, error, refetch } = useShipments({ search, status });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Freight Shipment Tracking</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Ocean & air freight shipment tracking, delay warnings, and carrier ETA monitoring.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          placeholder="Search Tracking No, Vessel, Carrier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4 text-slate-400" />}
        />

        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as ShipmentStatus | 'ALL')}
          options={[
            { value: 'ALL', label: 'All Shipment Statuses' },
            { value: 'IN_TRANSIT', label: 'In Transit' },
            { value: 'DELAYED', label: 'Delayed' },
            { value: 'DELIVERED', label: 'Delivered' },
          ]}
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={7} />
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : data?.data.length === 0 ? (
        <EmptyState title="No active shipments match criteria" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shipment / Tracking</TableHead>
              <TableHead>Carrier & Vessel</TableHead>
              <TableHead>Origin âž” Destination</TableHead>
              <TableHead>ETA Status</TableHead>
              <TableHead className="text-right">Valuation</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((shp) => (
              <TableRow key={shp.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{shp.shipmentNo}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{shp.trackingNo}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-700 font-medium">{shp.carrier}</TableCell>
                <TableCell className="text-xs text-slate-600">
                  {shp.origin} âž” {shp.destination}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <StatusBadge status={shp.status} />
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">ETA: {shp.revisedEta}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-slate-900">{formatCurrency(shp.totalValue)}</TableCell>
                <TableCell className="w-32">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-700 text-right">{shp.progressPercentage}%</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${shp.status === 'DELAYED' ? 'bg-rose-500' : 'bg-blue-600'}`}
                        style={{ width: `${shp.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Link href={`/shipments/${shp.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-3.5 h-3.5 mr-1" /> Details
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
