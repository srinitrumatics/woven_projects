'use client';

import React, { useState, useEffect } from 'react';
import { Role, Permission, PermissionGroup, Organization } from '../../../db/schema';
import { roleApi, permissionApi, permissionGroupApi, organizationApi } from '../../../lib/api/rbac-api';
import { Plus, Edit, Trash2, Save, X, Shield, Key, Building2 } from 'lucide-react';
import RoleList from '../../../components/RoleManagement/RoleList';
import RoleForm from '../../../components/RoleManagement/RoleForm';

interface RolePermission {
  permissionId: string;
  permissionName: string;
  permissionDescription: string | null;
}

interface GroupedPermission {
  id: string | null;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[]; // Make it optional since it might be populated later
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<{[key: string]: string[]}>({});
  const [allRolePermissions, setAllRolePermissions] = useState<{[key: string]: RolePermission[]}>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  // For form-level permission assignments (when creating/editing a role)
  const [formPermissionAssignments, setFormPermissionAssignments] = useState<string[]>([]);

  useEffect(() => {
    loadRolesPermissionsAndOrganizations();
  }, []);

  const loadRolesPermissionsAndOrganizations = async (roleIdToLoad?: string) => {
    try {
      setLoading(true);
      const [rolesData, permissionGroupsData, allPermissionsData] = await Promise.all([
        roleApi.getRoles(),
        permissionGroupApi.getPermissionGroups(),
        permissionApi.getPermissions(), // Load all permissions to group them
      ]);

      setRoles(rolesData);

      // Group permissions by their groups
      const groupedPermsWithPermissions: GroupedPermission[] = permissionGroupsData.map(group => ({
        ...group,
        permissions: allPermissionsData.filter(permission => permission.groupId === group.id)
      }));

      // Also add permissions that don't belong to any group
      const ungroupedPermissions = allPermissionsData.filter(permission => permission.groupId === null);
      if (ungroupedPermissions.length > 0) {
        groupedPermsWithPermissions.push({
          id: null as string | null,
          name: "Ungrouped Permissions",
          description: "Permissions that don't belong to any group",
          createdAt: "",
          updatedAt: "",
          permissions: ungroupedPermissions
        });
      }

      setGroupedPermissions(groupedPermsWithPermissions);

      // Load permissions for each role
      const rolePermissionsMap: {[key: string]: RolePermission[]} = {};
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
      const selectedPermissionsMap: {[key: string]: string[]} = {};
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

  const handlePermissionChange = (permissionId: string, roleId?: string) => {
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
                [roleId]: groupedPermissions
                  .filter(g => g.permissions) // Only include groups that have permissions
                  .flatMap(g => g.permissions!)
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
      if (editingRole) {
        // Update existing role
        await roleApi.updateRole(editingRole.id, {
          name: formData.name,
          description: formData.description,
        });

        // Update permissions for the role
        await roleApi.assignPermissionsToRole(editingRole.id, formPermissionAssignments);
      } else {
        // Create new role
        const savedRole = await roleApi.createRole({
          name: formData.name,
          description: formData.description,
        });

        // Assign permissions to the new role
        if (formPermissionAssignments.length > 0) {
          await roleApi.assignPermissionsToRole(savedRole.id, formPermissionAssignments);
        }
      }

      // Reset form and reload data
      setFormData({ name: '', description: '' });
      setFormPermissionAssignments([]);
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

  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await roleApi.deleteRole(id);
        await loadRolesPermissionsAndOrganizations();
      } catch (err) {
        setError('Failed to delete role');
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setFormPermissionAssignments([]);
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
        <RoleForm
          editingRole={editingRole}
          formData={formData}
          formPermissionAssignments={formPermissionAssignments}
          groupedPermissions={groupedPermissions}
          handleInputChange={handleInputChange}
          setFormPermissionAssignments={setFormPermissionAssignments}
          setShowForm={setShowForm}
          setFormData={setFormData}
          setEditingRole={setEditingRole}
          loadRolesPermissionsAndOrganizations={loadRolesPermissionsAndOrganizations}
          roleApi={roleApi}
        />
      )}

      {/* Only show role list if not in form mode (hide when creating or editing) */}
      {!showForm ? (
        <RoleList
          roles={roles}
          loading={loading}
          error={error}
          allRolePermissions={allRolePermissions}
          groupedPermissions={groupedPermissions}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
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
              onClick={() => {
                setFormData({ name: '', description: '' });
                setFormPermissionAssignments([]); // Reset permissions when creating a new role
                setEditingRole(null);
                setShowForm(true);
              }}
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