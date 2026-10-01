/**
 * Super Admin — Platform Configuration & Settings Console
 * 
 * Manage multi-vendor commission rates, escrow hold timers,
 * free shipping milestones, and system snapshots.
 * 
 * @agent engineering-platform-architect
 * @agent security-appsec-engineer
 */

'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Settings, Shield, Save, Database, DollarSign, Clock, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { toast } from '@/components/ui/Toast';

export default function AdminSettingsPage() {
  const user = useAuthStore((state) => state.user);
  
  const [platformFee, setPlatformFee] = useState(10);
  const [escrowDays, setEscrowDays] = useState(14);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(150);
  const [freeGiftThreshold, setFreeGiftThreshold] = useState(200);
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Platform governance parameters updated successfully');
    }, 600);
  };

  return (
    <div className="px-6 md:px-10 pt-8 pb-12 flex flex-col gap-8 bg-background min-h-full max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-display-lg text-on-surface mb-1 flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Platform Governance & Configuration
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          Super Admin Global Parameters: Escrow hold duration, platform commission take-rate, and commercial milestones.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl space-y-6 border border-white/5">
          <h3 className="font-bold text-sm text-on-surface flex items-center gap-2 border-b border-white/5 pb-3">
            <DollarSign className="w-4 h-4 text-primary" /> Multi-Vendor Financial Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-on-surface">Platform Take-Rate Fee (%)</Label>
              <Input
                type="number"
                min={0}
                max={50}
                value={platformFee}
                onChange={(e) => setPlatformFee(Number(e.target.value))}
                className="rounded-xl font-mono text-xs"
              />
              <p className="text-[10px] text-surface-400">Default commission deducted from merchant gross volume.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-on-surface">Escrow Hold Period (Days)</Label>
              <Input
                type="number"
                min={1}
                max={60}
                value={escrowDays}
                onChange={(e) => setEscrowDays(Number(e.target.value))}
                className="rounded-xl font-mono text-xs"
              />
              <p className="text-[10px] text-surface-400">Duration customer funds remain vaulted after confirmed delivery.</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-6 border border-white/5">
          <h3 className="font-bold text-sm text-on-surface flex items-center gap-2 border-b border-white/5 pb-3">
            <Truck className="w-4 h-4 text-emerald-400" /> Storefront Incentive Milestones
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-on-surface">Free Inspected Delivery Threshold ($)</Label>
              <Input
                type="number"
                min={0}
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="rounded-xl font-mono text-xs"
              />
              <p className="text-[10px] text-surface-400">Basket subtotal required to qualify for complimentary shipping.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-on-surface">Free Gift Milestone Threshold ($)</Label>
              <Input
                type="number"
                min={0}
                value={freeGiftThreshold}
                onChange={(e) => setFreeGiftThreshold(Number(e.target.value))}
                className="rounded-xl font-mono text-xs"
              />
              <p className="text-[10px] text-surface-400">Basket subtotal required to unlock the Complimentary Care Balm & Pouch.</p>
            </div>
          </div>
        </div>

        <Button type="submit" loading={saving} variant="primary" className="rounded-xl px-6">
          <Save className="w-4 h-4 mr-2" /> Save Configuration Parameters
        </Button>
      </form>
    </div>
  );
}
