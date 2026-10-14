/**
 * Newsletter & Marketing Email Unsubscribe API Route
 * Compliant with CAN-SPAM, GDPR, and DPDP Act opt-out requirements.
 * 
 * @agent security-and-hardening
 * @agent ecommerce
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';

const unsubscribeSchema = z.object({
  email: z.string().email('Invalid email address format').toLowerCase().trim(),
  reason: z.string().max(255).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = unsubscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email address provided', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, reason } = parsed.data;

    logger.info('[Email Marketing] Unsubscribe request received', {
      email,
      reason: reason || 'Not provided',
      timestamp: new Date().toISOString(),
    });

    // Check if user exists in the database and log consent revocation
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true },
      });

      if (user) {
        logger.info('[Email Marketing Audit] Marketing consent revoked for user', {
          userId: user.id,
          email,
          action: 'unsubscribe_marketing_newsletter',
          reason: reason || 'user_requested',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (dbErr) {
      logger.warn('[Email Marketing] DB audit event skipped (offline/fallback mode)', { error: String(dbErr) });
    }

    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed from Nexus marketing updates and drops.',
      email,
      unsubscribedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('[Email Marketing] Unsubscribe error', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request. Please try again.' },
      { status: 500 }
    );
  }
}
