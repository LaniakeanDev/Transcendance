'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Email invalide'),
  username: z.string().min(3, 'Le pseudo doit faire au moins 3 caractères'),
  password: z
    .string()
    .min(6, 'Le mot de passe doit faire au moins 6 caractères'),
});

type SignupForm = z.infer<typeof signupSchema>;

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
      setServerError(result.error || 'Erreur inconnue');
      return;
    }

    router.push('/');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Inscription</h1>

      <input type="email" placeholder="Email" {...register('email')} />
      {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}

      <input type="text" placeholder="Pseudo" {...register('username')} />
      {errors.username && (
        <p style={{ color: 'red' }}>{errors.username.message}</p>
      )}

      <input
        type="password"
        placeholder="Mot de passe"
        {...register('password')}
      />
      {errors.password && (
        <p style={{ color: 'red' }}>{errors.password.message}</p>
      )}

      {serverError && <p style={{ color: 'red' }}>{serverError}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Inscription...' : "S'inscrire"}
      </button>
    </form>
  );
}
