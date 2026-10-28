import { create } from 'zustand';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'CUSTOMER' | 'DEALER' | 'ADMIN' | 'RIDER';
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
