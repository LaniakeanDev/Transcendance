import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createSessionToken } from '@/lib/auth';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const savedState = (await cookies()).get('oauth_state')?.value;

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(new URL('/login?error=oauth', req.url));
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.OAUTH_REDIRECT_BASE}/api/auth/oauth/google/callback`,
      grant_type: 'authorization_code',
    }),
  });
  const tokens = await tokenRes.json();
  if (!tokens.access_token) {
    return NextResponse.redirect(new URL('/login?error=oauth', req.url));
  }

  const profile = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  }).then((r) => r.json());

  if (!profile.email || !profile.verified_email) {
    return NextResponse.redirect(new URL('/login?error=oauth', req.url));
  }

  let user = await prisma.user.findFirst({
    where: { provider: 'google', providerId: profile.id },
  });
  if (!user) {
    const byEmail = await prisma.user.findUnique({
      where: { email: profile.email },
    });
    user = byEmail
      ? await prisma.user.update({
          where: { id: byEmail.id },
          data: { provider: 'google', providerId: profile.id },
        })
      : await prisma.user.create({
          data: {
            email: profile.email,
            username: await uniqueUsername(profile.email.split('@')[0]),
            provider: 'google',
            providerId: profile.id,
            avatarUrl: profile.picture,
          },
        });
  }

  const token = await createSessionToken(user.id);
  const res = NextResponse.redirect(new URL('/', req.url));
  res.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  res.cookies.delete('oauth_state');
  return res;
}

async function uniqueUsername(base: string) {
  let name = base.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20) || 'user';
  while (await prisma.user.findUnique({ where: { username: name } })) {
    name = `${base}${Math.floor(Math.random() * 10000)}`;
  }
  return name;
}
