'use client';

import React from 'react';
import {
  Store,
  LayoutDashboard,
  Receipt,
  DollarSign,
  Package,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { DashboardLayoutShell, NavItem } from './DashboardLayoutShell';

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/seller', icon: LayoutDashboard },
  { label: 'Transactions', href: '/seller/transactions', icon: Receipt },
  { label: 'Commission', href: '/seller/commission', icon: DollarSign },
  { label: 'Inventory', href: '/seller/inventory', icon: Package },
];

const BOTTOM_NAV: NavItem[] = [
  { label: 'Settings', href: '/seller/settings', icon: Settings },
  { label: 'Support', href: '#', icon: HelpCircle },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutShell
      navItems={NAV_ITEMS}
      bottomNav={BOTTOM_NAV}
      brandTitle="Nexus Seller"
      brandSubtitle="Store Console"
      brandIcon={Store}
      brandContainerClass="bg-tertiary-container"
      brandIconClass="text-on-tertiary-container"
      activeIndicatorClass="border-primary bg-gradient-to-r from-primary-container/20 to-transparent text-primary"
      notificationDotClass="bg-tertiary"
      userInitials="S"
      basePath="/seller"
    >
      {children}
    </DashboardLayoutShell>
  );
}
