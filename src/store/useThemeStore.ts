import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

interface ThemeState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  syncThemeWithDOM: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },
      toggleTheme: () => {
        const nextTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: nextTheme });
        document.documentElement.classList.toggle('dark', nextTheme === 'dark');
        toast.success(`Switched to ${nextTheme} mode!`);
      },
      syncThemeWithDOM: () => {
        const currentTheme = get().theme;
        document.documentElement.classList.toggle('dark', currentTheme === 'dark');
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
