/**
 * User Registration API Route
 * 
 * @agent engineering-identity-access-engineer
 * @agent security-appsec-engineer
 */

import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { registerSchema } from '@/lib/schemas/auth';
import { authService } from '@/services/AuthService';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { name, email, password } = registerSchema.parse(body);

  const authResult = await authService.register({
    name,
    email,
    password,
    role: 'customer',
  });

  // Set secure cookies
  const cookieStore = await cookies();
  const secureOption = process.env.NODE_ENV === 'production';

  cookieStore.set('refreshToken', authResult.refreshToken, {
    httpOnly: true,
    secure: secureOption,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  cookieStore.set('auth_token', authResult.accessToken, {
    httpOnly: true,
    secure: secureOption,
    sameSite: 'strict',
    maxAge: 15 * 60,
    path: '/',
  });

  cookieStore.set('auth_role', authResult.user.role, {
    httpOnly: true,
    secure: secureOption,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return NextResponse.json(authResult, { status: 201 });
});
