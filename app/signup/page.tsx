'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import Logo from '@/public/logo';
import { signupSchema, type SignupFormData } from '@/lib/validation/auth';

type SignupForm = SignupFormData;

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setServerError(null);

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      setServerError(result.error || 'Unknown error');
      return;
    }

    router.push('/');
    router.refresh();
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-md border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden p-8">
        <div className="flex flex-col items-center mb-6">
          <Logo size={56} />
          <h1 className="text-2xl font-semibold mt-4">Sign up</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register('email')}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent px-3 py-2 text-sm outline-none focus:border-(--glint) transition-colors"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Username"
              {...register('username')}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent px-3 py-2 text-sm outline-none focus:border-(--glint) transition-colors"
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              {...register('password')}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent px-3 py-2 text-sm outline-none focus:border-(--glint) transition-colors"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-xs text-red-500 text-center">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-linear-to-r from-(--glint)/80 to-(--glint) text-white font-semibold py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? 'Signing up...' : 'Sign up'}
          </button>
        </form>

        <p className="text-xs text-gray-500 dark:text-gray-300 text-center mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-(--glint) hover:opacity-80 transition-opacity"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
