// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

// Define route permissions
const ROUTE_PERMISSIONS = {
  '/admin': ['SUPER_ADMIN', 'ADMIN'],
  '/admin/users': ['SUPER_ADMIN', 'ADMIN_USER_MANAGEMENT', 'USER_MANAGEMENT'],
  '/admin/roles': ['SUPER_ADMIN', 'ADMIN_ROLE_MANAGEMENT', 'ROLE_MANAGEMENT'],
  '/admin/permissions': ['SUPER_ADMIN', 'ADMIN_PERMISSION_MANAGEMENT', 'PERMISSION_MANAGEMENT'],
  '/products': ['PRODUCT_LIST', 'PRODUCT_READ', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE'],
  '/orders': ['ORDER_LIST', 'ORDER_READ', 'ORDER_CREATE', 'ORDER_UPDATE', 'ORDER_DELETE'],
  '/proposals': ['PROPOSAL_LIST', 'PROPOSAL_READ', 'PROPOSAL_CREATE', 'PROPOSAL_UPDATE', 'PROPOSAL_DELETE'],
  '/quotes': ['QUOTE_LIST', 'QUOTE_READ', 'QUOTE_CREATE', 'QUOTE_UPDATE', 'QUOTE_DELETE'],
  '/invoices': ['INVOICE_LIST', 'INVOICE_READ', 'INVOICE_CREATE', 'INVOICE_UPDATE', 'INVOICE_DELETE'],
  '/shipments': ['SHIPMENT_LIST', 'SHIPMENT_READ', 'SHIPMENT_CREATE', 'SHIPMENT_UPDATE', 'SHIPMENT_DELETE'],
  '/inventory': ['INVENTORY_LIST', 'INVENTORY_READ', 'INVENTORY_CREATE', 'INVENTORY_UPDATE', 'INVENTORY_DELETE'],
  '/reports': ['REPORT_LIST', 'REPORT_READ', 'REPORT_CREATE', 'REPORT_UPDATE', 'REPORT_DELETE'],
} as const;

// Get required permissions for a route
function getRequiredRoles(pathname: string): string[] | null {
  // Exact match first
  if (ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS]) {
    return ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS] as string[];
  }

  // Check for parent path matches (e.g., /admin/users/123 matches /admin)
  for (const [route, roles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route + '/') || pathname === route) {
      return roles as string[];
    }
  }

  return null; // No restrictions
}

export async function middleware(request: NextRequest) {
  // Check if user is authenticated by looking for session cookie
  const sessionCookie = request.cookies.get('session')?.value;

  const isAuthenticated = Boolean(sessionCookie);

  // If not authenticated and accessing a protected route
  if (!isAuthenticated) {
    // Check if this is a protected route
    const isProtectedRoute = isProtectedRoutePath(request.nextUrl.pathname);

    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      url.search = `return=${encodeURIComponent(request.nextUrl.pathname)}`;
      return NextResponse.redirect(url);
    }
  }

  // If authenticated, validate permissions for specific routes
  if (isAuthenticated) {
    try {
      // Get organization ID from cookies or URL parameter if available
      const orgIdFromCookie = request.cookies.get('current_organization')?.value;
      const orgIdFromUrl = request.nextUrl.searchParams.get('organizationId');
      const organizationId = orgIdFromCookie ? parseInt(orgIdFromCookie, 10) :
                           orgIdFromUrl ? parseInt(orgIdFromUrl, 10) : undefined;

      // Make a server-side call to validate the user session and permissions
      const hasValidSession = await validateUserSession();

      if (!hasValidSession) {
        // Redirect to login if session is invalid
        const url = request.nextUrl.clone();
        url.pathname = '/auth';
        return NextResponse.redirect(url);
      }

      // Check route-level permissions
      const requiredPermission = getRequiredRoles(request.nextUrl.pathname);
      if (requiredPermission) {
        // For organization-specific permissions check, fetch user data for the organization
        // In a real implementation, you'd validate against the user's permissions in the specific org
        // For now, we'll assume valid session means valid permissions for the demo

        // If organization ID is present, you could implement additional org-specific checks here
        // This is where you would verify that the user actually has access to this route in this org
      }
    } catch (error) {
      console.error('Session validation error:', error);
      // Redirect to login on validation error
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Check if a route requires authentication
function isProtectedRoutePath(pathname: string): boolean {
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

  return protectedRoutes.some(route => pathname.startsWith(route));
}

// Validate user session server-side
async function validateUserSession(): Promise<boolean> {
  try {
    // In a real implementation, you might validate the session token against a database
    // For this demo, we'll trust that the presence of a valid session cookie indicates a valid session
    // The actual user validation happens in the session decryption logic
    return true;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
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