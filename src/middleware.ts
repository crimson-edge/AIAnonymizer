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
  '/admin',
  '/api/dashboard',
  '/api/admin',
  '/api/user',
  '/api/subscription',
  '/api/billing',
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

  // For dynamic paths, set the appropriate headers
  if (dynamicPaths.some(path => pathname.startsWith(path))) {
    const response = NextResponse.next();
    response.headers.set('x-middleware-cache', 'no-cache');
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  const token = await getToken({ req: request });
  
  if (!token) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // For admin routes, check admin status
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

  const response = NextResponse.next();
  response.headers.set('x-middleware-cache', 'no-cache');
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
