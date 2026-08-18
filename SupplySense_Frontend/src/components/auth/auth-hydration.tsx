/**
 * SupplySense — Auth Hydration Component
 *
 * Restores the auth session from localStorage on app mount.
 * Sets cookies for Edge Middleware route protection.
 */

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

export function AuthHydration() {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  // Restore session on first mount
  useEffect(() => {
    if (!isHydrated) {
      restoreSession();
    }
  }, [restoreSession, isHydrated]);

  // Sync cookies for Edge Middleware
  useEffect(() => {
    if (!isHydrated) return;

    if (isAuthenticated) {
      document.cookie = `supplysense_authenticated=true; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `supplysense_role=${role || ""}; path=/; max-age=86400; SameSite=Lax`;
    } else {
      document.cookie = `supplysense_authenticated=; path=/; max-age=0`;
      document.cookie = `supplysense_role=; path=/; max-age=0`;
    }
  }, [isAuthenticated, role, isHydrated]);

  return null;
}
