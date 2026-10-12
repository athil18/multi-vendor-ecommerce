'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Client-side error telemetry logging
    console.error('[GlobalError Root Boundary]:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: '24px',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            !
          </div>

          <h2
            style={{
              fontSize: '20px',
              fontWeight: 800,
              margin: '0 0 8px',
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            Critical System Error
          </h2>

          <p
            style={{
              fontSize: '14px',
              color: '#94a3b8',
              lineHeight: 1.6,
              margin: '0 0 24px',
            }}
          >
            A fatal error occurred at the system level. Our engineering team has been alerted and will investigate.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.location.href = '/';
              }}
              style={{
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: 'transparent',
                color: '#cbd5e1',
                border: '1px solid #475569',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Return Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
