/**
 * SupplySense — Authentication Type Definitions
 * Maps to backend: backend/app/schemas/auth.py
 */

export enum UserRole {
  ADMIN = "ADMIN",
  INVENTORY_MANAGER = "INVENTORY_MANAGER",
  OPERATIONS_MANAGER = "OPERATIONS_MANAGER",
}

export interface SignupRequest {
  email: string;
  password: string;
  username?: string;
  full_name?: string;
  company_name?: string;
  role?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  username: string;
  email: string;
  role: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  employee_name?: string | null;
  warehouse_name?: string | null;
}

export interface UserListItem {
  id: string;
  username: string;
  email: string;
  role: "Admin" | "Inventory Manager" | string;
  name: string;
  department: string;
  status: "Active" | "Invited" | "Suspended" | string;
  mfa_enabled: boolean;
  warehouse_name?: string | null;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: "Admin" | "Inventory Manager" | string;
  department?: string;
  password?: string;
}

