/**
 * Security Disclosures & Cryptographic Architecture
 * 
 * @agent engineering-identity-access-engineer
 * @agent security-appsec-engineer
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, ShieldCheck, KeyRound, Server, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security Disclosures & Standards | Nexus',
  description: 'Our security architecture: PCI-DSS compliance, Argon2/Bcrypt hashing, JWT rotation, and zero plain-text card storage.',
};

export default function SecurityPolicyPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Zero-Trust Architecture
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-surface-900 dark:text-white tracking-tight font-geist mb-4">
            Security & Cryptographic Standards
          </h1>
          <p className="text-lg text-surface-600 dark:text-surface-300 max-w-2xl mx-auto leading-relaxed">
            Engineered with strict zero-trust security controls, multi-tenant row-level isolation, and PCI-DSS payment tokenization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <ShieldCheck className="h-6 w-6 text-emerald-500 mb-3" />
              <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">PCI-DSS Level 1</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Credit card telemetry never touches Nexus servers. All transactions are vaulted and tokenized directly via Stripe Elements.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <KeyRound className="h-6 w-6 text-brand-500 mb-3" />
              <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">JWT Cryptography</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                HMAC SHA-256 authenticated session tokens with strict rotation, short lifetimes, and automated session revocation.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <Server className="h-6 w-6 text-indigo-500 mb-3" />
              <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">Multi-Tenant RLS</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                PostgreSQL database enforces Row-Level Security ensuring vendors can never read or mutate another creator atelier data.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
