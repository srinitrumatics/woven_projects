// app/api/auth/session/route.ts
import { NextRequest } from 'next/server';
import { getUserPermissions, getUserRoles } from '@/lib/auth-service';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// This endpoint validates if the user is authenticated and returns their info with roles
export async function GET(request: NextRequest) {
  try {
    // We'll validate the session by checking for a valid session cookie or user ID
    // First check for session cookie
    const userIdCookie = request.cookies.get('user_id')?.value;
    const sessionIdCookie = request.cookies.get('session_id')?.value;

    let userId: number | null = null;

    // If there's a userId cookie, use that
    if (userIdCookie) {
      userId = parseInt(userIdCookie, 10);
    } else {
      // Fallback to header for API calls
      const userIdHeader = request.headers.get('user-id');
      if (userIdHeader) {
        userId = parseInt(userIdHeader, 10);
      }
    }

    if (!userId || isNaN(userId)) {
      return new Response(
        JSON.stringify({ authenticated: false, error: 'No valid session found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user from database
    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return new Response(
        JSON.stringify({ authenticated: false, error: 'User not found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user permissions and roles from database
    const userPermissions = await getUserPermissions(userId);
    const userRoles = await getUserRoles(userId);

    // Check if user is a super admin (has a role named 'Super Admin')
    const isSuperAdmin = userRoles.some((role: any) =>
      role.name?.toLowerCase() === 'super admin' ||
      role.name?.toLowerCase() === 'super_admin'
    );

    // Check route-level permissions based on the current route
    const requestedRoute = request.nextUrl.searchParams.get('route');

    // Determine if user has access to this specific route
    let hasRouteAccess = true; // Default to true if no route specified
    if (requestedRoute) {
      hasRouteAccess = hasRouteLevelPermission(userRoles, userPermissions, requestedRoute, isSuperAdmin);
    }

    return new Response(
      JSON.stringify({
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        roles: userRoles,
        permissions: userPermissions,
        isSuperAdmin: isSuperAdmin,
        hasRouteAccess: hasRouteAccess
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Session validation error:', error);
    return new Response(
      JSON.stringify({ authenticated: false, error: 'Session validation failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Helper function to check route-level permissions
function hasRouteLevelPermission(
  userRoles: any[],
  userPermissions: string[],
  requestedRoute: string,
  isSuperAdmin: boolean
): boolean {
  // Super admin has access to everything
  if (isSuperAdmin) return true;

  // Define route permissions mapping
  const routePermissions: { [key: string]: string[] } = {
    '/admin': ['user-management', 'role-management', 'permission-management'],
    '/admin/users': ['user-management'],
    '/admin/roles': ['role-management'],
    '/admin/permissions': ['permission-management'],
    '/products': ['product-list', 'product-read'],
    '/orders': ['order-list', 'order-read'],
    '/proposals': ['proposal-list', 'proposal-read'],
    '/quotes': ['quote-list', 'quote-read'],
    '/invoices': ['invoice-list', 'invoice-read'],
    '/shipments': ['shipment-list', 'shipment-read'],
    '/inventory': ['inventory-list', 'inventory-read'],
    '/reports': ['report-list', 'report-read'],
  };

  // Get required permissions for the route
  const requiredPermissions = routePermissions[requestedRoute];

  if (!requiredPermissions || requiredPermissions.length === 0) {
    // If no specific permissions required, allow access
    return true;
  }

  // Check if user has any of the required permissions
  return requiredPermissions.some(perm => userPermissions.includes(perm));
}