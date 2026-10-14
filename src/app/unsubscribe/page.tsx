/**
 * Email Marketing Unsubscribe Page
 * Accessible, clear opt-out interface conforming to CAN-SPAM, GDPR, and DPDP Act.
 * 
 * @agent frontend-ui-engineering
 * @agent ecommerce
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [reason, setReason] = useState('too_frequent');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to process unsubscribe request');
      }

      setStatus('success');
      setMessage(json.message);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An error occurred while unsubscribing. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-brand-50 dark:bg-brand-950/60 rounded-2xl mb-4 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/40">
            <Mail className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Email Subscription Preferences
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-surface-600 dark:text-surface-400">
            Manage your marketing communications from Nexus Multi-Vendor Marketplace.
          </p>
        </div>

        <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 shadow-md">
          <CardContent className="p-6 sm:p-8">
            {status === 'success' ? (
              <div className="space-y-5 text-center py-4">
                <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                  You Have Been Unsubscribed
                </h2>
                <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed max-w-md mx-auto">
                  <strong>{email}</strong> will no longer receive promotional announcements, drops, or discount newsletters.
                </p>

                <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/60 text-left text-xs text-surface-600 dark:text-surface-400 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-surface-900 dark:text-white">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Transactional Notices Remain Active</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    As required by consumer protection and commercial law, essential transaction notices (such as order confirmation invoices, shipping tracking alerts, and escrow settlement receipts) will continue to be delivered for orders you place.
                  </p>
                </div>

                <div className="pt-2">
                  <Link href="/">
                    <Button variant="primary" className="font-bold">
                      Return to Marketplace
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUnsubscribe} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="unsub-email" className="block text-xs font-bold text-surface-900 dark:text-white">
                    Email Address
                  </label>
                  <input
                    id="unsub-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter the email address to unsubscribe"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="unsub-reason" className="block text-xs font-bold text-surface-900 dark:text-white">
                    Reason for Unsubscribing (Optional)
                  </label>
                  <select
                    id="unsub-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="too_frequent">Emails are sent too frequently</option>
                    <option value="not_relevant">Content is no longer relevant to me</option>
                    <option value="never_signed_up">I did not intentionally sign up</option>
                    <option value="other">Prefer not to say / other</option>
                  </select>
                </div>

                {status === 'error' && (
                  <div role="alert" className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="outline"
                  loading={status === 'submitting'}
                  className="w-full text-xs font-bold py-2.5 border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Unsubscribing...
                    </>
                  ) : (
                    'Confirm Unsubscribe'
                  )}
                </Button>

                <p className="text-[11px] text-surface-500 dark:text-surface-400 text-center leading-relaxed">
                  Transactional order receipts, tracking numbers, and account security notifications will not be affected. You can re-subscribe anytime via the footer.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm">Loading preferences...</div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
