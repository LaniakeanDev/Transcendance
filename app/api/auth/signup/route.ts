import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSessionToken } from '@/lib/auth';
import { signupSchema } from '@/lib/validation/auth';

export async function POST(req: Request) {
  const body = await req.json();

  const validationResult = signupSchema.safeParse(body);
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => err.message);
    return NextResponse.json({ error: errors[0], errors }, { status: 400 });
  }

  const { email, username, password } = validationResult.data;

  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    return NextResponse.json(
      { error: 'This email is already in use' },
      { status: 409 }
    );
  }

  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    return NextResponse.json(
      { error: 'This pseudo is already in use' },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { email, username, passwordHash },
  });

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
