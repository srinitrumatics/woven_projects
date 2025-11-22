import { db } from '../db';
import { roles, roleOrganizations, permissions, rolePermissions, permissionGroups } from '../db/schema';
import { eq, and, or, inArray } from 'drizzle-orm';
import { NewRole, NewPermissionGroup } from '../db/schema';
import { NewRoleOrganization } from '../db/schema';

/**
 * Creates a new role
 * @param roleData - The role data to create
 * @returns Promise with the created role
 */
export async function createRole(roleData: NewRole) {
  try {
    const [newRole] = await db.insert(roles).values(roleData).returning();
    return newRole;
  } catch (error) {
    console.error('Error creating role:', error);
    throw new Error('Failed to create role');
  }
}

/**
 * Updates an existing role
 * @param id - The ID of the role to update
 * @param roleData - The updated role data
 * @returns Promise with the updated role
 */
export async function updateRole(id: number, roleData: Partial<NewRole>) {
  try {
    const [updatedRole] = await db
      .update(roles)
      .set({ ...roleData, updatedAt: new Date().toISOString() })
      .where(eq(roles.id, id))
      .returning();
    return updatedRole;
  } catch (error) {
    console.error('Error updating role:', error);
    throw new Error('Failed to update role');
  }
}

/**
 * Deletes a role by ID
 * @param id - The ID of the role to delete
 * @returns Promise indicating success or failure
 */
export async function deleteRole(id: number) {
  try {
    // Delete associated role-organization relationships
    await db.delete(roleOrganizations).where(eq(roleOrganizations.roleId, id));
    
    // Delete associated role-permission relationships
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));

    // Then delete the role itself
    const deletedRoles = await db.delete(roles).where(eq(roles.id, id)).returning();
    return deletedRoles.length > 0;
  } catch (error) {
    console.error('Error deleting role:', error);
    throw new Error('Failed to delete role');
  }
}

/**
 * Gets all roles
 * @returns Promise with array of roles
 */
