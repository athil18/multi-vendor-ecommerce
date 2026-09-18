'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/schemas/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { logError } from '@/lib/logger';
import { Mail, Lock, Store } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { z } from 'zod';

import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';

import { useSearchParams } from 'next/navigation';

type FormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: loginUser, token, role, hydrateCookies } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (token) {
      hydrateCookies(); // Ensure cookies are synced
      const returnUrl = searchParams?.get('returnUrl');
      if (returnUrl) {
        router.push(returnUrl);
      } else if (role === 'seller') {
        router.push('/seller');
      } else if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [token, role, router, searchParams, hydrateCookies]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Login failed');
      }

      loginUser(json.user, json.accessToken);
      
      // The useEffect will handle the redirection after token state is updated
    } catch (err: any) {
      logError(err);
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-grow items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full flex flex-col gap-8">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-primary-container p-3 text-on-primary-container shadow-lg ambient-shadow-primary">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-headline-lg text-on-surface">Welcome back to Nexus</h1>
          <p className="text-body-sm text-on-surface-variant">Sign in to your multi-vendor account</p>
        </div>

        {/* Card Form */}
        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              
              {/* Email Field */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  icon={Mail}
                  error={!!errors.email}
                  disabled={loading}
                  {...register('email')}
                />
                {errors.email && (
                  <span className="text-[10px] text-error font-semibold">{errors.email.message}</span>
                )}
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs font-bold text-primary hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  error={!!errors.password}
                  disabled={loading}
                  {...register('password')}
                />
                {errors.password && (
                  <span className="text-[10px] text-error font-semibold">{errors.password.message}</span>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" loading={loading} className="w-full mt-2">
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>

            {/* Prompt Switch */}
            <p className="text-center text-body-sm text-on-surface-variant mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="font-bold text-primary hover:underline">
                Create an Account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
