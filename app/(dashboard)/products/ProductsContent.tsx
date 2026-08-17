'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Boxes, Search, Eye } from 'lucide-react';
import { useProducts } from '@/features/products/hooks/useProducts';
import { CATEGORIES, BRANDS } from '@/lib/mock/fixtures';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function ProductsContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [brand, setBrand] = useState('ALL');

  const { data, isLoading, error, refetch } = useProducts({ page, limit: 10, search, category, brand });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Electronics Product Catalog</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Multi-brand product catalog with category allocation and unit valuation.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search by Product Name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4 text-slate-400" />}
        />
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={[{ value: 'ALL', label: 'All Categories' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
        />
        <Select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          options={[{ value: 'ALL', label: 'All Brands' }, ...BRANDS.map(b => ({ value: b, label: b }))]}
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={10} cols={6} />
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : data?.data.length === 0 ? (
        <EmptyState title="No products found" />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name / SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{item.sku}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="font-medium text-slate-700">{item.brand}</TableCell>
                  <TableCell className="text-right font-bold text-slate-900">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right font-medium">{formatNumber(item.stockQuantity)} units</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Link href={`/products/${item.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Page {page} of {data?.totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <Button variant="outline" size="sm" disabled={page >= (data?.totalPages || 1)} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
