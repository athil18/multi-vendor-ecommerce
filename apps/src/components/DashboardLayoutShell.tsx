'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X, ChevronRight, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface DashboardLayoutShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  bottomNav: NavItem[];
  brandTitle: string;
  brandSubtitle: string;
  brandIcon: React.ElementType;
  brandContainerClass: string;
  brandIconClass: string;
  activeIndicatorClass: string;
  notificationDotClass: string;
  userInitials: string;
  basePath: string;
}

function SidebarLink({
  item,
  isActive,
  activeIndicatorClass,
}: {
  item: NavItem;
  isActive: boolean;
  activeIndicatorClass: string;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors duration-200 group text-label-md',
        isActive
          ? cn('font-bold border-l-2', activeIndicatorClass)
          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{item.label}</span>
    </Link>
  );
}

export function DashboardLayoutShell({
  children,
  navItems,
  bottomNav,
  brandTitle,
  brandSubtitle,
  brandIcon: BrandIcon,
  brandContainerClass,
  brandIconClass,
  activeIndicatorClass,
  notificationDotClass,
  userInitials,
  basePath,
}: DashboardLayoutShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Derive breadcrumb from pathname
  const breadcrumbSegments = pathname
    .replace(basePath, '')
    .split('/')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

  const baseTitle = basePath.replace('/', '');
  const TitleCap = baseTitle.charAt(0).toUpperCase() + baseTitle.slice(1);

  return (
    <div className="flex min-h-screen bg-background text-on-surface overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={cn(
          'fixed left-0 top-0 z-50 flex flex-col h-screen w-60 bg-surface-container-low border-r border-white/5 shadow-sm py-4 transition-transform duration-300 md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className={cn('w-8 h-8 rounded flex items-center justify-center', brandContainerClass)}>
            <BrandIcon className={cn('h-4 w-4', brandIconClass)} />
          </div>
          <div>
            <h1 className="text-on-surface font-geist font-bold text-[18px] leading-tight">
              {brandTitle}
            </h1>
            <p className="text-label-md text-on-surface-variant font-normal">
              {brandSubtitle}
            </p>
          </div>
        </div>

        {/* Main Nav */}
        <div className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              isActive={
                item.href === basePath
                  ? pathname === basePath
                  : pathname.startsWith(item.href)
              }
              activeIndicatorClass={activeIndicatorClass}
            />
          ))}
        </div>

        {/* Bottom Nav */}
        <div className="px-3 space-y-1 pt-4 border-t border-white/5">
          {bottomNav.map((item) => (
            <SidebarLink
              key={item.label}
              item={item}
              isActive={false}
              activeIndicatorClass={activeIndicatorClass}
            />
          ))}
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant font-medium hover:bg-surface-container-high transition-colors duration-200 group w-full text-label-md">
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-60 flex flex-col min-h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 w-full h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-on-surface-variant hover:text-on-surface"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-on-surface-variant text-label-md">
              <Link href={basePath} className="hover:text-on-surface transition-colors">
                {TitleCap}
              </Link>
              {breadcrumbSegments.map((seg, i) => (
                <React.Fragment key={i}>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-on-surface">{seg}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-all relative">
              <Bell className="h-5 w-5" />
              <span className={cn('absolute top-1.5 right-1.5 w-2 h-2 rounded-full', notificationDotClass)} />
            </button>
            <div className="ml-2 w-8 h-8 rounded-full bg-surface-container-highest border border-white/10 overflow-hidden flex items-center justify-center text-on-surface-variant text-label-md font-bold">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 flex flex-col">{children}</div>
      </main>
    </div>
  );
}
