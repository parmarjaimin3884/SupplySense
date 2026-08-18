/**
 * SupplySense — Settings Type Definitions
 * Maps to backend: backend/app/schemas/settings.py
 */

export interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  role: string;
  name?: string | null;
  phone?: string | null;
  department?: string | null;
}

export interface UserPreferences {
  theme: "dark" | "light" | "system";
  email_notifications: boolean;
  sms_notifications: boolean;
  default_warehouse_filter?: string | null;
  currency: string;
}
