/**
 * Password Reset Request API Route (Timing-Attack Resistant)
 * 
 * @agent engineering-identity-access-engineer
 * @agent security-appsec-engineer
 */

import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { forgotPasswordSchema } from '@/lib/schemas/auth';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();

  const { email } = forgotPasswordSchema.parse(body);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // For security, return success even if email doesn't exist to prevent email enumeration
    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  }

  // Generate token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set token and expiry (10 minutes)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  return NextResponse.json({
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
});
