'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { HelpCircle, Mail, ShieldCheck, X, ChevronRight, MessageCircle } from 'lucide-react';

export function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
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

  return (
    <div className="fixed bottom-6 left-6 z-30 print:hidden" ref={popoverRef}>
      {/* Quick Contact Popover */}
      {isOpen && (
        <div
          role="region"
          aria-label="Direct support channels"
          className="absolute bottom-14 left-0 w-72 sm:w-80 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-2xl p-4 mb-2 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-surface-100 dark:border-surface-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-surface-900 dark:text-white">
                Nexus Support Concierge
              </h3>
              <p className="text-[11px] text-surface-500">Verified Marketplace Care</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close support menu"
              className="h-6 w-6 rounded flex items-center justify-center text-surface-400 hover:text-surface-900 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {/* Email Support */}
            <a
              href="mailto:support@nexus.market"
              className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-50 dark:bg-surface-800/60 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/60 dark:hover:text-brand-400 transition-colors group"
            >
              <div className="h-8 w-8 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-surface-900 dark:text-white group-hover:text-brand-600 truncate">
                  Email Concierge
                </p>
                <p className="text-[10px] text-surface-500 truncate">support@nexus.market (2h response)</p>
              </div>
              <ChevronRight className="h-4 w-4 text-surface-400 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* Help Center */}
            <Link
              href="/help"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-50 dark:bg-surface-800/60 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/60 dark:hover:text-brand-400 transition-colors group"
            >
              <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-surface-900 dark:text-white group-hover:text-brand-600 truncate">
                  Help & FAQs
                </p>
                <p className="text-[10px] text-surface-500 truncate">Orders, shipping & policies</p>
              </div>
              <ChevronRight className="h-4 w-4 text-surface-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Escrow Dispute */}
            <Link
              href="/buyer-protection"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-50 dark:bg-surface-800/60 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-400 transition-colors group"
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-surface-900 dark:text-white group-hover:text-emerald-600 truncate">
                  Escrow Guarantee
                </p>
                <p className="text-[10px] text-surface-500 truncate">100% money-back protection</p>
              </div>
              <ChevronRight className="h-4 w-4 text-surface-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close contact support menu' : 'Open contact support menu'}
        className="flex items-center gap-2 h-11 px-4 rounded-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xl hover:shadow-2xl text-surface-800 dark:text-surface-200 hover:text-brand-600 dark:hover:text-brand-400 transition-all font-semibold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <MessageCircle className="h-4 w-4 text-brand-600 dark:text-brand-400" />
        <span className="hidden sm:inline">Contact Care</span>
      </button>
    </div>
  );
}
