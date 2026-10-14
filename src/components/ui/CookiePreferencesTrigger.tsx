'use client';

import React from 'react';
import { Sliders } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CookiePreferencesTriggerProps {
  className?: string;
  variant?: 'primary' | 'outline' | 'secondary';
  label?: string;
}

export function CookiePreferencesTrigger({
  className = '',
  variant = 'primary',
  label = 'Manage Cookie Preferences',
}: CookiePreferencesTriggerProps) {
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nexus_open_cookie_preferences'));
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleClick}
      className={`inline-flex items-center gap-2 font-bold cursor-pointer ${className}`}
    >
      <Sliders className="h-4 w-4" />
      {label}
    </Button>
  );
}
