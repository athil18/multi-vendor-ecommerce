/**
 * Isolated Client-Side Newsletter Subscription Form
 * 
 * @agent engineering-frontend-developer
 * @agent testing-accessibility-auditor
 * @agent testing-performance-benchmarker
 */

'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

export function NewsletterForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { toast } = await import('@/components/ui/Toast');
    toast.success('Successfully subscribed to the newsletter!');
    (e.target as HTMLFormElement).reset();
  };

  return (
    <form className="relative" onSubmit={handleSubmit}>
      <input 
        type="email" 
        placeholder="Enter your email" 
        aria-label="Email address for newsletter"
        className="w-full bg-surface-100 dark:bg-surface-900 text-sm py-3 pl-4 pr-12 rounded-xl border border-surface-200 dark:border-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-surface-900 dark:text-white"
        required
      />
      <button 
        type="submit" 
        aria-label="Subscribe to newsletter"
        className="absolute right-1.5 top-1.5 h-8 w-8 rounded-lg bg-brand-600 text-white flex items-center justify-center hover:bg-brand-500 transition-colors shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
