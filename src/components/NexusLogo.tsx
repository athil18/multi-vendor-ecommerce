/**
 * Nexus Vector Brand Identity & Logo Component
 * 
 * @agent design-brand-guardian
 * @agent design-ui-designer
 */

import React from 'react';
import Link from 'next/link';

interface NexusLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  href?: string;
  accessibleLabel?: string;
}

export function NexusLogo({
  size = 'md',
  showText = true,
  className = '',
  href = '/',
}: NexusLogoProps) {
  const sizeMap = {
    sm: { icon: 'h-6 w-6', text: 'text-lg', badge: 'text-[9px]' },
    md: { icon: 'h-8 w-8', text: 'text-2xl', badge: 'text-[10px]' },
    lg: { icon: 'h-10 w-10', text: 'text-3xl', badge: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Hexagonal Vector Icon */}
      <div className={`relative ${currentSize.icon} flex items-center justify-center`}>
        <div className="absolute inset-0 bg-brand-600/10 dark:bg-brand-500/15 rounded-xl border border-brand-500/20 group-hover:border-brand-500/40 transition-colors" />
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full transform transition-transform group-hover:scale-105"
        >
          <rect width="64" height="64" rx="16" fill="#0B0F19" />
          <rect
            x="1"
            y="1"
            width="62"
            height="62"
            rx="15"
            stroke="#4F46E5"
            strokeWidth="2"
            strokeOpacity="0.4"
          />
          <path
            d="M32 14L48 23.2376V41.7128L32 50.9504L16 41.7128V23.2376L32 14Z"
            stroke="#4F46E5"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M32 24L40 28.6188V37.8564L32 42.4752L24 37.8564V28.6188L32 24Z"
            fill="#4F46E5"
            fillOpacity="0.9"
          />
          <circle cx="32" cy="33.24" r="3" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className={`font-black tracking-tight text-surface-900 dark:text-white ${currentSize.text}`}>
              NEXUS
            </span>
            <span className="hidden sm:inline-block text-[9px] font-bold tracking-widest uppercase text-brand-600 dark:text-brand-400">
              Curated
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Nexus Homepage" className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
