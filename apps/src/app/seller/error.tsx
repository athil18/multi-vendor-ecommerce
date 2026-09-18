'use client';

import React, { useEffect } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';
import { logError } from '@/lib/logger';

export default function SellerError({
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
        title="Seller Dashboard Error"
        message="We encountered a problem loading your seller operations. Please try again."
        error={error}
        reset={reset}
      />
    </div>
  );
}
