'use client';

import React from 'react';
import { Role, Permission, PermissionGroup } from '../../../db/schema';
import { roleApi, permissionApi, permissionGroupApi } from '@/lib/api/rbac-api';
import { Plus, Edit, Trash2, Save, X, Shield, Key, Building2 } from 'lucide-react';

interface RoleFormProps {
  editingRole: Role | null;
  formData: {
    name: string;
    description: string;
  };
  formPermissionAssignments: number[];
  groupedPermissions: PermissionGroup[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setFormPermissionAssignments: (ids: number[]) => void;
  setShowForm: (show: boolean) => void;
  setFormData: (data: { name: string; description: string }) => void;
  setEditingRole: (role: Role | null) => void;
  loadRolesPermissionsAndOrganizations: () => Promise<void>;
  roleApi: any;
}

const RoleForm: React.FC<RoleFormProps> = ({
  editingRole,
  formData,
  formPermissionAssignments,
  groupedPermissions,
  handleInputChange,
  setFormPermissionAssignments,
  setShowForm,
  setFormData,
  setEditingRole,
  loadRolesPermissionsAndOrganizations
}) => {
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
      console.error('Failed to save role:', err);
      alert('Failed to save role');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setFormPermissionAssignments([]);
    setEditingRole(null);
    setShowForm(false);
  };

  return (
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
  );
};

export default RoleForm;