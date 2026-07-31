// api/organization-api.ts
import { Organization, NewOrganization } from '../../db/schema';

// Organization API functions
export const organizationApi = {
  // Get all organizations
  async getOrganizations(): Promise<Organization[]> {
    try {
      const response = await fetch('/api/rbac/organizations');
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  },

  // Get organization by ID
  async getOrganizationById(id: string): Promise<Organization | null> {
    try {
      const response = await fetch(`/api/rbac/organizations/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch organization');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching organization:', error);
      throw error;
    }
  },

  // Create organization
  async createOrganization(orgData: Omit<NewOrganization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    try {
      const response = await fetch('/api/rbac/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orgData),
      });
      if (!response.ok) {
        throw new Error('Failed to create organization');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  },

  // Update organization
  async updateOrganization(id: string, orgData: Partial<Omit<NewOrganization, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Organization | null> {
    try {
      const response = await fetch(`/api/rbac/organizations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orgData),
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to update organization');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  },

  // Delete organization
  async deleteOrganization(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/rbac/organizations/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting organization:', error);
      throw error;
    }
  },
};
