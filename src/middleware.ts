import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// List of public paths that don't require authentication
const publicPaths = [
  '/api/auth',
  '/auth/signin',
  '/auth/signup',
  '/login',
  '/signin',
  '/signup',
  '/pricing',
  '/about',
  '/terms',
  '/privacy',
  '/blog',
  '/',
  '/_next',
  '/favicon.ico',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static files
  if (
    publicPaths.some(path => pathname.startsWith(path)) ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|json)$/)
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });
  
  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // For admin routes, redirect to the check-admin API
  if (pathname.startsWith('/admin')) {
    try {
      const adminCheck = await fetch(new URL('/api/auth/check-admin', request.url));
      if (!adminCheck.ok) {
        return new NextResponse('Forbidden', { status: 403 });
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
