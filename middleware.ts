// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/admin/users',
  '/admin/roles',
  '/admin/permissions',
  '/products',
  '/orders',
  '/proposals',
  '/quotes',
  '/invoices',
  '/shipments',
  '/inventory',
  '/reports'
];

export function middleware(request: NextRequest) {
  // For this client-side authentication approach, the server-side check is limited
  // since we're storing session data in localStorage on the client.
  // In a real production app, you would implement server-side sessions with cookies.
  // For now, this middleware will allow all requests to pass through,
  // and authentication will be handled client-side with the components we've built.

  // If in a real app with server sessions, we would check for auth cookies here
  // const isAuthenticated = request.cookies.get('auth-session');

  // For now, let the client-side components handle the authentication checks
  return NextResponse.next();
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