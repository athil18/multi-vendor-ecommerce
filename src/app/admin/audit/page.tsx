/**
 * Super Admin — Compliance & Security Audit Logs Console
 * 
 * Inspect cryptographic webhook events, dispute resolution logs,
 * and administrative action history.
 * 
 * @agent security-appsec-engineer
 * @agent engineering-observability-engineer
 */

'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { FileCheck2, Shield, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useQuery } from '@tanstack/react-query';

export default function AdminAuditPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const { data: logs = [] as any[], isLoading, refetch } = useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: async () => {
      const res = await fetch('/api/admin/audit', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!user,
  });

  return (
    <div className="px-6 md:px-10 pt-8 pb-12 flex flex-col gap-8 bg-background min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-display-lg text-on-surface mb-1 flex items-center gap-3">
            <FileCheck2 className="h-8 w-8 text-primary" />
            System & Security Audit Logs
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Immutable platform audit trail: Stripe webhook verification records, escrow lifecycle events, and SIEM logs.
          </p>
        </div>
        <Button variant="primary" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Logs
        </Button>
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl text-on-surface-variant">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <h3 className="font-bold text-lg text-on-surface">No Audit Events Logged</h3>
          <p className="text-xs">Security and webhook execution records will stream here in real time.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-high/60 text-on-surface-variant uppercase tracking-wider text-[10px] font-bold border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-4">Event ID</th>
                  <th className="py-3.5 px-4">Event Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Request Trace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-primary">
                      {log.eventId}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-on-surface">
                      {log.eventType}
                    </td>
                    <td className="py-3.5 px-4">
                      {log.status === 'processed' ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Processed
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1 font-semibold">
                          <AlertCircle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-surface-400">
                      {new Date(log.processedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-surface-400">
                      {log.processingDurationMs ? `${log.processingDurationMs}ms` : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-surface-500">
                      {log.requestId || 'system-internal'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
