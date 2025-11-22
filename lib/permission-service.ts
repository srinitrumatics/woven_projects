import { db } from '../db';
import { permissions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { NewPermission } from '../db/schema';

/**
 * Creates a new permission
 * @param permissionData - The permission data to create
 * @returns Promise with the created permission
 */
export async function createPermission(permissionData: NewPermission) {
  try {
    const [newPermission] = await db.insert(permissions).values(permissionData).returning();
    return newPermission;
  } catch (error) {
    console.error('Error creating permission:', error);
    throw new Error('Failed to create permission');
  }
}

/**
 * Updates an existing permission
 * @param id - The ID of the permission to update
 * @param permissionData - The updated permission data
 * @returns Promise with the updated permission
 */
export async function updatePermission(id: number, permissionData: Partial<NewPermission>) {
  try {
    const [updatedPermission] = await db
      .update(permissions)
      .set({ ...permissionData, updatedAt: new Date().toISOString() })
      .where(eq(permissions.id, id))
      .returning();
    return updatedPermission;
  } catch (error) {
    console.error('Error updating permission:', error);
    throw new Error('Failed to update permission');
  }
}

/**
 * Deletes a permission by ID
 * @param id - The ID of the permission to delete
 * @returns Promise indicating success or failure
 */
export async function deletePermission(id: number) {
  try {
    // First remove all role-permission associations that use this permission
    const { count } = await db.delete(permissions).where(eq(permissions.id, id));
    return count > 0;
  } catch (error) {
    console.error('Error deleting permission:', error);
    throw new Error('Failed to delete permission');
  }
}

/**
 * Gets all permissions
 * @returns Promise with array of permissions
 */
export async function getAllPermissions() {
  try {
    return await db.select().from(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw new Error('Failed to fetch permissions');
  }
}

/**
 * Gets a permission by ID
 * @param id - The ID of the permission to get
 * @returns Promise with the permission or null
 */
export async function getPermissionById(id: number) {
  try {
    const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
    return permission || null;
  } catch (error) {
    console.error('Error fetching permission:', error);
    throw new Error('Failed to fetch permission');
  }
}

/**
 * Gets permissions by name
 * @param name - The name of the permission to get
 * @returns Promise with the permission or null
 */
export async function getPermissionByName(name: string) {
  try {
    const [permission] = await db.select().from(permissions).where(eq(permissions.name, name));
    return permission || null;
  } catch (error) {
    console.error('Error fetching permission by name:', error);
    throw new Error('Failed to fetch permission by name');
  }
}