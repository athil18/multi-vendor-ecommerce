import { describe, it, expect, beforeEach } from 'vitest';
import { POST as registerRoute } from '@/app/api/auth/register/route';
import { POST as loginRoute } from '@/app/api/auth/login/route';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

describe('Authentication API', () => {
  beforeEach(async () => {
    try {
      await prisma.user.deleteMany({});
    } catch {}
  });

  const createRequest = (url: string, body: any) => {
    return new NextRequest(new URL(url, 'http://localhost'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  it('should successfully register a new user', async () => {
    const req = createRequest('/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      role: 'customer',
    });

    const res = await registerRoute(req, { params: Promise.resolve({}) });
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.user.email).toBe('test@example.com');
  });

  it('should reject duplicate registration', async () => {
    // First registration
    await registerRoute(
      createRequest('/api/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer',
      }),
      { params: Promise.resolve({}) }
    );

    // Duplicate registration
    const req2 = createRequest('/api/auth/register', {
      name: 'Another User',
      email: 'test@example.com',
      password: 'Password123!',
      role: 'customer',
    });

    const res2 = await registerRoute(req2, { params: Promise.resolve({}) });
    const data2 = await res2.json();

    expect(res2.status).toBe(409);
    expect(data2.code || data2.errorCode).toBe('AUTH_USER_EXISTS');
  });

  it('should successfully login an existing user', async () => {
    // Setup user
    await registerRoute(
      createRequest('/api/auth/register', {
        name: 'Login User',
        email: 'login@example.com',
        password: 'Password123!',
        role: 'customer',
      }),
      { params: Promise.resolve({}) }
    );

    // Login
    const req = createRequest('/api/auth/login', {
      email: 'login@example.com',
      password: 'Password123!',
    });

    const res = await loginRoute(req, { params: Promise.resolve({}) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.accessToken).toBeDefined();
    expect(data.user.email).toBe('login@example.com');
  });

  it('should reject invalid credentials during login', async () => {
    // Login without registration
    const req = createRequest('/api/auth/login', {
      email: 'notfound@example.com',
      password: 'wrongpassword',
    });

    const res = await loginRoute(req, { params: Promise.resolve({}) });
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.code || data.errorCode).toBe('AUTH_INVALID_CREDENTIALS');
  });
});
