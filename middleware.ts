// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * ADMIN_HOST env var defines the ONLY host allowed to access /admin-login and /admin-portal.
 * Example: ADMIN_HOST=gterp-wovn-prod.herokuapp.com
 * On localhost, admin routes are always allowed (unless ADMIN_HOST is explicitly set).
 */
const ADMIN_HOST = process.env.ADMIN_HOST || '';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // --- Admin route protection: block tenant subdomains from accessing admin ---
  const isAdminRoute =
    pathname.startsWith('/admin-login') ||
    pathname.startsWith('/admin-portal');

  if (isAdminRoute && ADMIN_HOST) {
    // Strip port from host for comparison
    const bareHost = host.split(':')[0];
    const bareAdminHost = ADMIN_HOST.split(':')[0];

    if (bareHost !== bareAdminHost) {
      // Return a clean 404 – tenant users should not even know this route exists
      return new NextResponse(null, { status: 404 });
    }
  }

  // --- Salesforce session protection for webapp routes ---
  const sessionCookie = request.cookies.get('session')?.value;
  const isAuthenticated = Boolean(sessionCookie);

  if (!isAuthenticated) {
    const isProtectedRoute = isProtectedRoutePath(pathname);

    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      url.search = `return=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Check if a route requires authentication (Salesforce Webapp)
function isProtectedRoutePath(pathname: string): boolean {
  // Completely exclude detached Admin Portal routes from Salesforce Auth checks
  if (pathname.startsWith('/admin-portal') || pathname === '/admin-login') {
    return false;
  }

  const protectedRoutes = [
    '/home',
    '/products',
    '/orders',
    '/proposals',
    '/quotes',
    '/invoices',
    '/shipments',
    '/inventory',
    '/reports'
  ];

  return protectedRoutes.some(route => pathname.startsWith(route));
}

// Specify which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication pages)
     * - unauthorized (unauthorized page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth|unauthorized).*)',
  ],
};