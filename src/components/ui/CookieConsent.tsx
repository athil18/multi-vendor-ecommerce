'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Cookie, Shield, Check, X, Sliders, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'nexus_cookie_consent';

export function getStoredCookieConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCookieConsent(prefs: Omit<CookiePreferences, 'timestamp'>) {
  if (typeof window === 'undefined') return;
  const payload: CookiePreferences = {
    ...prefs,
    essential: true,
    timestamp: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    document.cookie = `nexus_consent_status=granted; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent('nexus_cookie_consent_updated', { detail: payload }));
  } catch (err) {
    console.error('Failed to save cookie consent:', err);
  }
}

export function CookieConsent() {
  const [hasChoice, setHasChoice] = useState<boolean>(true); // default true to avoid flash
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    functional: true,
    analytics: false,
    marketing: false,
  });

  const modalRef = useRef<HTMLDivElement>(null);

  // Check stored consent on mount
  useEffect(() => {
    const existing = getStoredCookieConsent();
    if (!existing) {
      setHasChoice(false);
    } else {
      setPreferences({
        essential: true,
        functional: existing.functional ?? true,
        analytics: existing.analytics ?? false,
        marketing: existing.marketing ?? false,
      });
      setHasChoice(true);
    }

    // Global listener to re-open preferences modal from Footer or elsewhere
    const handleOpen = () => {
      setIsPreferencesOpen(true);
    };
    window.addEventListener('nexus_open_cookie_preferences', handleOpen);
    return () => window.removeEventListener('nexus_open_cookie_preferences', handleOpen);
  }, []);

  // Trap focus and handle Escape inside preferences modal
  useEffect(() => {
    if (!isPreferencesOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsPreferencesOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPreferencesOpen]);

  const handleAcceptAll = () => {
    const full = { essential: true, functional: true, analytics: true, marketing: true };
    saveCookieConsent(full);
    setPreferences(full);
    setHasChoice(true);
    setIsPreferencesOpen(false);
  };

  const handleRejectNonEssential = () => {
    const minimal = { essential: true, functional: false, analytics: false, marketing: false };
    saveCookieConsent(minimal);
    setPreferences(minimal);
    setHasChoice(true);
    setIsPreferencesOpen(false);
  };

  const handleSavePreferences = () => {
    saveCookieConsent(preferences);
    setHasChoice(true);
    setIsPreferencesOpen(false);
  };

  return (
    <>
      {/* 1. Cookie Banner (Bottom Toast/Strip) */}
      {!hasChoice && (
        <aside
          role="region"
          aria-label="Cookie consent banner"
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border-t border-surface-200 dark:border-surface-800 shadow-2xl transition-all duration-300 print:hidden"
        >
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 max-w-3xl">
              <div className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-brand-200/50 dark:border-brand-800/50">
                <Cookie className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-surface-900 dark:text-white">
                  Privacy and Cookie Transparency
                </h3>
                <p className="text-xs text-surface-600 dark:text-surface-300 mt-1 leading-relaxed">
                  Nexus uses strictly essential cookies for secure Stripe escrow checkout, authentication, and cart sessions. With your permission, we also use optional functional and anonymous telemetry cookies to elevate your marketplace experience.{' '}
                  <Link
                    href="/cookies"
                    className="underline font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700"
                  >
                    Read Cookie Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreferencesOpen(true)}
                className="text-xs font-semibold"
              >
                <Sliders className="h-3.5 w-3.5 mr-1.5" />
                Customize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectNonEssential}
                className="text-xs font-semibold"
              >
                Reject Non-Essential
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptAll}
                className="text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white"
              >
                Accept All
              </Button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Preferences Modal */}
      {isPreferencesOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity print:hidden"
          onClick={() => setIsPreferencesOpen(false)}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-preferences-title"
            className="w-full max-w-lg bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-2xl p-6 flex flex-col gap-5 text-surface-900 dark:text-surface-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-800">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <Shield className="h-4 w-4" />
                </div>
                <h2 id="cookie-preferences-title" className="text-lg font-bold">
                  Cookie Preferences
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPreferencesOpen(false)}
                aria-label="Close cookie preferences"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
              Manage your personal consent preferences. Essential cookies cannot be disabled as they are required for transaction safety, cryptographic escrow checks, and core marketplace functionality.
            </p>

            {/* Cookie Categories */}
            <div className="space-y-3">
              {/* Essential */}
              <div className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950/40 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-surface-900 dark:text-white">Strictly Essential Cookies</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                      Required
                    </span>
                  </div>
                  <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-1 leading-normal">
                    Needed for user sessions, cart persistence, CSRF security tokens, and Stripe Connect checkout.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  aria-label="Strictly essential cookies (always enabled)"
                  className="h-4 w-4 mt-1 accent-brand-600 cursor-not-allowed opacity-75"
                />
              </div>

              {/* Functional */}
              <div className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 flex items-start justify-between gap-4 hover:border-surface-300 dark:hover:border-surface-700 transition-colors">
                <div>
                  <span className="text-xs font-bold text-surface-900 dark:text-white">Functional Preferences</span>
                  <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-1 leading-normal">
                    Remembers your UI theme preference (Light/Dark/System), catalog filters, and currency views.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="pref-functional"
                  checked={preferences.functional}
                  onChange={(e) => setPreferences((p) => ({ ...p, functional: e.target.checked }))}
                  aria-label="Functional cookies toggle"
                  className="h-4 w-4 mt-1 accent-brand-600 rounded cursor-pointer"
                />
              </div>

              {/* Analytics */}
              <div className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 flex items-start justify-between gap-4 hover:border-surface-300 dark:hover:border-surface-700 transition-colors">
                <div>
                  <span className="text-xs font-bold text-surface-900 dark:text-white">Anonymous Analytics</span>
                  <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-1 leading-normal">
                    Aggregated Core Web Vitals telemetry (LCP, CLS, TBT) used solely to optimize marketplace speed.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="pref-analytics"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences((p) => ({ ...p, analytics: e.target.checked }))}
                  aria-label="Analytics cookies toggle"
                  className="h-4 w-4 mt-1 accent-brand-600 rounded cursor-pointer"
                />
              </div>

              {/* Marketing */}
              <div className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 flex items-start justify-between gap-4 hover:border-surface-300 dark:hover:border-surface-700 transition-colors">
                <div>
                  <span className="text-xs font-bold text-surface-900 dark:text-white">Promotional Attribution</span>
                  <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-1 leading-normal">
                    Preserves campaign codes (UTM parameters) to accurately credit independent artisan partner promotions.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="pref-marketing"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences((p) => ({ ...p, marketing: e.target.checked }))}
                  aria-label="Marketing and attribution cookies toggle"
                  className="h-4 w-4 mt-1 accent-brand-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-surface-200 dark:border-surface-800">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectNonEssential}
                className="text-xs"
              >
                Reject Optional
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSavePreferences}
                  className="text-xs font-semibold"
                >
                  Save Choices
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAcceptAll}
                  className="text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
