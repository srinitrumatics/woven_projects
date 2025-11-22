// app/api/auth/session/route.ts
import { NextRequest } from 'next/server';
import { getUserPermissions, getUserRoles } from '@/lib/auth-service';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// This endpoint validates if the user is authenticated and returns their info with roles
export async function GET(request: NextRequest) {
  try {
    // We'll validate the session by checking if a valid userId is provided
    // In a real app, you'd validate an actual session token here
    const userIdHeader = request.headers.get('user-id');

    if (!userIdHeader) {
      return new Response(
        JSON.stringify({ authenticated: false, error: 'No user ID provided' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = parseInt(userIdHeader, 10);
    if (isNaN(userId)) {
      return new Response(
        JSON.stringify({ authenticated: false, error: 'Invalid user ID' }),
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
        isSuperAdmin: isSuperAdmin
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