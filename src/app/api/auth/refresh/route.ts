/**
 * Refresh Token API Route (Token Rotation)
 * 
 * @agent engineering-identity-access-engineer
 * @agent security-appsec-engineer
 */

import { AuthenticationError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/jwt';

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export const POST = withErrorHandler(async (req: NextRequest) => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    throw new AuthenticationError('No refresh token provided');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });
  if (!user) {
    throw new AuthenticationError('User not found');
  }

  if (user.status !== 'active') {
    throw new AuthenticationError('User account is not active');
  }

  // Validate refresh token exists in DB
  const hashedRT = hashToken(refreshToken);
  if (!user.refreshTokens || !user.refreshTokens.includes(hashedRT)) {
    throw new AuthenticationError('Invalid or already used refresh token');
  }

  // Refresh Token Rotation (RTR)
  const newAccessToken = generateAccessToken(user.id, user.role);
  const newRefreshToken = generateRefreshToken(user.id);
  const newHashedRT = hashToken(newRefreshToken);

  // Filter out old token and append new token, keeping last 5
  const filteredTokens = user.refreshTokens.filter(t => t !== hashedRT);
  const updatedTokens = [...filteredTokens, newHashedRT].slice(-5);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokens: updatedTokens },
  });

  const secureOption = process.env.NODE_ENV === 'production';
  cookieStore.set('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: secureOption,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  cookieStore.set('auth_token', newAccessToken, {
    httpOnly: true,
    secure: secureOption,
    sameSite: 'strict',
    maxAge: 15 * 60,
    path: '/',
  });

  cookieStore.set('auth_role', user.role, {
    httpOnly: true,
    secure: secureOption,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return NextResponse.json({ accessToken: newAccessToken });
});
