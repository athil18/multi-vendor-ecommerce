/**
 * Password Reset Execution API Route
 * 
 * @agent engineering-identity-access-engineer
 * @agent security-appsec-engineer
 */

import { ValidationError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/schemas/auth';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();

  const { token, password } = resetPasswordSchema.parse(body);
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { gt: new Date() },
    },
  });

  if (!user) {
    throw new ValidationError('Invalid or expired password reset token');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Update password and clear reset fields and all refresh tokens
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null,
      refreshTokens: [],
    },
  });

  return NextResponse.json({ message: 'Password has been reset successfully' });
});
