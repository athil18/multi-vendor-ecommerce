'use client';

import React, { useEffect } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';
import { logError } from '@/lib/logger';

export default function AuthError({
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
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
      <ErrorState
        variant="card"
        title="Authentication Error"
        message="We encountered a problem loading the authentication flow. Please try again."
        error={error}
        reset={reset}
      />
    </div>
  );
}
