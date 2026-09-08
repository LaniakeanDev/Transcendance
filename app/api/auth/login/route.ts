import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validation/auth';

export async function POST(req: Request) {
  const body = await req.json();

  const validationResult = loginSchema.safeParse(body);
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => err.message);
    return NextResponse.json({ error: errors[0], errors }, { status: 400 });
  }

  const { email, password } = validationResult.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 401 });
  }

  if (!user.passwordHash) {
    return NextResponse.json(
      { error: 'This account uses a social login' },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = await createSessionToken(user.id);

  const response = NextResponse.json({ success: true });
  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
