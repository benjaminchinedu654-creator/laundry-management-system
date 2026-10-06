import { NextRequest, NextResponse } from 'next/server';

/**
 * We store tokens in localStorage, which middleware can't read.
 * Instead, we rely on the client to set a cookie named `customer_token`
 * or `admin_token` alongside localStorage on login so middleware can
 * protect routes without a round-trip.
 *
 * The cookie contains no sensitive data on its own — the backend still
 * verifies the JWT on every API call.
 */

function getToken(req: NextRequest, which: 'customer' | 'admin'): string | null {
  return (
    req.cookies.get(which === 'customer' ? 'customer_token' : 'admin_token')?.value ?? null
  );
}

// Paths that require a customer session
const CUSTOMER_PATHS = ['/dashboard', '/orders', '/notifications', '/profile'];

// Admin path prefix and its public exceptions
const ADMIN_PATH_PREFIX = '/admin';
const ADMIN_PUBLIC_PATHS = ['/admin/login'];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // --- Customer routes ---
  if (CUSTOMER_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!getToken(req, 'customer')) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
  }

  // --- Admin routes ---
  if (
    pathname.startsWith(ADMIN_PATH_PREFIX) &&
    !ADMIN_PUBLIC_PATHS.includes(pathname)
  ) {
    if (!getToken(req, 'admin')) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static assets and Next.js internals
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons|.*\\..*).*)',
  ],
};