export async function getAllRoles() {
  try {
    return await db.select().from(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw new Error('Failed to fetch roles');
  }
}

/**
 * Gets a role by ID
 * @param id - The ID of the role to get
 * @returns Promise with the role or null
 */
export async function getRoleById(id: number) {
  try {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role || null;
  } catch (error) {
    console.error('Error fetching role:', error);
    throw new Error('Failed to fetch role');
  }
}

/**
 * Gets a role by name
 * @param name - The name of the role to get
 * @returns Promise with the role or null
 */
export async function getRoleByName(name: string) {
  try {
    const [role] = await db.select().from(roles).where(eq(roles.name, name));
    return role || null;
  } catch (error) {
    console.error('Error fetching role by name:', error);
    throw new Error('Failed to fetch role by name');
  }
}

/**
 * Assigns organizations to a role
 * @param roleId - The ID of the role
 * @param organizationIds - Array of organization IDs to assign to the role
 * @returns Promise indicating success or failure
 */
export async function assignOrganizationsToRole(roleId: number, organizationIds: number[]) {
  try {
    await db.transaction(async (tx) => {
      // First delete existing role-organization associations for this role
      await tx.delete(roleOrganizations).where(eq(roleOrganizations.roleId, roleId));

      // Insert new role-organization associations
      if (organizationIds.length > 0) {
        const roleOrgValues = organizationIds.map((orgId) => ({
          roleId,
          organizationId: orgId,
        }));
        await tx.insert(roleOrganizations).values(roleOrgValues);
      }
    });

    return true;
  } catch (error) {
    console.error("Error assigning organizations to role:", error);
    throw new Error("Failed to assign organizations to role");
  }
}

/**
 * Gets organizations assigned to a role
 * @param roleId - The ID of the role
 * @returns Promise with array of organizations for the role
 */
export async function getOrganizationsForRole(roleId: number) {
  try {
    const roleOrgData = await db
      .select({
        organizationId: roleOrganizations.organizationId,
      })
      .from(roleOrganizations)
      .where(eq(roleOrganizations.roleId, roleId));

    return roleOrgData;
  } catch (error) {
    console.error('Error fetching organizations for role:', error);
    throw new Error('Failed to fetch organizations for role');
  }
}

/**
 * Removes organizations from a role
 * @param roleId - The ID of the role
 * @param organizationIds - Array of organization IDs to remove from the role
 * @returns Promise indicating success or failure
 */
export async function removeOrganizationsFromRole(roleId: number, organizationIds: number[]) {
  try {
    const result = await db
      .delete(roleOrganizations)
      .where(
        and(
          eq(roleOrganizations.roleId, roleId),
          inArray(roleOrganizations.organizationId, organizationIds)
        )
      );

    return result.changes > 0;
  } catch (error) {
    console.error('Error removing organizations from role:', error);
    throw new Error('Failed to remove organizations from role');
  }
}

/**
 * Gets all permission groups
 * @returns Promise with array of permission groups
 */
export async function getPermissionGroups() {
  try {
    return await db.select().from(permissionGroups);
  } catch (error) {
    console.error('Error fetching permission groups:', error);
    throw new Error('Failed to fetch permission groups');
  }
}

/**
 * Creates a new permission group
 * @param groupData - The permission group data to create
 * @returns Promise with the created permission group
 */
export async function createPermissionGroup(groupData: NewPermissionGroup) {
  try {
    const [newGroup] = await db.insert(permissionGroups).values(groupData).returning();
    return newGroup;
  } catch (error) {
    console.error('Error creating permission group:', error);
    throw new Error('Failed to create permission group');
  }
}

/**
 * Updates an existing permission group
 * @param id - The ID of the permission group to update
 * @param groupData - The updated permission group data
 * @returns Promise with the updated permission group
 */
export async function updatePermissionGroup(id: number, groupData: Partial<NewPermissionGroup>) {
  try {
    const [updatedGroup] = await db
      .update(permissionGroups)
      .set({ ...groupData, updatedAt: new Date().toISOString() })
      .where(eq(permissionGroups.id, id))
      .returning();
    return updatedGroup;
  } catch (error) {
    console.error('Error updating permission group:', error);
    throw new Error('Failed to update permission group');
  }
}

/**
 * Deletes a permission group by ID
 * @param id - The ID of the permission group to delete
 * @returns Promise indicating success or failure
 */
export async function deletePermissionGroup(id: number) {
  try {
    // Check if there are permissions associated with this group
    const permissionsWithGroup = await db
      .select()
      .from(permissions)
      .where(eq(permissions.groupId, id));

    if (permissionsWithGroup.length > 0) {
      // Update permissions to remove the group association instead of failing
      await db
        .update(permissions)
        .set({ groupId: null })
        .where(eq(permissions.groupId, id));
    }

    // Delete the permission group
    const deletedGroups = await db.delete(permissionGroups).where(eq(permissionGroups.id, id)).returning();
    return deletedGroups.length > 0;
  } catch (error) {
    console.error('Error deleting permission group:', error);
    throw new Error('Failed to delete permission group');
  }
}

/**
 * Gets permissions assigned to a role
 * @param roleId - The ID of the role
 * @returns Promise with array of permissions for the role
 */
export async function getRolePermissions(roleId: number) {
  try {
    const rolePermData = await db
      .select({
        permissionId: rolePermissions.permissionId,
        permissionName: permissions.name,
        permissionDescription: permissions.description
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));

    return rolePermData;
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    throw new Error('Failed to fetch role permissions');
  }
}

/**
 * Assigns permissions to a role
 * @param roleId - The ID of the role
 * @param permissionIds - Array of permission IDs to assign to the role
 * @returns Promise indicating success or failure
 */
export async function assignPermissionsToRole(roleId: number, permissionIds: number[]) {
  try {
    await db.transaction(async (tx) => {
      // First delete existing role-permission associations for this role
      await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

      // Insert new role-permission associations
      if (permissionIds.length > 0) {
        const rolePermValues = permissionIds.map((permId) => ({
          roleId,
          permissionId: permId,
        }));
        await tx.insert(rolePermissions).values(rolePermValues);
      }
    });

    return true;
  } catch (error) {
    console.error("Error assigning permissions to role:", error);
    throw new Error("Failed to assign permissions to role");
  }
}