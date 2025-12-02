// lib/session.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../db';
import { users, userRoles, roles, rolePermissions, permissions, userOrganizations, organizations } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';

// Interface for current user with permissions
export interface CurrentUser {
  id: string; // UUID as string
  name: string;
  email: string;
  role: string;
  permissions: string[];
  roles: {
    id: string; // UUID as string
    name: string;
    description: string | null;
  }[];
  organizations: {
    id: string; // UUID as string
    name: string;
    description: string | null;
  }[];
}

// Get current user from session
export async function getCurrentUser(organizationId?: string): Promise<CurrentUser | null> {
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

    // Use organization ID from session if not provided and available in session
    const orgId = organizationId || decryptedSession?.organizationId;

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

    // Get user's roles for the specific organization if provided
    let userRolesData;
    if (orgId) {
      // Get user's roles for the specific organization
      userRolesData = await db
        .select({
          roleId: userRoles.roleId,
          organizationId: userRoles.organizationId
        })
        .from(userRoles)
        .where(and(
          eq(userRoles.userId, user.id),
          eq(userRoles.organizationId, orgId)
        ));
    } else {
      // Get all user's roles across all organizations
      userRolesData = await db
        .select({
          roleId: userRoles.roleId,
          organizationId: userRoles.organizationId
        })
        .from(userRoles)
        .where(eq(userRoles.userId, user.id));
    }

    if (userRolesData.length === 0) {
      // User has no roles but exists, return user with empty permissions and organizations
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'USER', // Default role
        permissions: [],
        roles: [],
        organizations: []
      };
    }

    const roleIds = userRolesData.map(ur => ur.roleId);

    // Get role details
    const rolesData = await db
      .select()
      .from(roles)
      .where(inArray(roles.id, roleIds));

    // Get all permissions for these roles within the specific organization context
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

    // Get user's organizations
    const userOrgs = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        description: organizations.description
      })
      .from(userOrganizations)
      .innerJoin(organizations, eq(userOrganizations.organizationId, organizations.id))
      .where(eq(userOrganizations.userId, user.id));

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
      })),
      organizations: userOrgs
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Require authentication
export async function requireAuth(allowedPermissions?: string[], organizationId?: string) {
  // If no organization ID is provided, try to get it from the session cookie
  
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
 console.log('called  requireAuth:', sessionCookie);
    if (sessionCookie) {
      console.log('Session Cookie in requireAuth:', sessionCookie);
      try {
        const decryptedSession = await decrypt(sessionCookie);
        if (decryptedSession?.organizationId) {
          organizationId = decryptedSession.organizationId;
        }
      } catch (error) {
        console.error('Error getting organization ID from session:', error);
      }
    }
  const user = await getCurrentUser(organizationId);
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
export async function createSession(userId: string, organizationId?: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const sessionData = { userId, organizationId, expires };
  const session = await encrypt(sessionData);
  const cookieStore = await cookies();

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    path: '/',
  });
}

// Encrypt the session
export async function encrypt(payload: any) {
  // In a real app, use a robust encryption library like iron-session or jose
  return JSON.stringify(payload);
}

// Get user data by ID (used during login to get complete user info)
export async function getUserById(userId: string, organizationId?: string): Promise<CurrentUser | null> {
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

  // Get user's roles for the specific organization if provided
  let userRolesData;
  if (organizationId) {
    // Get user's roles for the specific organization
    userRolesData = await db
      .select({
        roleId: userRoles.roleId,
        organizationId: userRoles.organizationId
      })
      .from(userRoles)
      .where(and(
        eq(userRoles.userId, user.id),
        eq(userRoles.organizationId, organizationId)
      ));
  } else {
    // Get all user's roles across all organizations
    userRolesData = await db
      .select({
        roleId: userRoles.roleId,
        organizationId: userRoles.organizationId
      })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));
  }

  if (userRolesData.length === 0) {
    // User has no roles but exists, return user with empty permissions and organizations
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'USER', // Default role
      permissions: [],
      roles: [],
      organizations: []
    };
  }

  const roleIds = userRolesData.map(ur => ur.roleId);

  // Get role details
  const rolesData = await db
    .select()
    .from(roles)
    .where(inArray(roles.id, roleIds));

  // Get all permissions for these roles within the specific organization context
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

  // Get user's organizations
  const userOrgs = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      description: organizations.description
    })
    .from(userOrganizations)
    .innerJoin(organizations, eq(userOrganizations.organizationId, organizations.id))
    .where(eq(userOrganizations.userId, user.id));

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
    })),
    organizations: userOrgs
  };
}

// Delete a session (logout)
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// Decrypt the session
export async function decrypt(session: string) {
  // In a real app, use a robust decryption library that matches the encryption
  try {
    const parsed = JSON.parse(session);
    // Ensure backward compatibility with old session format
    if (parsed.hasOwnProperty('userId') && !parsed.hasOwnProperty('organizationId')) {
      // Old format: { userId, expires } - set organizationId to undefined
      return { ...parsed, organizationId: undefined };
    }
    return parsed;
  } catch (error) {
    console.error('Failed to parse session:', error);
    return null;
  }
}