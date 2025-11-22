import { db } from '../db';
import { organizations, users, userOrganizations } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { NewOrganization } from '../db/schema';

/**
 * Creates a new organization
 * @param orgData - The organization data to create
 * @returns Promise with the created organization
 */
export async function createOrganization(orgData: NewOrganization) {
  try {
    const [newOrg] = await db.insert(organizations).values(orgData).returning();
    return newOrg;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw new Error('Failed to create organization');
  }
}

/**
 * Updates an existing organization
 * @param id - The ID of the organization to update
 * @param orgData - The updated organization data
 * @returns Promise with the updated organization
 */
export async function updateOrganization(id: number, orgData: Partial<NewOrganization>) {
  try {
    const [updatedOrg] = await db
      .update(organizations)
      .set({ ...orgData, updatedAt: new Date().toISOString() })
      .where(eq(organizations.id, id))
      .returning();
    return updatedOrg;
  } catch (error) {
    console.error('Error updating organization:', error);
    throw new Error('Failed to update organization');
  }
}

/**
 * Deletes an organization by ID
 * @param id - The ID of the organization to delete
 * @returns Promise indicating success or failure
 */
export async function deleteOrganization(id: number) {
  try {
    // Remove all user-organization associations for this organization
    await db.delete(userOrganizations).where(eq(userOrganizations.organizationId, id));

    // Then delete the organization itself
    const deletedOrgs = await db.delete(organizations).where(eq(organizations.id, id)).returning();
    return deletedOrgs.length > 0;
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw new Error('Failed to delete organization');
  }
}

/**
 * Gets all organizations
 * @returns Promise with array of organizations
 */
export async function getAllOrganizations() {
  try {
    return await db.select().from(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    throw new Error('Failed to fetch organizations');
  }
}

/**
 * Gets an organization by ID
 * @param id - The ID of the organization to get
 * @returns Promise with the organization or null
 */
export async function getOrganizationById(id: number) {
  try {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org || null;
  } catch (error) {
    console.error('Error fetching organization:', error);
    throw new Error('Failed to fetch organization');
  }
}

/**
 * Gets an organization by name
 * @param name - The name of the organization to get
 * @returns Promise with the organization or null
 */
export async function getOrganizationByName(name: string) {
  try {
    const [org] = await db.select().from(organizations).where(eq(organizations.name, name));
    return org || null;
  } catch (error) {
    console.error('Error fetching organization by name:', error);
    throw new Error('Failed to fetch organization by name');
  }
}

/**
 * Gets all users in an organization
 * @param organizationId - The ID of the organization
 * @returns Promise with array of users in the organization
 */
export async function getUsersInOrganization(organizationId: number) {
  try {
    const usersInOrg = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(userOrganizations)
      .innerJoin(users, eq(userOrganizations.userId, users.id))
      .where(eq(userOrganizations.organizationId, organizationId));

    return usersInOrg;
  } catch (error) {
    console.error('Error fetching users in organization:', error);
    throw new Error('Failed to fetch users in organization');
  }
}

/**
 * Gets all organizations for a user
 * @param userId - The ID of the user
 * @returns Promise with array of organizations for the user
 */
export async function getUserOrganizations(userId: number) {
  try {
    const orgsForUser = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        description: organizations.description,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
      })
      .from(userOrganizations)
      .innerJoin(organizations, eq(userOrganizations.organizationId, organizations.id))
      .where(eq(userOrganizations.userId, userId));

    return orgsForUser;
  } catch (error) {
    console.error('Error fetching organizations for user:', error);
    throw new Error('Failed to fetch organizations for user');
  }
}

/**
 * Assigns users to an organization
 * @param organizationId - The ID of the organization
 * @param userIds - Array of user IDs to assign
 * @returns Promise indicating success or failure
 */
export async function assignUsersToOrganization(organizationId: number, userIds: number[]) {
  try {
    await db.transaction(async (tx) => {
      // Remove existing user-organization associations for this organization
      await tx.delete(userOrganizations).where(eq(userOrganizations.organizationId, organizationId));

      // Insert new user-organization associations
      if (userIds.length > 0) {
        const userOrgValues = userIds.map((userId) => ({
          userId,
          organizationId,
        }));
        await tx.insert(userOrganizations).values(userOrgValues);
      }
    });

    return true;
  } catch (error) {
    console.error("Error assigning users to organization:", error);
    throw new Error("Failed to assign users to organization");
  }
}

/**
 * Removes users from an organization
 * @param organizationId - The ID of the organization
 * @param userIds - Array of user IDs to remove
 * @returns Promise indicating success or failure
 */
export async function removeUsersFromOrganization(organizationId: number, userIds: number[]) {
  try {
    const result = await db
      .delete(userOrganizations)
      .where(
        and(
          eq(userOrganizations.organizationId, organizationId),
          inArray(userOrganizations.userId, userIds)
        )
      );

    return result.changes > 0;
  } catch (error) {
    console.error('Error removing users from organization:', error);
    throw new Error('Failed to remove users from organization');
  }
}