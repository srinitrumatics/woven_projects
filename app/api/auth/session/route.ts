// app/api/auth/session/route.ts
import { NextRequest } from 'next/server';
import { getUserPermissions, getUserRoles } from '@/lib/auth-service';
import { db } from '@/db';
import { users, userOrganizations, organizations } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/session';

// This endpoint validates if the user is authenticated and returns their info with roles
export async function GET(request: NextRequest) {
  try {
    // Validate session using the session cookie
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      return new Response(
        JSON.stringify({ authenticated: false, error: 'No valid session found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get current user with all details including organizations
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new Response(
        JSON.stringify({ authenticated: false, error: 'User not found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Destructure the user data
    const { id, name, email, permissions: userPermissions, roles: userRoles, organizations } = currentUser;

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
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          organizations: currentUser.organizations, // Include organizations in the response
        },
        roles: currentUser.roles,
        permissions: currentUser.permissions,
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