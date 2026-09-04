import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserRole = 'super_admin' | 'admin' | 'engineer' | 'customer';

interface User {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string;
  name?: string;
  avatarUrl?: string;
  hasPassword?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      
      setTokens: (access, refresh) => set({ 
        accessToken: access, 
        refreshToken: refresh,
        isAuthenticated: !!access 
      }),
      
      setUser: (user) => set({ user }),
      
      logout: () => set({ 
        user: null, 
        accessToken: null, 
        refreshToken: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
