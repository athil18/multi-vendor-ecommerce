'use client';

import React, { useEffect } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';
import { logError } from '@/lib/logger';

export default function CheckoutError({
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
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 bg-surface-50 dark:bg-surface-950">
      <ErrorState
        variant="card"
        title="Checkout Interrupted"
        message="We encountered an issue during checkout processing. Your payment was not processed yet."
        error={error}
        reset={reset}
      />
    </div>
  );
}
