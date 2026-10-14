/**
 * Nexus Brain Turn API Endpoint
 * 
 * Powered by supermemoryai/company-brain dynamic skills & multi-tier memory graph.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-handler';
import { getAuthUser } from '@/lib/auth';
import { ValidationError } from '@/lib/errors';
import { brainEngine } from '@/lib/brain/engine';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  const body = await req.json();

  const prompt: string = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    throw new ValidationError('Prompt cannot be empty');
  }

  if (prompt.length > 3000) {
    throw new ValidationError('Prompt exceeds maximum length of 3,000 characters');
  }

  const rawHistory = Array.isArray(body.messages) ? body.messages : [];
  const history = rawHistory.slice(-20).map((m: any) => ({
    role: m?.role === 'assistant' ? ('assistant' as const) : ('user' as const),
    content: typeof m?.content === 'string' ? m.content.slice(0, 2000) : '',
  }));

  const role = (user?.role as 'customer' | 'seller' | 'admin') || (body.simulatedRole as any) || 'customer';
  const storeId = body.storeId || undefined;

  const result = await brainEngine.executeTurn(prompt, history, {
    userId: user?.id,
    role,
    storeId,
  });

  return NextResponse.json({
    success: true,
    data: result,
  });
});
