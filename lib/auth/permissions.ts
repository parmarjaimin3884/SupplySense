import { UserRole } from '@/types/auth';

export type PermissionAction =
  | 'VIEW_EXECUTIVE_BRIEFING'
  | 'EXPORT_BOARD_REPORTS'
  | 'APPROVE_PURCHASE_ORDER'
  | 'REBALANCE_WAREHOUSE_STOCK'
  | 'ANALYZE_RISKS'
  | 'QUERY_AI_ASSISTANT';

export function canAccessRoute(role: UserRole, route: string): boolean {
  if (route.startsWith('/executive')) {
    return role === 'CSCO_EXECUTIVE';
  }
  return true;
}

export function hasPermission(role: UserRole, action: PermissionAction): boolean {
  switch (action) {
    case 'VIEW_EXECUTIVE_BRIEFING':
    case 'EXPORT_BOARD_REPORTS':
      return role === 'CSCO_EXECUTIVE';
    case 'APPROVE_PURCHASE_ORDER':
    case 'REBALANCE_WAREHOUSE_STOCK':
    case 'ANALYZE_RISKS':
    case 'QUERY_AI_ASSISTANT':
      return true;
    default:
      return false;
  }
}
