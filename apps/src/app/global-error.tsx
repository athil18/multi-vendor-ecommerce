'use client';

import React, { useEffect } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';
import { logError } from '@/lib/logger';
import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError(error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body>
        <ErrorState
          variant="fullscreen"
          title="Critical Application Error"
          message="A fatal error occurred at the system level. We've logged the incident and our engineering team will investigate."
          error={error}
          reset={reset}
        />
      </body>
    </html>
  );
}
