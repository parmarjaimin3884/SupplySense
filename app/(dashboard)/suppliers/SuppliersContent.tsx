'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, Search, Star, Eye, Bot } from 'lucide-react';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { useRouter } from 'next/navigation';

export default function SuppliersContent() {
  const router = useRouter();
  const { setContextQuery } = useAssistantStore();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [region, setRegion] = useState('ALL');

  const { data, isLoading, error, refetch } = useSuppliers({ search, status, region });

  const handleAskAISupplier = (supName: string) => {
    setContextQuery(`Analyze SLA reliability, lead time slippage, and defect rate for supplier ${supName}.`);
    router.push('/assistant');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Global Supplier SLA Intelligence</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Vendor reliability scoring, lead time monitoring, and SLA defect tracking.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search Supplier Name or Code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4 text-slate-400" />}
        />

        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Tiers' },
            { value: 'PREFERRED', label: 'Preferred (Top SLA)' },
            { value: 'MODERATE', label: 'Moderate SLA' },
            { value: 'HIGH_RISK', label: 'High Risk Breaches' },
          ]}
        />

        <Select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Regions' },
            { value: 'Taiwan', label: 'Taiwan' },
            { value: 'South Korea', label: 'South Korea' },
            { value: 'Germany', label: 'Germany' },
            { value: 'USA', label: 'USA' },
            { value: 'Japan', label: 'Japan' },
          ]}
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : data?.data.length === 0 ? (
        <EmptyState title="No suppliers match criteria" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier Code / Name</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">On-Time Delivery</TableHead>
              <TableHead className="text-right">Avg Lead Time</TableHead>
              <TableHead className="text-right">Defect Rate</TableHead>
              <TableHead>Status Tier</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((sup) => (
              <TableRow key={sup.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{sup.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{sup.code}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-700">{sup.region}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 font-bold text-slate-900">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{sup.rating}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-emerald-600">{sup.onTimeDelivery}</TableCell>
                <TableCell className="text-right font-medium text-slate-800">{sup.avgLeadTime}</TableCell>
                <TableCell className="text-right text-slate-600">{sup.defectRate}</TableCell>
                <TableCell>
                  <StatusBadge status={sup.status} />
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Link href={`/suppliers/${sup.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-3.5 h-3.5 mr-1" /> Profile
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => handleAskAISupplier(sup.name)}>
                      <Bot className="w-4 h-4 text-indigo-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
