"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserRole } from "@/types/auth";

// Keep legacy UserRole type for backwards compatibility with existing UI components
export type LegacyUserRole = "admin" | "inventory_manager";

interface RoleContextType {
  role: LegacyUserRole;
  setRole: (role: LegacyUserRole) => void;
  isAdmin: boolean;
  activeDC: string;
  setActiveDC: (dc: string) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

/**
 * Maps backend UserRole enum to legacy frontend role string.
 */
function mapBackendRole(backendRole: UserRole | null): LegacyUserRole {
  if (backendRole === UserRole.CSCO_EXECUTIVE) return "admin";
  return "inventory_manager";
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const authRole = useAuthStore((state) => state.role);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  // Derive role from auth store when authenticated
  const [role, setRoleState] = useState<LegacyUserRole>("admin");
  const [activeDC, setActiveDC] = useState<string>("All Distribution Centers");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Sync role from auth store
  useEffect(() => {
    if (isHydrated && authRole) {
      setRoleState(mapBackendRole(authRole));
    }
  }, [authRole, isHydrated]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const setRole = (newRole: LegacyUserRole) => {
    setRoleState(newRole);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isAdmin: role === "admin",
        activeDC,
        setActiveDC,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
