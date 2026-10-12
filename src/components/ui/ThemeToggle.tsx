'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useThemeStore, ThemePreference } from '@/store/useThemeStore';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  variant?: 'simple' | 'dropdown';
}

export function ThemeToggle({ className = '', variant = 'dropdown' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('pointerdown', handlePointerDown);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (variant === 'simple') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Current theme: ${theme}. Click to switch theme`}
        title={`Theme: ${theme}`}
        className={`h-10 w-10 flex items-center justify-center rounded-lg text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${className}`}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="h-5 w-5 text-amber-500 transition-transform duration-200 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="h-5 w-5 text-indigo-600 transition-transform duration-200 rotate-0 hover:-rotate-12" />
        )}
      </button>
    );
  }

  const options: { value: ThemePreference; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Laptop },
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Theme selector: currently ${theme} mode`}
        title={`Theme: ${theme}`}
        className="h-10 w-10 flex items-center justify-center rounded-lg text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {theme === 'system' ? (
          <Laptop className="h-5 w-5 text-surface-500 dark:text-surface-400" />
        ) : resolvedTheme === 'dark' ? (
          <Moon className="h-5 w-5 text-indigo-400" />
        ) : (
          <Sun className="h-5 w-5 text-amber-500" />
        )}
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Color theme options"
          className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400'
                    : 'text-surface-700 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {opt.label}
                </span>
                {isSelected && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
