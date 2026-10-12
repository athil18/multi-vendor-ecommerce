'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  capturedAt?: string;
  landingPath?: string;
}

const SESSION_KEY = 'nexus_utm_session';
const FIRST_TOUCH_KEY = 'nexus_utm_first_touch';

/**
 * Retrieves the stored UTM parameters for conversion attribution
 */
export function getUtmAttribution(): UtmParams | null {
  if (typeof window === 'undefined') return null;
  try {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session) return JSON.parse(session);
    const firstTouch = localStorage.getItem(FIRST_TOUCH_KEY);
    if (firstTouch) return JSON.parse(firstTouch);
  } catch {
    // Ignore storage parse issues
  }
  return null;
}

function UtmListener() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;

    const source = searchParams.get('utm_source');
    const medium = searchParams.get('utm_medium');
    const campaign = searchParams.get('utm_campaign');
    const term = searchParams.get('utm_term');
    const content = searchParams.get('utm_content');

    // Only record if at least one UTM param is present
    if (source || medium || campaign || term || content) {
      const sanitize = (val: string | null) => (val ? val.trim().slice(0, 100) : undefined);

      const params: UtmParams = {
        utm_source: sanitize(source),
        utm_medium: sanitize(medium),
        utm_campaign: sanitize(campaign),
        utm_term: sanitize(term),
        utm_content: sanitize(content),
        capturedAt: new Date().toISOString(),
        landingPath: typeof window !== 'undefined' ? window.location.pathname : undefined,
      };

      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(params));
        // Save first touch only if not already saved
        if (!localStorage.getItem(FIRST_TOUCH_KEY)) {
          localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(params));
        }
      } catch {
        // Storage disabled or unavailable
      }
    }
  }, [searchParams]);

  return null;
}

export function UtmTracker() {
  return (
    <Suspense fallback={null}>
      <UtmListener />
    </Suspense>
  );
}
