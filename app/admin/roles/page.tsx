'use client';

import React, { useState, useEffect } from 'react';
import { Role, Permission, PermissionGroup, Organization } from '../../../db/schema';
import { roleApi, permissionApi, permissionGroupApi, organizationApi } from '../../../lib/api/rbac-api';
import { Plus, Edit, Trash2, Save, X, Shield, Key, Building2 } from 'lucide-react';

interface RolePermission {
  permissionId: number;
  permissionName: string;
  permissionDescription: string | null;
}

interface GroupedPermission {
  id: number | null;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[]; // Make it optional since it might be populated later
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<{[key: number]: number[]}>({});
  const [allRolePermissions, setAllRolePermissions] = useState<{[key: number]: RolePermission[]}>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  // For form-level permission assignments (when creating/editing a role)
  const [formPermissionAssignments, setFormPermissionAssignments] = useState<number[]>([]);
  // For form-level organization selection (when creating/editing a role for a specific organization)
  const [formOrganizationSelection, setFormOrganizationSelection] = useState<number | null>(null);

  useEffect(() => {
    loadRolesPermissionsAndOrganizations();
  }, []);

  const loadRolesPermissionsAndOrganizations = async (roleIdToLoad?: number) => {
    try {
      setLoading(true);
      const [rolesData, permissionGroupsData, organizationsData, allPermissionsData] = await Promise.all([
        roleApi.getRoles(),
        permissionGroupApi.getPermissionGroups(),
        organizationApi.getOrganizations(),
        permissionApi.getPermissions(), // Load all permissions to group them
      ]);

      setRoles(rolesData);
      setOrganizations(organizationsData);

      // Group permissions by their groups
      const groupedPermsWithPermissions = permissionGroupsData.map(group => ({
        ...group,
        permissions: allPermissionsData.filter(permission => permission.groupId === group.id)
      }));

      // Also add permissions that don't belong to any group
      const ungroupedPermissions = allPermissionsData.filter(permission => permission.groupId === null);
      if (ungroupedPermissions.length > 0) {
        groupedPermsWithPermissions.push({
          id: null,
          name: "Ungrouped Permissions",
          description: "Permissions that don't belong to any group",
          createdAt: "",
          updatedAt: "",
          permissions: ungroupedPermissions
        });
      }

      setGroupedPermissions(groupedPermsWithPermissions);

      // Load permissions for each role
      const rolePermissionsMap: {[key: number]: RolePermission[]} = {};
      for (const role of rolesData) {
        try {
          const rolePermissions = await roleApi.getRolePermissions(role.id);
          rolePermissionsMap[role.id] = rolePermissions;
        } catch (err) {
          console.error(`Error loading permissions for role ${role.id}:`, err);
          rolePermissionsMap[role.id] = [];
        }
      }
      setAllRolePermissions(rolePermissionsMap);

      // Initialize selected role permissions
      const selectedPermissionsMap: {[key: number]: number[]} = {};
      for (const role of rolesData) {
        selectedPermissionsMap[role.id] = rolePermissionsMap[role.id].map(rp => rp.permissionId);
      }
      setSelectedRolePermissions(selectedPermissionsMap);

      // If we're editing a role, load its permissions into the form state (organization loading handled in handleEdit)
      if (roleIdToLoad) {
        const rolePermissions = rolePermissionsMap[roleIdToLoad] || [];
        setFormPermissionAssignments(rolePermissions.map(rp => rp.permissionId));
      } else {
        setFormPermissionAssignments([]); // Reset when not editing
        setFormOrganizationSelection(null); // Reset organization selection when not editing
      }

    } catch (err) {
      setError('Failed to load roles, permissions, and organizations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permissionId: number, roleId?: number) => {
    if (roleId !== undefined) {
      // For permission assignment to role
      setSelectedRolePermissions(prev => {
        const currentPermissions = prev[roleId] || [];
        const newPermissions = currentPermissions.includes(permissionId)
          ? currentPermissions.filter(id => id !== permissionId)
          : [...currentPermissions, permissionId];

        // Update the backend
        roleApi.assignPermissionsToRole(roleId, newPermissions)
          .then(success => {
            if (success) {
              // Update all role permissions cache
              setAllRolePermissions(prevPermissions => ({
                ...prevPermissions,
                [roleId]: groupedPermissions.flatMap(g => g.permissions)
                  .filter(p => newPermissions.includes(p.id))
                  .map(p => ({
                    permissionId: p.id,
                    permissionName: p.name,
                    permissionDescription: p.description
                  }))
              }));
            }
          })
          .catch(err => console.error('Error updating role permissions:', err));

        return {
          ...prev,
          [roleId]: newPermissions
        };
      });
    } else {
      // For form permission selection
      setFormPermissionAssignments(prev =>
        prev.includes(permissionId)
          ? prev.filter(id => id !== permissionId)
          : [...prev, permissionId]
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let savedRole: Role;
      if (editingRole) {
        // Update existing role
        savedRole = await roleApi.updateRole(editingRole.id, {
          name: formData.name,
          description: formData.description,
        });

        // Update permissions for the role
        await roleApi.assignPermissionsToRole(savedRole.id, formPermissionAssignments);

        // Update organizations for the role (only one organization)
        if (formOrganizationSelection) {
          await roleApi.assignOrganizationsToRole(savedRole.id, [formOrganizationSelection]);
        } else {
          // If no organization is selected, remove all organization assignments
          const existingOrgs = await roleApi.getOrganizationsForRole(savedRole.id);
          if (existingOrgs.length > 0) {
            await roleApi.assignOrganizationsToRole(savedRole.id, []);
          }
        }
      } else {
        // Create new role
        savedRole = await roleApi.createRole({
          name: formData.name,
          description: formData.description,
        });

        // Assign permissions to the new role
        if (formPermissionAssignments.length > 0) {
          await roleApi.assignPermissionsToRole(savedRole.id, formPermissionAssignments);
        }

        // Assign organizations to the new role (only one organization)
        if (formOrganizationSelection) {
          await roleApi.assignOrganizationsToRole(savedRole.id, [formOrganizationSelection]);
        }
      }

      // Reset form and reload data
      setFormData({ name: '', description: '' });
      setFormPermissionAssignments([]);
      setFormOrganizationSelection(null);
      setEditingRole(null);
      setShowForm(false);
      await loadRolesPermissionsAndOrganizations();
    } catch (err) {
      setError('Failed to save role');
      console.error(err);
    }
  };

  const handleEdit = async (role: Role) => {
    setFormData({
      name: role.name,
      description: role.description || '',
    });
    setEditingRole(role);
    setShowForm(true);
    // Load permissions for this role into the form
    setFormPermissionAssignments(selectedRolePermissions[role.id] || []);

    // Load the first organization for this role into the form (since we now only allow one organization)
    try {
      const roleOrganizations = await roleApi.getOrganizationsForRole(role.id);
      // Use the first organization if available, otherwise null
      setFormOrganizationSelection(roleOrganizations.length > 0 ? roleOrganizations[0].organizationId : null);
    } catch (err) {
      console.error('Error loading organizations for role:', err);
      setFormOrganizationSelection(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await roleApi.deleteRole(id);
        await loadRolesAndPermissions();
      } catch (err) {
        setError('Failed to delete role');
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setFormPermissionAssignments([]);
    setFormOrganizationSelection(null);
    setEditingRole(null);
    setShowForm(false);
  };

  if (loading) return <div className="p-8 text-center">Loading roles...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Role Management</h1>
        <button
          onClick={() => {
            setFormData({ name: '', description: '' });
            setFormPermissionAssignments([]); // Reset permissions when creating a new role
            setFormOrganizationSelection(null); // Reset organization selection when creating a new role
            setEditingRole(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Role
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingRole ? 'Edit Role' : 'Create New Role'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Organization Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Organization</label>
              <select
                value={formOrganizationSelection || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormOrganizationSelection(value === '' ? null : parseInt(value, 10));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an organization...</option>
                {organizations.map(organization => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">Select the organization to assign permissions to</p>
            </div>

            {/* Permission Assignment */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
              <div className="border border-gray-200 rounded-md p-3 max-h-96 overflow-y-auto">
                {groupedPermissions.map((group) => (
                  <div key={group.id !== null ? `group-${group.id}` : 'ungrouped'} className="mb-3">
                    <h4 className="text-sm font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded-t">
                      {group.name} ({group.permissions?.length || 0})
                    </h4>
                    <div className="pl-2 pt-1">
                      {group.permissions?.map(permission => (
                        <label key={permission.id} className="flex items-start mb-1">
                          <input
                            type="checkbox"
                            checked={formPermissionAssignments.includes(permission.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormPermissionAssignments(prev => [...prev, permission.id]);
                              } else {
                                setFormPermissionAssignments(prev => prev.filter(id => id !== permission.id));
                              }
                            }}
                            className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                            <div className="text-xs text-gray-500">{permission.description}</div>
                          </div>
                        </label>
                      ))}
                      {(!group.permissions || group.permissions.length === 0) && (
                        <p className="text-xs text-gray-500 italic pl-6">No permissions in this group</p>
                      )}
                    </div>
                  </div>
                ))}
                {groupedPermissions.length === 0 && (
                  <p className="text-sm text-gray-500">No permissions available</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingRole ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Only show role list if not in form mode (hide when creating or editing) */}
      {!showForm ? (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available In</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map(role => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Shield className="flex-shrink-0 h-10 w-10 text-gray-400" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{role.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{role.description || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {allRolePermissions[role.id]?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {allRolePermissions[role.id].map(rolePermission => (
                            <span
                              key={rolePermission.permissionId}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                            >
                              {rolePermission.permissionName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No permissions assigned</span>
                      )}
                    </div>

                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <span className="text-sm text-gray-500">Organizations list not loaded in table view</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(role)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Show empty state when there are no roles and form is not open */}
      {roles.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No roles</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new role.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Role
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;