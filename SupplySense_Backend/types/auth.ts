export type UserRole = 'CSCO_EXECUTIVE' | 'OPERATIONS_MANAGER';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department: string;
}
