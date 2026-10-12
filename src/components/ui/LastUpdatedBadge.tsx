import React from 'react';
import { Calendar } from 'lucide-react';

interface LastUpdatedBadgeProps {
  date: string | Date;
  label?: string;
  className?: string;
}

export function LastUpdatedBadge({
  date,
  label = 'Last updated:',
  className = '',
}: LastUpdatedBadgeProps) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Format consistently
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isoString = dateObj.toISOString().split('T')[0];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-100 dark:bg-surface-800/80 border border-surface-200/60 dark:border-surface-700/60 text-surface-600 dark:text-surface-400 text-xs font-medium ${className}`}
    >
      <Calendar className="h-3.5 w-3.5 text-surface-400" aria-hidden="true" />
      <span>{label}</span>
      <time dateTime={isoString} className="font-semibold text-surface-800 dark:text-surface-200">
        {formattedDate}
      </time>
    </div>
  );
}
