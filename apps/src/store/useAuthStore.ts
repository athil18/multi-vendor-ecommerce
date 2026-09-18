import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { clearAuthCookies } from '@/lib/cookies';

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
}

interface AuthState {
  user: UserSession | null;
  token: string | null;
  role: 'customer' | 'seller' | 'admin';
  login: (session: UserSession, token: string) => void;
  logout: () => void;
  setRole: (role: 'customer' | 'seller' | 'admin') => void;
  hydrateCookies: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: 'customer',
      login: (session, token) => {
        set({ user: session, token, role: session.role });
        toast.success(`Welcome back, ${session.name}!`);
      },
      logout: () => {
        set({ user: null, token: null, role: 'customer' });
        clearAuthCookies();
        toast.success('Logged out successfully');
      },
      setRole: (newRole) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ role: newRole, user: { ...currentUser, role: newRole } });
          toast.success(`Role switched to ${newRole}`);
        } else {
          toast.error('Please sign in to switch roles.');
        }
      },
      hydrateCookies: () => {
        const { token } = get();
        if (!token) {
          clearAuthCookies();
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
      }),
    }
  )
);
