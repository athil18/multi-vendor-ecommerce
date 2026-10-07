/**
 * JEV AI Decision API Endpoint
 * 
 * Provides sub-millisecond, typed System-1 decisions for pricing, classification,
 * vendor risk scoring, and instant customer intent routing.
 * 
 * @agent engineering-backend-architect
 * @agent 08-data-analysis-agent
 * @agent 21-pii-sanitization-agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-handler';
import { sanitizeText } from '@/lib/pii';
import { jev, JevDecisionRequest } from '@/lib/ai/jev';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const task = body.task || 'STRUCTURED_DECISION';
  const payload = body.payload || {};

  // Sanitize text inputs in payload
  const sanitizedPayload: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'string') {
      sanitizedPayload[key] = sanitizeText(value);
    } else {
      sanitizedPayload[key] = value;
    }
  }

  const decisionReq: JevDecisionRequest = {
    task,
    payload: sanitizedPayload,
    strictMode: true,
  };

  const result = await jev.decide(decisionReq);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    ...result,
  });
});
