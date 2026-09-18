/**
 * User Logout & Session Revocation API Route
 * 
 * @agent engineering-identity-access-engineer
 * @agent security-appsec-engineer
 */

import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { verifyRefreshToken } from '@/lib/jwt';

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export const POST = withErrorHandler(async (req: NextRequest) => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const hashedRT = hashToken(refreshToken);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { refreshTokens: true },
      });
      
      if (user) {
        await prisma.user.update({
          where: { id: decoded.id },
          data: {
            refreshTokens: user.refreshTokens.filter(t => t !== hashedRT),
          },
        });
      }
    } catch (err) {
      // Ignore token verification errors on logout
    }
  }

  // Clear cookies
  cookieStore.delete('refreshToken');
  cookieStore.delete('auth_token');
  cookieStore.delete('auth_role');

  return NextResponse.json({ message: 'Logged out successfully' });
});
