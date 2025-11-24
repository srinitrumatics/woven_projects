'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Role, Permission, PermissionGroup, Organization } from '../../../db/schema';
import { roleApi, permissionApi, permissionGroupApi, organizationApi } from '../../../lib/api/rbac-api';
import { Plus, Shield, Sparkles } from 'lucide-react';
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
  permissions?: Permission[];
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<{ [key: string]: string[] }>({});
  const [allRolePermissions, setAllRolePermissions] = useState<{ [key: string]: RolePermission[] }>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
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
        permissionApi.getPermissions(),
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
      const rolePermissionsMap: { [key: string]: RolePermission[] } = {};
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
      const selectedPermissionsMap: { [key: string]: string[] } = {};
      for (const role of rolesData) {
        selectedPermissionsMap[role.id] = rolePermissionsMap[role.id].map(rp => rp.permissionId);
      }
      setSelectedRolePermissions(selectedPermissionsMap);

      if (roleIdToLoad) {
        const rolePermissions = rolePermissionsMap[roleIdToLoad] || [];
        setFormPermissionAssignments(rolePermissions.map(rp => rp.permissionId));
      } else {
        setFormPermissionAssignments([]);
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

  const handleEdit = async (role: Role) => {
    setFormData({
      name: role.name,
      description: role.description || '',
    });
    setEditingRole(role);
    setShowForm(true);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-16 bg-gray-200 rounded-2xl mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Roles</div>
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#96C2DB] to-[#6B9DB8] rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Role Management
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Create and manage roles with granular permissions
                  </p>
                </div>
              </div>
              {!showForm && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setFormData({ name: '', description: '' });
                    setFormPermissionAssignments([]);
                    setEditingRole(null);
                    setShowForm(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#96C2DB] to-[#6B9DB8] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add New Role
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Form */}
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

        {/* Role List */}
        {!showForm && roles.length > 0 && (
          <RoleList
            roles={roles}
            loading={loading}
            error={error}
            allRolePermissions={allRolePermissions}
            groupedPermissions={groupedPermissions}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        )}

        {/* Empty State */}
        {roles.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-[#96C2DB]/20 to-[#6B9DB8]/20 rounded-2xl flex items-center justify-center">
                  <Shield className="w-12 h-12 text-[#6B9DB8]" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Roles Yet</h3>
              <p className="text-gray-500 mb-8">
                Get started by creating your first role with custom permissions to control access across your application.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFormData({ name: '', description: '' });
                  setFormPermissionAssignments([]);
                  setEditingRole(null);
                  setShowForm(true);
                }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#96C2DB] to-[#6B9DB8] text-white rounded-xl hover:shadow-xl transition-all duration-200 font-semibold text-lg"
              >
                <Plus className="w-6 h-6" />
                Create Your First Role
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;