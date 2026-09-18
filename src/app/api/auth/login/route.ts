/**
 * User Authentication Login Route
 * 
 * @agent engineering-identity-access-engineer
 * @agent security-appsec-engineer
 */

import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/schemas/auth';
import { authService } from '@/services/AuthService';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const limiter = await rateLimit(req, { limit: 10, windowMs: 60 * 1000 });
  if (!limiter.success) {
    return NextResponse.json(
      { message: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { email, password } = loginSchema.parse(body);

  const authResult = await authService.login({ email, password });

  // Set secure cookies
  const cookieStore = await cookies();
  const secureOption = process.env.NODE_ENV === 'production';
  
  cookieStore.set('refreshToken', authResult.refreshToken, {
    httpOnly: true,
    secure: secureOption,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  cookieStore.set('auth_token', authResult.accessToken, {
    httpOnly: true,
    secure: secureOption,
    sameSite: 'strict',
    maxAge: 15 * 60, // 15 mins
    path: '/',
  });

  cookieStore.set('auth_role', authResult.user.role, {
    httpOnly: true,
    secure: secureOption,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return NextResponse.json(authResult);
});
