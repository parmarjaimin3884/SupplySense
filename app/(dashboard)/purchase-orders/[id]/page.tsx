'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, X } from 'lucide-react';
import { usePurchaseOrderItem, useUpdatePOStatus } from '@/features/purchase-orders/hooks/usePurchaseOrders';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { POStatus } from '@/types';

export default function PODetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || '';

  const { data: po, isLoading, error, refetch } = usePurchaseOrderItem(id);
  const updateStatusMutation = useUpdatePOStatus(id);

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (error || !po) return <ErrorState message="Purchase Order record unavailable." onRetry={refetch} />;

  const lifecycleStages: Array<{ status: POStatus; label: string }> = [
    { status: 'DRAFT', label: 'Purchase Request' },
    { status: 'PENDING_APPROVAL', label: 'Pending Approval' },
    { status: 'APPROVED', label: 'PO Approved' },
    { status: 'SUPPLIER_CONFIRMED', label: 'Supplier Confirmed' },
    { status: 'SHIPPED', label: 'In Freight Transit' },
    { status: 'GOODS_RECEIVED', label: 'Goods Received' },
    { status: 'INVOICE_VERIFIED', label: 'Invoice Verification' },
    { status: 'CLOSED', label: 'PO Closed' },
  ];

  const currentStageIndex = lifecycleStages.findIndex(s => s.status === po.status);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Purchase Orders
      </Button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">PO ID: {po.poNumber}</span>
              <StatusBadge status={po.status} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{po.supplierName}</h1>
            <p className="text-xs text-slate-500">Destination: {po.warehouseName} • Expected ETA: {formatDate(po.expectedDelivery)}</p>
          </div>

          <div className="flex items-center gap-2">
            {po.status === 'PENDING_APPROVAL' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate('APPROVED')}
                  isLoading={updateStatusMutation.isPending}
                >
                  <Check className="w-4 h-4 mr-1" /> Approve PO
                </Button>
                <Button variant="danger" size="sm">
                  <X className="w-4 h-4 mr-1" /> Reject PO
                </Button>
              </>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">9-Stage Purchase Order Lifecycle Timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 relative">
              {lifecycleStages.map((stage, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = currentStageIndex === idx;

                return (
                  <div
                    key={stage.status}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between gap-2 transition-all ${
                      isCurrent
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm ring-2 ring-indigo-200'
                        : isPassed
                        ? 'bg-slate-50 border-slate-300 text-slate-700'
                        : 'bg-white border-slate-100 text-slate-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-indigo-600 text-white'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isPassed ? <Check className="w-3 h-3" /> : idx + 1}
                    </div>
                    <span className="text-[11px] font-semibold leading-tight">{stage.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ordered Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {po.skuList.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-xs border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <span className="text-[10px] text-slate-500 block font-mono">SKU: {item.sku}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{item.quantity} units</span>
                    <span className="text-[10px] font-semibold text-slate-500 block">@ {formatCurrency(item.unitPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
