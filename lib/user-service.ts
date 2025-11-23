import { db } from '../db';
import { users, organizations, userOrganizations, roles, userRoles, permissions, rolePermissions } from '../db/schema';
import { eq, and, or, inArray, exists, count } from 'drizzle-orm';
import { NewUser, NewUserRole } from '../db/schema';
import bcrypt from 'bcryptjs';

/**
 * Creates a new user
 * @param userData - The user data to create
 * @returns Promise with the created user (without password)
 */
export async function createUser(userData: NewUser) {
  try {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userDataWithHashedPassword = {
      ...userData,
      password: hashedPassword
    };

    const [newUser] = await db.insert(users).values(userDataWithHashedPassword).returning();
    // Return user data without the password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

/**
 * Updates an existing user
 * @param id - The ID of the user to update
 * @param userData - The updated user data
 * @returns Promise with the updated user (without password)
 */
export async function updateUser(id: string, userData: Partial<NewUser>) {
  try {
    // If password is being updated, hash it
    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userData.password = hashedPassword;
    }

    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id))
      .returning();
    // Return user data without the password
    if (updatedUser) {
      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    }
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
}

/**
 * Deletes a user by ID
 * @param id - The ID of the user to delete
 * @returns Promise indicating success or failure
 */
export async function deleteUser(id: string) {
  try {
    // First remove all user-organization associations
    await db.delete(userOrganizations).where(eq(userOrganizations.userId, id));
    
    // Then remove all user-role associations
    await db.delete(userRoles).where(eq(userRoles.userId, id));

    // Then delete the user itself
    const deletedUsers = await db.delete(users).where(eq(users.id, id)).returning();
    return deletedUsers.length > 0;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
}

/**
 * Gets all users
 * @returns Promise with array of users (without passwords)
 */
export async function getAllUsers() {
  try {
    const usersWithPasswords = await db.select().from(users);
    return usersWithPasswords.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

/**
 * Gets a user by ID
 * @param id - The ID of the user to get
 * @returns Promise with the user or null (without password)
 */
export async function getUserById(id: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }
}

/**
 * Gets a user by email
 * @param email - The email of the user to get
 * @returns Promise with the user or null (without password)
 */
export async function getUserByEmail(email: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw new Error('Failed to fetch user by email');
  }
}

/**
 * Assigns roles to a user for a specific organization
 * @param userId - The ID of the user
 * @param roleIds - Array of role IDs to assign
 * @param organizationId - The ID of the organization
 * @returns Promise indicating success or failure
 */
export async function assignRolesToUser(userId: string, roleIds: string[], organizationId: string) {
  try {
    await db.transaction(async (tx) => {
      // First delete existing roles for this user in the specified organization
      await tx.delete(userRoles).where(and(eq(userRoles.userId, userId), eq(userRoles.organizationId, organizationId)));

      // Insert new user-role associations for the organization
      if (roleIds.length > 0) {
        const userRoleValues = roleIds.map((roleId) => ({
          userId,
          roleId,
          organizationId,
        }));
        await tx.insert(userRoles).values(userRoleValues);
      }
    });

    return true;
  } catch (error) {
    console.error("Error assigning roles to user:", error);
    throw new Error("Failed to assign roles to user");
  }
}

/**
 * Gets roles assigned to a user for a specific organization
 * @param userId - The ID of the user
 * @param organizationId - The ID of the organization (optional, if omitted returns all roles for the user)
 * @returns Promise with array of roles for the user
 */
export async function getUserRoles(userId: string, organizationId?: string) {
  try {
    let whereCondition;
    if (organizationId !== undefined) {
      whereCondition = and(eq(userRoles.userId, userId), eq(userRoles.organizationId, organizationId));
    } else {
      whereCondition = eq(userRoles.userId, userId);
    }

    const userRoleData = await db
      .select({
        roleId: userRoles.roleId,
        roleName: roles.name,
        roleDescription: roles.description,
        organizationId: userRoles.organizationId
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(whereCondition);

    return userRoleData;
  } catch (error) {
    console.error('Error fetching user roles:', error);
    throw new Error('Failed to fetch user roles');
  }
}

/**
 * Gets all roles assigned to a user across all organizations
 * @param userId - The ID of the user
 * @returns Promise with array of roles with organization context for the user
 */
export async function getAllUserRolesWithOrganizations(userId: string) {
  try {
    const userRoleData = await db
      .select({
        roleId: userRoles.roleId,
        roleName: roles.name,
        roleDescription: roles.description,
        organizationId: userRoles.organizationId,
        organizationName: organizations.name,
        organizationDescription: organizations.description
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .innerJoin(organizations, eq(userRoles.organizationId, organizations.id))
      .where(eq(userRoles.userId, userId));

    return userRoleData;
  } catch (error) {
    console.error('Error fetching user roles with organizations:', error);
    throw new Error('Failed to fetch user roles with organizations');
  }
}

/**
 * Gets all permissions for a user (through their roles)
 * @param userId - The ID of the user
 * @returns Promise with array of permissions for the user
 */
export async function getUserPermissions(userId: string) {
  try {
    const userPermissions = await db
      .select({
        permissionId: permissions.id,
        permissionName: permissions.name,
        permissionDescription: permissions.description,
        roleName: roles.name
      })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(users.id, userId));

    return userPermissions;
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    throw new Error('Failed to fetch user permissions');
  }
}

/**
 * Checks if a user has a specific permission
 * @param userId - The ID of the user
 * @param permissionName - The name of the permission to check
 * @returns Promise with boolean indicating if user has permission
 */
export async function userHasPermission(userId: string, permissionName: string) {
  try {
    const result = await db
      .select({ count: count() })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(
        and(
          eq(users.id, userId),
          eq(permissions.name, permissionName)
        )
      );

    return result[0].count > 0;
  } catch (error) {
    console.error('Error checking user permission:', error);
    throw new Error('Failed to check user permission');
  }
}

/**
 * Removes roles from a user
 * @param userId - The ID of the user
 * @param roleIds - Array of role IDs to remove
 * @returns Promise indicating success or failure
 */
export async function removeRolesFromUser(userId: string, roleIds: string[]) {
  try {
    const result = await db
      .delete(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          inArray(userRoles.roleId, roleIds)
        )
      );

    return result.changes > 0;
  } catch (error) {
    console.error('Error removing roles from user:', error);
    throw new Error('Failed to remove roles from user');
  }
}

/**
 * Assigns organizations to a user
 * @param userId - The ID of the user
 * @param organizationIds - Array of organization IDs to assign
 * @returns Promise indicating success or failure
 */
export async function assignOrganizationsToUser(userId: string, organizationIds: string[]) {
  try {
    await db.transaction(async (tx) => {
      // First delete existing organizations for this user
      await tx.delete(userOrganizations).where(eq(userOrganizations.userId, userId));

      // Insert new user-organization associations
      if (organizationIds.length > 0) {
        const userOrgValues = organizationIds.map((orgId) => ({
          userId,
          organizationId: orgId,
        }));
        await tx.insert(userOrganizations).values(userOrgValues);
      }
    });

    return true;
  } catch (error) {
    console.error("Error assigning organizations to user:", error);
    throw new Error("Failed to assign organizations to user");
  }
}

/**
 * Gets organizations assigned to a user
 * @param userId - The ID of the user
 * @returns Promise with array of organizations for the user
 */
export async function getUserOrganizations(userId: string) {
  try {
    const userOrgData = await db
      .select({
        organizationId: userOrganizations.organizationId,
        organizationName: organizations.name,
        organizationDescription: organizations.description
      })
      .from(userOrganizations)
      .innerJoin(organizations, eq(userOrganizations.organizationId, organizations.id))
      .where(eq(userOrganizations.userId, userId));

    return userOrgData;
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    throw new Error('Failed to fetch user organizations');
  }
}

/**
 * Removes organizations from a user
 * @param userId - The ID of the user
 * @param organizationIds - Array of organization IDs to remove
 * @returns Promise indicating success or failure
 */
export async function removeOrganizationsFromUser(userId: string, organizationIds: string[]) {
  try {
    const result = await db
      .delete(userOrganizations)
      .where(
        and(
          eq(userOrganizations.userId, userId),
          inArray(userOrganizations.organizationId, organizationIds)
        )
      );

    return result.changes > 0;
  } catch (error) {
    console.error('Error removing organizations from user:', error);
    throw new Error('Failed to remove organizations from user');
  }
}