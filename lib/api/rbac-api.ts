// api/rbac-api.ts
import { NewUser, User, NewRole, Role, NewPermission, Permission, UserRole, PermissionGroup, NewPermissionGroup, Organization, NewOrganization } from '../../db/schema';
import { getPermissionGroups } from '../../lib/role-service';

// User API functions
export const userApi = {
  // Get all users
  async getUsers(): Promise<Omit<User, 'password'>[]> {
    try {
      const response = await fetch('/api/rbac/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(id: number): Promise<Omit<User, 'password'> | null> {
    try {
      const response = await fetch(`/api/rbac/users/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Create user
  async createUser(userData: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<Omit<User, 'password'>> {
    try {
      const response = await fetch('/api/rbac/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(id: number, userData: Partial<Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Omit<User, 'password'> | null> {
    try {
      const response = await fetch(`/api/rbac/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to update user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(id: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/rbac/users/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Assign roles to user in an organization
  async assignRolesToUser(userId: number, roleIds: number[], organizationId: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/rbac/users/${userId}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleIds, organizationId }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error assigning roles to user:', error);
      throw error;
    }
  },

  // Get user roles (optionally for a specific organization)
  async getUserRoles(userId: number, organizationId?: number): Promise<({ roleId: number; roleName: string; roleDescription: string | null; organizationId: number })[]> {
    try {
      const url = organizationId ? `/api/rbac/users/${userId}/roles?organizationId=${organizationId}` : `/api/rbac/users/${userId}/roles`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch user roles');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user roles:', error);
      throw error;
    }
  },

  // Get all user roles with organization context
  async getAllUserRolesWithOrganizations(userId: number): Promise<({ roleId: number; roleName: string; roleDescription: string | null; organizationId: number; organizationName: string; organizationDescription: string | null })[]> {
    try {
      const response = await fetch(`/api/rbac/users/${userId}/roles-with-organizations`);
      if (!response.ok) {
        throw new Error('Failed to fetch user roles with organizations');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user roles with organizations:', error);
      throw error;
    }
  },

  // Assign organizations to user
  async assignOrganizationsToUser(userId: number, organizationIds: number[]): Promise<boolean> {
    try {
      const response = await fetch(`/api/rbac/users/${userId}/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationIds }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error assigning organizations to user:', error);
      throw error;
    }
  },

  // Get user organizations
  async getUserOrganizations(userId: number): Promise<{ organizationId: number; organizationName: string; organizationDescription: string | null }[]> {
    try {
      const response = await fetch(`/api/rbac/users/${userId}/organizations`);
      if (!response.ok) {
        throw new Error('Failed to fetch user organizations');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user organizations:', error);
      throw error;
    }
  },
};

// Role API functions
export const roleApi = {
  // Get all roles
  async getRoles(): Promise<Role[]> {
    try {
      const response = await fetch('/api/rbac/roles');
      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  // Get role by ID
  async getRoleById(id: number): Promise<Role | null> {
    try {
      const response = await fetch(`/api/rbac/roles/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch role');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  },

  // Create role
  async createRole(roleData: Omit<NewRole, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    try {
      const response = await fetch('/api/rbac/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });
      if (!response.ok) {
        throw new Error('Failed to create role');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  // Update role
  async updateRole(id: number, roleData: Partial<Omit<NewRole, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Role | null> {
    try {
      const response = await fetch(`/api/rbac/roles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to update role');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  },

  // Delete role
  async deleteRole(id: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/rbac/roles/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  },

  // Get permissions for a role
  async getRolePermissions(roleId: number): Promise<{ permissionId: number; permissionName: string; permissionDescription: string | null }[]> {
    try {
      const response = await fetch(`/api/rbac/roles/${roleId}/permissions`);
      if (!response.ok) {
        throw new Error('Failed to fetch role permissions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      throw error;
    }
  },

  // Assign permissions to role
  async assignPermissionsToRole(roleId: number, permissionIds: number[]): Promise<boolean> {
    try {
      const response = await fetch(`/api/rbac/roles/${roleId}/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissionIds }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error assigning permissions to role:', error);
      throw error;
    }
  },

  // Assign organizations to a role
  async assignOrganizationsToRole(roleId: number, organizationIds: number[]): Promise<boolean> {
    try {
      const response = await fetch(`/api/rbac/roles/${roleId}/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationIds }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error assigning organizations to role:', error);
      throw error;
    }
  },

  // Get organizations assigned to a role
  async getOrganizationsForRole(roleId: number): Promise<{ organizationId: number }[]> {
    try {
      const response = await fetch(`/api/rbac/roles/${roleId}/organizations`);
      if (!response.ok) {
        throw new Error('Failed to fetch organizations for role');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching organizations for role:', error);
      throw error;
    }
  },
};

// Permission API functions
export const permissionApi = {
  // Get all permissions
  async getPermissions(): Promise<Permission[]> {
    try {
      const response = await fetch('/api/rbac/permissions');
      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  },

  // Get permission by ID
  async getPermissionById(id: number): Promise<Permission | null> {
    try {
      const response = await fetch(`/api/rbac/permissions/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch permission');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching permission:', error);
      throw error;
    }
  },

  // Create permission
  async createPermission(permissionData: Omit<NewPermission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Permission> {
    try {
      const response = await fetch('/api/rbac/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permissionData),
      });
      if (!response.ok) {
        throw new Error('Failed to create permission');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating permission:', error);
      throw error;
    }
  },

  // Update permission
  async updatePermission(id: number, permissionData: Partial<Omit<NewPermission, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Permission | null> {
    try {
      const response = await fetch(`/api/rbac/permissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permissionData),
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to update permission');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating permission:', error);
      throw error;
    }
  },

  // Delete permission
  async deletePermission(id: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/rbac/permissions/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting permission:', error);
      throw error;
    }
  },
};

// Permission Group API functions
export const permissionGroupApi = {
  // Get all permission groups
  async getPermissionGroups(): Promise<ReturnType<typeof getPermissionGroups> extends Promise<infer T> ? T : never> {
    try {
      const response = await fetch('/api/rbac/permission-groups');
      if (!response.ok) {
        throw new Error('Failed to fetch permission groups');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching permission groups:', error);
      throw error;
    }
  },

  // Create permission group
  async createPermissionGroup(groupData: Omit<NewPermissionGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<PermissionGroup> {
    try {
      const response = await fetch('/api/rbac/permission-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
      });
      if (!response.ok) {
        throw new Error('Failed to create permission group');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating permission group:', error);
      throw error;
    }
  },
};

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
  async getOrganizationById(id: number): Promise<Organization | null> {
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
  async updateOrganization(id: number, orgData: Partial<Omit<NewOrganization, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Organization | null> {
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
  async deleteOrganization(id: number): Promise<boolean> {
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

  // Get users in organization
  async getUsersInOrganization(orgId: number): Promise<{ id: number; name: string; email: string; createdAt: string; updatedAt: string }[]> {
    try {
      const response = await fetch(`/api/rbac/organizations/${orgId}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users in organization');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching users in organization:', error);
      throw error;
    }
  },

  // Assign users to organization
  async assignUsersToOrganization(orgId: number, userIds: number[]): Promise<boolean> {
    try {
      const response = await fetch(`/api/rbac/organizations/${orgId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error assigning users to organization:', error);
      throw error;
    }
  },
};