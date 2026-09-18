/**
 * Stripe Connected Account Payout Status Route
 * 
 * @agent engineering-payments-billing-engineer
 * @agent engineering-backend-architect
 */

import { AuthorizationError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user || user.role !== 'seller') {
    throw new AuthorizationError('Forbidden');
  }

  const store = await prisma.store.findUnique({ where: { sellerId: user.id } });
  if (!store || !store.stripeConnectedAccountId) {
    return NextResponse.json({
      payoutsEnabled: false,
      detailsSubmitted: false,
      requirements: [],
    });
  }

  const account = await stripe.accounts.retrieve(store.stripeConnectedAccountId);

  if (
    store.payoutsEnabled !== account.payouts_enabled ||
    store.stripeOnboardingComplete !== account.details_submitted
  ) {
    await prisma.store.update({
      where: { id: store.id },
      data: {
        payoutsEnabled: account.payouts_enabled,
        stripeOnboardingComplete: account.details_submitted,
      },
    });
  }

  return NextResponse.json({
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    requirements: account.requirements?.currently_due || [],
  });
});

