import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error;
  reset?: () => void;
  variant?: 'fullscreen' | 'card' | 'inline';
}

export function ErrorState({
  title = 'Something went wrong',
  message = "We're sorry, but we encountered an unexpected error while loading this section.",
  error,
  reset,
  variant = 'card'
}: ErrorStateProps) {
  const isDev = process.env.NODE_ENV === 'development';

  const Content = () => (
    <div className="flex flex-col items-center justify-center text-center p-6 gap-4">
      <div className="h-16 w-16 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-500 rounded-full flex items-center justify-center mb-2">
        <AlertTriangle className="h-8 w-8" />
      </div>
      
      <div>
        <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50 mb-2" role="alert">{title}</h2>
        <p className="text-sm text-surface-500 max-w-md mx-auto leading-relaxed">{message}</p>
      </div>

      {isDev && error && (
        <div className="mt-4 p-4 bg-surface-100 dark:bg-surface-900 rounded-lg text-left w-full overflow-x-auto border border-surface-200 dark:border-surface-800">
          <p className="text-xs font-mono font-bold text-red-600 dark:text-red-400 mb-2">{error.name}: {error.message}</p>
          {error.stack && (
            <pre className="text-[10px] text-surface-600 dark:text-surface-400 font-mono whitespace-pre-wrap">
              {error.stack}
            </pre>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 mt-4">
        {reset && (
          <Button onClick={reset} variant="primary">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        <Button onClick={() => window.location.href = '/'} variant="outline">
          <Home className="h-4 w-4 mr-2" />
          Return Home
        </Button>
      </div>
    </div>
  );

  if (variant === 'fullscreen') {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col items-center justify-center p-4">
        <Card className="max-w-xl w-full border-red-200 dark:border-red-900/30">
          <CardContent>
            <Content />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="border border-red-200 dark:border-red-900/30 rounded-xl bg-red-50/50 dark:bg-red-900/10">
        <Content />
      </div>
    );
  }

  // Card Variant
  return (
    <Card className="border-red-200 dark:border-red-900/30">
      <CardContent>
        <Content />
      </CardContent>
    </Card>
  );
}
