'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Logo from '@/public/logo';

const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    document.title = 'Sign up | Glint';
  }, []);

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
    <main
      id="main-content"
      className="flex flex-1 items-center justify-center px-4"
    >
      <div className="w-full max-w-md border border-[#8c95a6] dark:border-[#535f71] rounded-lg overflow-hidden p-8">
        <div className="flex flex-col items-center mb-6">
          <Logo size={56} />
          <h1 className="text-2xl font-semibold mt-4">Sign up</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
              className="w-full rounded-lg border border-[#8c95a6] dark:border-[#535f71] bg-transparent px-3 py-2 text-sm outline-none focus:border-(--glint) transition-colors"
            />
            {errors.email && (
              <p
                id="email-error"
                className="text-xs text-[#ea0410] dark:text-red-500 mt-1"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'username-error' : undefined}
              {...register('username')}
              className="w-full rounded-lg border border-[#8c95a6] dark:border-[#535f71] bg-transparent px-3 py-2 text-sm outline-none focus:border-(--glint) transition-colors"
            />
            {errors.username && (
              <p
                id="username-error"
                className="text-xs text-[#ea0410] dark:text-red-500 mt-1"
              >
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
              className="w-full rounded-lg border border-[#8c95a6] dark:border-[#535f71] bg-transparent px-3 py-2 text-sm outline-none focus:border-(--glint) transition-colors"
            />
            {errors.password && (
              <p
                id="password-error"
                className="text-xs text-[#ea0410] dark:text-red-500 mt-1"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {serverError && (
            <p
              role="alert"
              className="text-xs text-[#ea0410] dark:text-red-500 text-center"
            >
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-linear-to-r from-(--glint)/80 to-(--glint) text-black font-semibold py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? 'Signing up...' : 'Sign up'}
          </button>
        </form>

        <p className="text-xs text-gray-500 dark:text-gray-300 text-center mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-[#906e01] dark:text-(--glint) hover:opacity-80 transition-opacity"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
