'use client';

import React from 'react';
import {
  BarChart3,
  Shield,
  DollarSign,
  FileCheck2,
  Settings,
  HelpCircle,
  Store,
} from 'lucide-react';
import { DashboardLayoutShell, NavItem } from './DashboardLayoutShell';

const NAV_ITEMS: NavItem[] = [
  { label: 'Analytics', href: '/admin', icon: BarChart3 },
  { label: 'Governance', href: '/admin/governance', icon: Shield },
  { label: 'Financials', href: '/admin/financials', icon: DollarSign },
  { label: 'Audit', href: '/admin/audit', icon: FileCheck2 },
];

const BOTTOM_NAV: NavItem[] = [
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Support', href: '#', icon: HelpCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutShell
      navItems={NAV_ITEMS}
      bottomNav={BOTTOM_NAV}
      brandTitle="Nexus Admin"
      brandSubtitle="Command Center"
      brandIcon={Store}
      brandContainerClass="bg-primary-container"
      brandIconClass="text-on-primary-container"
      activeIndicatorClass="border-primary bg-gradient-to-r from-primary-container/20 to-transparent text-primary"
      notificationDotClass="bg-error"
      userInitials="A"
      basePath="/admin"
    >
      {children}
    </DashboardLayoutShell>
  );
}
