'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/schemas/auth';
import { UserPlus, Mail, Lock, User, Store } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { z } from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { logError } from '@/lib/logger';

import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';

import { useSearchParams } from 'next/navigation';

type FormData = z.infer<typeof registerSchema>;

function RegisterForm() {
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
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Registration failed');
      }

      // Auto-login
      loginUser(
        { id: json.user.id, name: json.user.name, email: json.user.email, role: json.user.role },
        json.accessToken
      );
      // The useEffect will handle the redirection after token state is updated
    } catch (err: any) {
      logError(err);
      toast.error(err.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-grow items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-md w-full flex flex-col gap-6">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="rounded-full bg-primary-container p-3 text-on-primary-container shadow-lg ambient-shadow-primary">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-headline-lg text-on-surface">Create an Account</h1>
          <p className="text-body-sm text-on-surface-variant">Join the Nexus multi-vendor marketplace</p>
        </div>

        {/* Card Form */}
        <Card>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              
              {/* Full Name Field */}
              <div className="flex flex-col gap-1.5">
                <Label>Full Name</Label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  icon={User}
                  error={!!errors.name}
                  {...register('name')}
                />
                {errors.name && (
                  <span className="text-[10px] text-error font-semibold">{errors.name.message}</span>
                )}
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-1.5">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  icon={Mail}
                  error={!!errors.email}
                  {...register('email')}
                />
                {errors.email && (
                  <span className="text-[10px] text-error font-semibold">{errors.email.message}</span>
                )}
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  error={!!errors.password}
                  {...register('password')}
                />
                {errors.password && (
                  <span className="text-[10px] text-error font-semibold">{errors.password.message}</span>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" loading={loading} className="w-full mt-2">
                {!loading && <UserPlus className="h-4 w-4" />}
                {loading ? 'Registering...' : 'Sign Up'}
              </Button>

            </form>

            {/* Prompt Switch */}
            <p className="text-center text-body-sm text-on-surface-variant mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-bold text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
