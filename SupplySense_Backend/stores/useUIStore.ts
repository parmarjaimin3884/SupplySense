import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  notificationOpen: boolean;
  setNotificationOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  notificationOpen: false,
  setNotificationOpen: (open) => set({ notificationOpen: open }),
}));
