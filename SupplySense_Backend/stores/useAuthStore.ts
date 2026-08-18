import { create } from 'zustand';
import { UserRole, UserSession } from '@/types/auth';

interface AuthState {
  user: UserSession | null;
  role: UserRole;
  isAuthenticated: boolean;
  setRole: (role: UserRole) => void;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 'usr-901',
    name: 'Alex Vance',
    email: 'alex.vance@supplysense.ai',
    role: 'OPERATIONS_MANAGER',
    department: 'Global Supply Operations',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  role: 'OPERATIONS_MANAGER',
  isAuthenticated: true,
  setRole: (role) => set((state) => ({
    role,
    user: state.user ? { ...state.user, role } : null
  })),
  login: (email, role = 'OPERATIONS_MANAGER') => set({
    isAuthenticated: true,
    role,
    user: {
      id: 'usr-901',
      name: email.split('@')[0].replace('.', ' '),
      email,
      role,
      department: role === 'CSCO_EXECUTIVE' ? 'Executive Board' : 'Global Supply Operations'
    }
  }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
