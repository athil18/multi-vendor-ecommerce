'use client';

import React, { useEffect } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';
import { logError } from '@/lib/logger';

export default function AdminError({
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
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
      <ErrorState
        variant="card"
        title="Admin Console Error"
        message="A system failure occurred while loading the admin console."
        error={error}
        reset={reset}
      />
    </div>
  );
}
