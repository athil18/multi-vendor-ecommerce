/**
 * Customer Privacy & Data Rights Center
 * Enables users to inspect their personal data, export a JSON copy, manage cookie preferences,
 * and submit an account/data erasure request under the DPDP Act 2023 and GDPR.
 * 
 * @agent frontend-ui-engineering
 * @agent security-and-hardening
 * @agent ecommerce
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  ShieldCheck, Download, Trash2, ArrowLeft, Cookie, 
  AlertTriangle, CheckCircle2, Lock, FileText, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from '@/components/ui/Toast';

export default function CustomerPrivacyPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [deletionReason, setDeletionReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Handle personal data export
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Collect user profile and export as downloadable JSON
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        platform: 'Nexus Multi-Vendor Marketplace',
        dataPrincipalRights: 'DPDP Act 2023 / GDPR Art. 15 Right of Access',
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          role: user?.role,
        },
        cookiePreferences: typeof window !== 'undefined' ? localStorage.getItem('nexus_cookie_consent') : null,
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexus_personal_data_${user?.id || 'export'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Your personal data file has been downloaded.');
    } catch {
      toast.error('Failed to generate personal data export.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle data deletion request
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmPhrase !== 'DELETE MY ACCOUNT') {
      toast.error("Please enter the exact confirmation phrase: 'DELETE MY ACCOUNT'");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch('/api/user/data-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          confirmPhrase,
          reason: deletionReason || 'User requested account erasure',
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to complete data deletion request');
      }

      toast.success('Your personal data has been erased.');
      logout();
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Data deletion failed. Please contact support.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-16 px-4 text-center">
        <h1 className="text-xl font-bold mb-4">Authentication Required</h1>
        <p className="text-xs text-surface-500 mb-6">Please sign in to view your privacy and data management dashboard.</p>
        <Link href="/auth/login?returnUrl=/customer/privacy">
          <Button variant="primary">Sign In to Continue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/customer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-surface-600 dark:text-surface-400 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Customer Dashboard
          </Link>
          <span className="text-xs text-surface-400">Data Principal ID: {user.id.slice(0, 10)}...</span>
        </div>

        {/* Header */}
        <div className="border-b border-surface-200 dark:border-surface-800 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
                Privacy, Data Sovereignty & Rights
              </h1>
              <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400">
                Manage personal information, cookie preferences, data portability, and erasure rights under DPDP Act 2023 & GDPR.
              </p>
            </div>
          </div>
        </div>

        {/* Active Profile Information Summary */}
        <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
          <CardHeader className="pb-3 border-b border-surface-200 dark:border-surface-800">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-600" />
              1. Personal Identifiers Collected & Maintained
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
              In accordance with data minimization principles, Nexus collects and processes only the personal data essential to service your orders and maintain account security:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60">
                <span className="text-surface-400 block text-[11px]">Registered Full Name</span>
                <span className="font-bold text-surface-900 dark:text-white mt-0.5 block">{user.name}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60">
                <span className="text-surface-400 block text-[11px]">Verified Email Address</span>
                <span className="font-bold text-surface-900 dark:text-white mt-0.5 block">{user.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60">
                <span className="text-surface-400 block text-[11px]">Assigned Role</span>
                <span className="font-bold text-surface-900 dark:text-white mt-0.5 block uppercase tracking-wider">{user.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Portability (Export) */}
        <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
          <CardHeader className="pb-3 border-b border-surface-200 dark:border-surface-800">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Download className="h-4 w-4 text-indigo-600" />
              2. Right to Access & Data Portability (Download JSON)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="max-w-xl">
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                You have the statutory right to receive a machine-readable copy of your personal data records held by Nexus.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              disabled={isExporting}
              className="font-bold text-xs shrink-0"
            >
              {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
              Export My Data (.JSON)
            </Button>
          </CardContent>
        </Card>

        {/* Cookie & Tracking Transparency */}
        <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
          <CardHeader className="pb-3 border-b border-surface-200 dark:border-surface-800">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Cookie className="h-4 w-4 text-amber-500" />
              3. Cookie & Tracking Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="max-w-xl">
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Control optional analytics and attribution telemetry. Strictly essential authentication and CSRF session cookies remain active for checkout protection.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('nexus_open_cookie_preferences'));
                }
              }}
              className="font-bold text-xs shrink-0"
            >
              <Cookie className="h-3.5 w-3.5 mr-1.5" />
              Adjust Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Account Deletion & Right to Erasure */}
        <Card className="border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10">
          <CardHeader className="pb-3 border-b border-rose-200 dark:border-rose-900/40">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-700 dark:text-rose-400">
              <Trash2 className="h-4 w-4" />
              4. Right to Erasure & Account Deletion (DPDP Sec. 12(3))
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="text-xs text-surface-600 dark:text-surface-300 space-y-2 leading-relaxed">
              <p>
                Under Section 12(3) of the Digital Personal Data Protection Act, 2023 and GDPR Article 17, you hold the right to have all your personal identifiers erased upon request.
              </p>
              <div className="p-3.5 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 space-y-1 text-[11px]">
                <p className="font-bold text-surface-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  What will be erased:
                </p>
                <p className="text-surface-500">Your name, email address, password hashes, saved addresses, and active session tokens.</p>
                
                <p className="font-bold text-surface-900 dark:text-white pt-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  What must be legally retained:
                </p>
                <p className="text-surface-500">
                  Past completed order receipts, tax invoices, and double-entry escrow ledgers are retained for 8 years strictly to satisfy statutory corporate taxation, GST/VAT compliance, and commercial audit requirements.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-950/60"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Initiate Account Erasure Request
            </Button>
          </CardContent>
        </Card>

      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="w-full max-w-md bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 id="delete-modal-title" className="text-lg font-bold text-surface-900 dark:text-white">
                Confirm Account Erasure
              </h2>
            </div>

            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
              This action is permanent and cannot be undone. All active sessions will be terminated and personal data will be irreversibly anonymized.
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="confirm-phrase-input" className="block text-xs font-bold text-surface-900 dark:text-white">
                  Type <span className="font-mono text-rose-600 select-all">DELETE MY ACCOUNT</span> to confirm:
                </label>
                <input
                  id="confirm-phrase-input"
                  type="text"
                  required
                  value={confirmPhrase}
                  onChange={(e) => setConfirmPhrase(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="deletion-reason-input" className="block text-xs font-bold text-surface-900 dark:text-white">
                  Reason for leaving (Optional):
                </label>
                <input
                  id="deletion-reason-input"
                  type="text"
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  placeholder="e.g. Privacy preferences"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={confirmPhrase !== 'DELETE MY ACCOUNT' || isDeleting}
                  className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 border-transparent disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />}
                  Permanently Erase My Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
