import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow all auth-related routes
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/auth/signin') ||
    pathname === '/login' ||
    pathname === '/signin'
  ) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request })

  // Redirect to login if not authenticated and trying to access protected routes
  if (!token && pathname !== '/') {
    const url = new URL('/auth/signin', request.url)
    url.searchParams.set('callbackUrl', encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users based on their role
  if (token) {
    if (pathname === '/') {
      if (token.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/api-keys', request.url))
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Protect admin routes
    if (pathname.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
