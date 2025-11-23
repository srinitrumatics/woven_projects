import { db } from '../db';
import { users, roles, userRoles, rolePermissions, permissions } from '../db/schema';
import { eq, and, inArray, or } from 'drizzle-orm';
import { compare } from 'bcryptjs';

// Note: This service is intended for server-side usage only (API routes)
// because it imports database connection which is not available on the client

export interface UserWithPermissions {
  id: string; // UUID as string
  name: string;
  email: string;
  roles: RoleWithPermissions[];
  permissions: string[];
}

export interface RoleWithPermissions {
  id: string; // UUID as string
  name: string;
  description: string | null;
  permissions: string[];
}

/**
 * Authenticate user with email and password
 * @param email User's email
 * @param password User's password
 * @returns User object with roles and permissions or null if authentication fails
 */
export async function authenticateUser(email: string, password: string): Promise<UserWithPermissions | null> {
  try {
    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return null;
    }

    // Verify password
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    // Get user's roles
    const userRoleRecords = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));

    if (userRoleRecords.length === 0) {
      // Return user with no roles/permissions
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: [],
        permissions: []
      };
    }

    const roleIds = userRoleRecords.map(ur => ur.roleId);

    // Get roles with their details
    const rolesData = await db
      .select()
      .from(roles)
      .where(inArray(roles.id, roleIds));

    // Get all permissions for these roles
    const rolePermissionsData = await db
      .select({
        roleId: rolePermissions.roleId,
        permissionName: permissions.name
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(inArray(rolePermissions.roleId, roleIds));

    // Group permissions by role
    const permissionsByRole: { [key: number]: string[] } = {};
    rolePermissionsData.forEach(rp => {
      if (!permissionsByRole[rp.roleId]) {
        permissionsByRole[rp.roleId] = [];
      }
      permissionsByRole[rp.roleId].push(rp.permissionName);
    });

    // Build roles with permissions
    const rolesWithPermissions: RoleWithPermissions[] = rolesData.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: permissionsByRole[role.id] || []
    }));

    // Get all unique permissions for the user
    const allPermissions = Array.from(
      new Set(rolePermissionsData.map(rp => rp.permissionName))
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: rolesWithPermissions,
      permissions: allPermissions
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Check if a user has a specific permission
 * @param userId The user ID
 * @param permission The permission to check for
 * @returns Boolean indicating if user has the permission
 */
export async function userHasPermission(userId: string, permission: string): Promise<boolean> {
  try {
    // Get the user's permissions by joining through userRoles and rolePermissions
    const userPermissions = await db
      .select({ permissionName: permissions.name })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(and(
        eq(users.id, userId),
        eq(permissions.name, permission)
      ));

    return userPermissions.length > 0;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

/**
 * Check if a user has any of the specified permissions
 * @param userId The user ID
 * @param permissions The permissions to check for
 * @returns Boolean indicating if user has any of the permissions
 */
export async function userHasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
  try {
    if (permissions.length === 0) return true;

    const userPermissions = await db
      .select({ permissionName: permissions.name })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(and(
        eq(users.id, userId),
        inArray(permissions.name, permissions)
      ));

    return userPermissions.length > 0;
  } catch (error) {
    console.error('Error checking user permissions:', error);
    return false;
  }
}

/**
 * Get all permissions for a user
 * @param userId The user ID
 * @returns Array of permission names
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const permissionsData = await db
      .select({ permissionName: permissions.name })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(users.id, userId));

    return permissionsData.map(p => p.permissionName);
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Get all roles for a user
 * @param userId The user ID
 * @returns Array of role objects with permissions
 */
export async function getUserRoles(userId: string): Promise<RoleWithPermissions[]> {
  try {
    // Get user's roles
    const userRoleRecords = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, userId));

    if (userRoleRecords.length === 0) {
      return [];
    }

    const roleIds = userRoleRecords.map(ur => ur.roleId);

    // Get roles with their details
    const rolesData = await db
      .select()
      .from(roles)
      .where(inArray(roles.id, roleIds));

    // Get all permissions for these roles
    const rolePermissionsData = await db
      .select({
        roleId: rolePermissions.roleId,
        permissionName: permissions.name
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(inArray(rolePermissions.roleId, roleIds));

    // Group permissions by role
    const permissionsByRole: { [key: string]: string[] } = {};
    rolePermissionsData.forEach(rp => {
      if (!permissionsByRole[rp.roleId]) {
        permissionsByRole[rp.roleId] = [];
      }
      permissionsByRole[rp.roleId].push(rp.permissionName);
    });

    // Build roles with permissions
    return rolesData.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: permissionsByRole[role.id] || []
    }));
  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
}