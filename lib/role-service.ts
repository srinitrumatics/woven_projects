import { db } from '../db';
import { roles, permissions, rolePermissions } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { NewRole } from '../db/schema';

/**
 * Creates a new custom role
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
    // First remove all role-permission associations
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
 * Assigns permissions to a role
 * @param roleId - The ID of the role
 * @param permissionIds - Array of permission IDs to assign
 * @returns Promise indicating success or failure
 */
export async function assignPermissionsToRole(roleId: number, permissionIds: number[]) {
  try {
    // First delete existing permissions for this role
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    
    // Insert new role-permission associations
    if (permissionIds.length > 0) {
      const rolePermissionValues = permissionIds.map(permissionId => ({
        roleId,
        permissionId
      }));
      await db.insert(rolePermissions).values(rolePermissionValues);
    }
    
    return true;
  } catch (error) {
    console.error('Error assigning permissions to role:', error);
    throw new Error('Failed to assign permissions to role');
  }
}

/**
 * Gets permissions assigned to a role
 * @param roleId - The ID of the role
 * @returns Promise with array of permissions for the role
 */
export async function getRolePermissions(roleId: number) {
  try {
    const rolePermissionData = await db
      .select({
        permissionId: rolePermissions.permissionId,
        permissionName: permissions.name,
        permissionDescription: permissions.description
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));
    
    return rolePermissionData;
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    throw new Error('Failed to fetch role permissions');
  }
}