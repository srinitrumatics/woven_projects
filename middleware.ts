// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check if user is authenticated by looking for session cookie
  const sessionCookie = request.cookies.get('session')?.value;
  const isAuthenticated = Boolean(sessionCookie);

  // If not authenticated and accessing a protected route
  if (!isAuthenticated) {
    const isProtectedRoute = isProtectedRoutePath(request.nextUrl.pathname);

    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      url.search = `return=${encodeURIComponent(request.nextUrl.pathname)}`;
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
    '/program360',
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