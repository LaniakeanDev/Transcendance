import { NextResponse, type NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup');

  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
