Effective Route-Level Access Control in Next.js
As a senior architect, I'll give you a production-ready approach for handling route-level access in Next.js (assuming App Router, but I'll cover Pages Router too).
Architecture Overview
You need multiple layers of protection:

Middleware - First line of defense (edge-level)
Server Components - Authorization checks before data fetching
Route Handlers/API - Protect API endpoints
Client-Side - UI-level guards (not security, just UX)

1. Middleware Protection (Primary Defense)
   typescript// middleware.ts
   import { NextResponse } from 'next/server';
   import type { NextRequest } from 'next/server';
   import { getToken } from 'next-auth/jwt'; // or your auth solution

// Define route permissions
const ROUTE_PERMISSIONS = {
'/admin': ['SUPER_ADMIN', 'ADMIN'],
'/admin/users': ['SUPER_ADMIN', 'ADMIN'],
'/admin/settings': ['SUPER_ADMIN'],
'/dashboard': ['SUPER_ADMIN', 'ADMIN', 'USER'],
'/reports': ['SUPER_ADMIN', 'ADMIN'],
} as const;

export async function middleware(request: NextRequest) {
const token = await getToken({ req: request });

// Not authenticated
if (!token) {
return NextResponse.redirect(new URL('/login', request.url));
}

const pathname = request.nextUrl.pathname;
const userRole = token.role as string;

// Check if route requires specific permissions
const requiredRoles = getRequiredRoles(pathname);

if (requiredRoles && !requiredRoles.includes(userRole)) {
// Forbidden - redirect or return 403
return NextResponse.redirect(new URL('/unauthorized', request.url));
}

return NextResponse.next();
}

function getRequiredRoles(pathname: string): string[] | null {
// Exact match first
if (ROUTE_PERMISSIONS[pathname]) {
return ROUTE_PERMISSIONS[pathname];
}

// Check for parent path matches (e.g., /admin/users/123 matches /admin)
for (const [route, roles] of Object.entries(ROUTE_PERMISSIONS)) {
if (pathname.startsWith(route + '/')) {
return roles;
}
}

return null; // No restrictions
}

export const config = {
matcher: [
'/admin/:path*',
'/dashboard/:path*',
'/reports/:path*',
'/api/:path*',
],
};

2. Server Component Authorization
   typescript// lib/auth.ts
   import { getServerSession } from 'next-auth';
   import { authOptions } from '@/app/api/auth/[...nextauth]/route';
   import { redirect } from 'next/navigation';

export async function getCurrentUser() {
const session = await getServerSession(authOptions);
return session?.user;
}

export async function requireAuth(allowedRoles?: string[]) {
const user = await getCurrentUser();

if (!user) {
redirect('/login');
}

if (allowedRoles && !allowedRoles.includes(user.role)) {
redirect('/unauthorized');
}

return user;
}

export function checkPermission(user: User, permission: string): boolean {
// Super Admin has all permissions
if (user.role === 'SUPER_ADMIN') return true;

return user.permissions?.includes(permission) ?? false;
}
typescript// app/admin/users/page.tsx
import { requireAuth, checkPermission } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminUsersPage() {
// Require specific roles
const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);

// Additional permission check if needed
if (!checkPermission(user, 'users.view')) {
redirect('/unauthorized');
}

// Fetch data - user is authorized
const users = await fetchUsers();

return <UsersTable users={users} />;
}

3. API Route Protection
   typescript// lib/api-auth.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { getToken } from 'next-auth/jwt';

export async function withAuth(
handler: (req: NextRequest, user: User) => Promise<Response>,
options?: { roles?: string[]; permissions?: string[] }
) {
return async (req: NextRequest) => {
const token = await getToken({ req });

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = token as User;

    // Check roles
    if (options?.roles && !options.roles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check permissions
    if (options?.permissions) {
      const hasPermission = options.permissions.some(perm =>
        user.role === 'SUPER_ADMIN' || user.permissions?.includes(perm)
      );

      if (!hasPermission) {
        return NextResponse.json(
          { error: 'Forbidden - insufficient permissions' },
          { status: 403 }
        );
      }
    }

    return handler(req, user);

};
}
typescript// app/api/users/route.ts
import { withAuth } from '@/lib/api-auth';
import { NextRequest } from 'next/server';

export const GET = withAuth(
async (req: NextRequest, user: User) => {
const users = await db.user.findMany();
return NextResponse.json(users);
},
{ roles: ['SUPER_ADMIN', 'ADMIN'] }
);

export const DELETE = withAuth(
async (req: NextRequest, user: User) => {
// Only super admin can delete
const { id } = await req.json();
await db.user.delete({ where: { id } });
return NextResponse.json({ success: true });
},
{ roles: ['SUPER_ADMIN'] }
);
