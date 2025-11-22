// lib/api-auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from './auth-service';
import { getUserPermissions } from './auth-service';
import { getUserRoles } from './auth-service';

// Wrapper function for API route protection
export async function withAuth(
  handler: (req: NextRequest, user: any) => Promise<Response>,
  options?: { 
    roles?: string[]; 
    permissions?: string[] 
  }
) {
  return async (req: NextRequest) => {
    // Extract user ID from headers (this would come from the session validation)
    const userIdHeader = req.headers.get('user-id');
    
    if (!userIdHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - no user ID provided' },
        { status: 401 }
      );
    }

    const userId = parseInt(userIdHeader, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid user ID' },
        { status: 401 }
      );
    }

    try {
      // Get user permissions for validation
      const userPermissions = await getUserPermissions(userId);
      const userRoles = await getUserRoles(userId);
      
      // Create a mock user object for the handler
      const user = {
        id: userId,
        permissions: userPermissions,
        roles: userRoles
      };

      // Check roles if specified
      if (options?.roles) {
        const hasRequiredRole = options.roles.some(requiredRole => 
          user.roles.some((role: any) => role.name === requiredRole)
        );

        if (!hasRequiredRole) {
          // Check if user is a super admin (they can access everything)
          const isSuperAdmin = user.roles.some((role: any) => 
            role.name?.toLowerCase() === 'super admin' || 
            role.name?.toLowerCase() === 'super_admin'
          );

          if (!isSuperAdmin) {
            return NextResponse.json(
              { error: 'Forbidden - insufficient role' },
              { status: 403 }
            );
          }
        }
      }

      // Check permissions if specified
      if (options?.permissions) {
        // Super admin has all permissions
        const isSuperAdmin = user.roles.some((role: any) => 
          role.name?.toLowerCase() === 'super admin' || 
          role.name?.toLowerCase() === 'super_admin'
        );
        
        if (!isSuperAdmin) {
          const hasPermission = options.permissions.some(perm => 
            user.permissions.includes(perm)
          );

          if (!hasPermission) {
            return NextResponse.json(
              { error: 'Forbidden - insufficient permissions' },
              { status: 403 }
            );
          }
        }
      }

      // Call the original handler with validated user
      return handler(req, user);

    } catch (error) {
      console.error('API authentication error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Higher-order function specifically for GET requests
export function withGetAuth(options?: { roles?: string[]; permissions?: string[] }) {
  return (handler: (req: NextRequest, user: any) => Promise<Response>) => {
    return withAuth(handler, options);
  };
}

// Higher-order function specifically for POST requests
export function withPostAuth(options?: { roles?: string[]; permissions?: string[] }) {
  return (handler: (req: NextRequest, user: any) => Promise<Response>) => {
    return withAuth(handler, options);
  };
}

// Higher-order function specifically for PUT requests
export function withPutAuth(options?: { roles?: string[]; permissions?: string[] }) {
  return (handler: (req: NextRequest, user: any) => Promise<Response>) => {
    return withAuth(handler, options);
  };
}

// Higher-order function specifically for DELETE requests
export function withDeleteAuth(options?: { roles?: string[]; permissions?: string[] }) {
  return (handler: (req: NextRequest, user: any) => Promise<Response>) => {
    return withAuth(handler, options);
  };
}