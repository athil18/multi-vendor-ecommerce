import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { POST as loginRoute } from '@/app/api/auth/login/route';
import { POST as refreshRoute } from '@/app/api/auth/refresh/route';
import { generateRefreshToken, verifyAccessToken } from '@/lib/jwt';
import { middleware } from '@/middleware';
import prisma from '@/lib/prisma';

const routeContext = { params: Promise.resolve({}) };

function post(url: string, body: unknown) {
  return new NextRequest(new URL(url, 'http://localhost'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('IAM security invariants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(['suspended'] as const)(
    'rejects login for a %s account before issuing a session',
    async (status) => {
      const cookieStore = await cookies();
      vi.mocked(cookieStore.set).mockClear();
      await prisma.user.create({
        data: {
          name: 'Disabled User',
          email: `${status}@example.com`,
          password: await bcrypt.hash('Password123!', 10),
          role: 'customer',
          status,
        },
      });

      const response = await loginRoute(
        post('/api/auth/login', {
          email: `${status}@example.com`,
          password: 'Password123!',
        }),
        routeContext
      );

      expect([401, 403]).toContain(response.status);
      const resBody = await response.json();
      expect(['AUTHENTICATION_ERROR', 'AUTH_ACCOUNT_SUSPENDED']).toContain(resBody.code || resBody.errorCode);
      expect(cookieStore.set).not.toHaveBeenCalled();
    }
  );

  it('mints a unique refresh token for every session, even within one second', () => {
    const userId = crypto.randomUUID();
    const first = generateRefreshToken(userId);
    const second = generateRefreshToken(userId);

    expect(second).not.toBe(first);
  });

  it.each([
    [{ id: 'not-an-id', role: 'customer' }, 'invalid subject'],
    [{ id: 'clx0123456789abcdef012345', role: 'superadmin' }, 'invalid role'],
  ])('rejects access tokens with %s claims', (claims) => {
    const jwt = require('jsonwebtoken') as typeof import('jsonwebtoken');
    const token = jwt.sign(claims, process.env.JWT_SECRET || 'test-secret', { expiresIn: '15m' });

    expect(() => verifyAccessToken(token)).toThrow();
  });

  it('does not honor an external returnUrl from an authenticated auth page request', async () => {
    const jwt = require('jsonwebtoken') as typeof import('jsonwebtoken');
    const token = jwt.sign(
      { id: 'clx0123456789abcdef012345', role: 'customer' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '15m' }
    );
    const request = new NextRequest(
      'http://localhost/auth/login?returnUrl=https%3A%2F%2Fevil.example%2Fphish',
      { headers: { cookie: `auth_token=${token}` } }
    );

    const response = await middleware(request);

    expect(response.headers.get('location')).toBe('http://localhost/');
  });
});
