'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Eye, Plus } from 'lucide-react';
import { usePurchaseOrders } from '@/features/purchase-orders/hooks/usePurchaseOrders';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { POStatus } from '@/types';

export default function PurchaseOrdersContent() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<POStatus | 'ALL'>('ALL');

  const { data, isLoading, error, refetch } = usePurchaseOrders({ search, status });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Purchase Order Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Purchase order drafting, approvals, and 9-stage lifecycle tracking.</p>
        </div>

        <Button variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Draft New PO
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          placeholder="Search PO Number or Supplier Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4 text-slate-400" />}
        />

        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as POStatus | 'ALL')}
          options={[
            { value: 'ALL', label: 'All Lifecycle Statuses' },
            { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'SUPPLIER_CONFIRMED', label: 'Supplier Confirmed' },
            { value: 'SHIPPED', label: 'Shipped' },
            { value: 'GOODS_RECEIVED', label: 'Goods Received' },
            { value: 'CLOSED', label: 'Closed' },
          ]}
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : data?.data.length === 0 ? (
        <EmptyState title="No purchase orders found" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO Number</TableHead>
              <TableHead>Supplier Name</TableHead>
              <TableHead>Target Warehouse</TableHead>
              <TableHead>Expected Delivery</TableHead>
              <TableHead className="text-right">Order Value</TableHead>
              <TableHead>Lifecycle Stage</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((po) => (
              <TableRow key={po.id}>
                <TableCell>
                  <span className="font-bold text-slate-900 font-mono">{po.poNumber}</span>
                </TableCell>
                <TableCell className="font-medium text-slate-800">{po.supplierName}</TableCell>
                <TableCell className="text-xs text-slate-600">{po.warehouseName}</TableCell>
                <TableCell className="text-xs font-mono">{formatDate(po.expectedDelivery)}</TableCell>
                <TableCell className="text-right font-bold text-slate-900">{formatCurrency(po.totalValue)}</TableCell>
                <TableCell>
                  <StatusBadge status={po.status} />
                </TableCell>
                <TableCell className="text-center">
                  <Link href={`/purchase-orders/${po.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-3.5 h-3.5 mr-1" /> Lifecycle Timeline
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
