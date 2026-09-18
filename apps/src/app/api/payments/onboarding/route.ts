/**
 * Stripe Express Connected Account Onboarding Route
 * 
 * @agent engineering-payments-billing-engineer
 * @agent engineering-backend-architect
 */

import { AuthorizationError, NotFoundError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user || user.role !== 'seller') {
    throw new AuthorizationError('Forbidden');
  }

  const store = await prisma.store.findUnique({ where: { sellerId: user.id } });
  if (!store) {
    throw new NotFoundError('Store not found');
  }

  let accountId = store.stripeConnectedAccountId;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
      business_profile: { url: appUrl },
    });
    accountId = account.id;
    await prisma.store.update({
      where: { id: store.id },
      data: { stripeConnectedAccountId: accountId },
    });
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/seller?onboarding=refresh`,
    return_url: `${appUrl}/seller?onboarding=complete`,
    type: 'account_onboarding',
  });

  return NextResponse.json({ url: accountLink.url });
});

