import React from 'react';
import { CatalogGridSkeleton } from '@/components/ui/Skeleton';

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
      </div>
      <CatalogGridSkeleton count={8} />
    </div>
  );
}
