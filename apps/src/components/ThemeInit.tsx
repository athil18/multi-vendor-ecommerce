'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export function ThemeInit() {
  const syncThemeWithDOM = useThemeStore((state) => state.syncThemeWithDOM);

  useEffect(() => {
    syncThemeWithDOM();
  }, [syncThemeWithDOM]);

  return null;
}
