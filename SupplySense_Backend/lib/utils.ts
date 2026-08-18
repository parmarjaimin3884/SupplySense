import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function getStatusBadgeVariant(status: string): {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'ai' | 'neutral';
  label: string;
} {
  switch (status) {
    case 'OPTIMAL':
    case 'HEALTHY':
    case 'PREFERRED':
    case 'GOODS_RECEIVED':
    case 'DELIVERED':
    case 'CLOSED':
      return { variant: 'success', label: status.replace('_', ' ') };
    case 'LOW_STOCK':
    case 'HIGH_UTILIZATION':
    case 'MODERATE':
    case 'SUPPLIER_CONFIRMED':
    case 'IN_TRANSIT':
    case 'PENDING_APPROVAL':
      return { variant: 'warning', label: status.replace('_', ' ') };
    case 'CRITICAL':
    case 'CRITICAL_CAPACITY':
    case 'HIGH_RISK':
    case 'DELAYED':
    case 'AT_RISK':
    case 'EXPIRED':
      return { variant: 'danger', label: status.replace('_', ' ') };
    case 'DRAFT':
    case 'SHIPPED':
    case 'INVOICE_VERIFIED':
      return { variant: 'info', label: status.replace('_', ' ') };
    default:
      return { variant: 'neutral', label: status };
  }
}
