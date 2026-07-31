import { db } from '../db';
import { organizations } from '../db/schema';
import { eq } from 'drizzle-orm';
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
export async function updateOrganization(id: string, orgData: Partial<NewOrganization>) {
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
export async function deleteOrganization(id: string) {
  try {
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
export async function getOrganizationById(id: string) {
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

