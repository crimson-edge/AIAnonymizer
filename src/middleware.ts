import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// List of public paths that don't require authentication
const publicPaths = [
  '/api/auth',
  '/auth/signin',
  '/auth/signup',
  '/auth/verify',
  '/auth/verify-email',
  '/auth/verify-success',
  '/auth/error',
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
  '/api/webhooks',
];

// List of paths that should always be dynamic
const dynamicPaths = [
  '/settings',
  '/dashboard',
  '/api/dashboard',
  '/api/user',
  '/api/subscription',
  '/api/billing',
];

// List of admin-only paths
const adminPaths = [
  '/admin',
  '/api/admin',
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

  // Get the token and check authentication
  const token = await getToken({ req: request });

  // If no token is present, redirect to login
  if (!token) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Check admin access for admin paths
  if (adminPaths.some(path => pathname.startsWith(path))) {
    // @ts-ignore - isAdmin exists on token
    if (!token.isAdmin) {
      // Redirect non-admin users to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // For dynamic paths, set the appropriate headers
  if (dynamicPaths.some(path => pathname.startsWith(path))) {
    const response = NextResponse.next();
    response.headers.set('x-middleware-cache', 'no-cache');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
