/**
 * Unified Application Theme Store
 * Supports 'light' | 'dark' | 'system' with persistent preference and zero FOUC
 * 
 * @agent engineering-frontend-developer
 * @agent design-ui-designer
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
  syncThemeWithDOM: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeToDOM(resolved: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'light',
      setTheme: (theme: ThemePreference) => {
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        set({ theme, resolvedTheme: resolved });
        applyThemeToDOM(resolved);
      },
      toggleTheme: () => {
        const current = get().theme;
        let next: ThemePreference;
        if (current === 'light') next = 'dark';
        else if (current === 'dark') next = 'system';
        else next = 'light';
        
        const resolved = next === 'system' ? getSystemTheme() : next;
        set({ theme: next, resolvedTheme: resolved });
        applyThemeToDOM(resolved);
      },
      syncThemeWithDOM: () => {
        const current = get().theme;
        const resolved = current === 'system' ? getSystemTheme() : current;
        set({ resolvedTheme: resolved });
        applyThemeToDOM(resolved);
      },
    }),
    {
      name: 'nexus-theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.syncThemeWithDOM();
        }
      },
    }
  )
);

// Listen to OS system color-scheme preference changes when in 'system' mode
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const store = useThemeStore.getState();
    if (store.theme === 'system') {
      store.syncThemeWithDOM();
    }
  });
}
