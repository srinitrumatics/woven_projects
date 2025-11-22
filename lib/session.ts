// lib/session.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../db';
import { users, userRoles, roles, rolePermissions, permissions } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';

// Interface for current user with permissions
export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  roles: {
    id: number;
    name: string;
    description: string | null;
  }[];
}

// Get current user from session
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decryptedSession = await decrypt(sessionCookie);

    if (!decryptedSession?.userId) {
      return null;
    }

    const userId = decryptedSession.userId;

    // Get user from database
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return null;
    }

    // Get user's roles
    const userRolesData = await db
      .select({
        roleId: userRoles.roleId
      })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));

    if (userRolesData.length === 0) {
      // User has no roles but exists, return user with empty permissions
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'USER', // Default role
        permissions: [],
        roles: []
      };
    }

    const roleIds = userRolesData.map(ur => ur.roleId);

    // Get role details
    const rolesData = await db
      .select()
      .from(roles)
      .where(inArray(roles.id, roleIds));

    // Get all permissions for these roles
    const rolePermissionsData = await db
      .select({
        permissionId: rolePermissions.permissionId,
        permissionName: permissions.name
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(inArray(rolePermissions.roleId, roleIds));

    // Extract unique permission names
    const userPermissions = Array.from(
      new Set(rolePermissionsData.map(rp => rp.permissionName))
    );

    // Get the primary role (first role, or highest priority role if defined)
    const primaryRole = rolesData[0]?.name || 'USER';

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: primaryRole,
      permissions: userPermissions,
      roles: rolesData.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description
      }))
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Require authentication
export async function requireAuth(allowedPermissions?: string[]) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth');
  }

  // If specific permissions are required, check if user has any of them
  if (allowedPermissions && allowedPermissions.length > 0) {
    // Super admin check
    const isSuperAdmin = user.role?.toLowerCase().includes('super') || 
                         user.permissions.includes('ALL_ACCESS') ||
                         user.permissions.some((perm: string) => 
                           perm.toLowerCase().includes('super_admin') || 
                           perm.toLowerCase().includes('superadmin')
                         );

    if (!isSuperAdmin) {
      // Check if user has any of the required permissions
      const hasRequiredPermission = allowedPermissions.some(perm => 
        user.permissions.includes(perm)
      );

      if (!hasRequiredPermission) {
        redirect('/unauthorized');
      }
    }
  }

  return user;
}

// Create a new session for the user
export async function createSession(userId: number) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ userId, expires });
  const cookieStore = await cookies();

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    path: '/',
  });
}

// Decrypt the session
async function encrypt(payload: any) {
  // In a real app, use a robust encryption library like iron-session or jose
  return JSON.stringify(payload);
}

// Decrypt the session
async function decrypt(session: string) {
  // In a real app, use a robust decryption library that matches the encryption
  try {
    return JSON.parse(session);
  } catch (error) {
    console.error('Failed to parse session:', error);
    return null;
  }
}