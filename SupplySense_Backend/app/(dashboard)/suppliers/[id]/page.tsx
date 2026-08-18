'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Star } from 'lucide-react';
import { suppliersApi } from '@/lib/api/suppliers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatCurrency } from '@/lib/utils';

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || '';

  const { data: supplier, isLoading, error, refetch } = useQuery({
    queryKey: ['supplierDetail', id],
    queryFn: () => suppliersApi.getSupplierById(id),
    enabled: Boolean(id),
  });

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (error || !supplier) return <ErrorState message="Supplier record unavailable." onRetry={refetch} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Suppliers
      </Button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-6">
        <div className="flex justify-between border-b pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-slate-400">{supplier.code}</span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{supplier.name}</h1>
            <p className="text-xs text-slate-500">Region: {supplier.region} • Category: {supplier.category}</p>
          </div>
          <StatusBadge status={supplier.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">SLA Rating Score</span>
            <div className="text-xl font-bold text-amber-600 mt-1 flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400" /> {supplier.rating} / 5.0
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">On-Time Delivery</span>
            <div className="text-xl font-bold text-emerald-600 mt-1">{supplier.onTimeDelivery}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Average Lead Time</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{supplier.avgLeadTime}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Defect SLA Rate</span>
            <div className="text-xl font-bold text-rose-600 mt-1">{supplier.defectRate}</div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Orders & Contract Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Active Purchase Orders:</span>
              <span className="font-bold text-slate-900">{supplier.activeOrders} Active POs</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Annual Procurement Spend:</span>
              <span className="font-bold text-slate-900">{formatCurrency(supplier.totalSpend)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Official Contact:</span>
              <span className="font-mono text-indigo-600">{supplier.contactEmail}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
