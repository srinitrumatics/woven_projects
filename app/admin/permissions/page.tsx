'use client';

import React, { useState, useEffect } from 'react';
import { Permission, PermissionGroup } from '../../../db/schema';
import { permissionApi, permissionGroupApi } from '@/lib/api/rbac-api';
import { Plus, Edit, Trash2, Save, X, Key, ChevronDown, ChevronRight } from 'lucide-react';
import PermissionList from '../../../components/PermissionManagement/PermissionList';
import PermissionForm from '../../../components/PermissionManagement/PermissionForm';

interface GroupedPermission {
  id: number | null;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[]; // Make it optional since it might be populated later
}

const PermissionManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    groupId: null as number | null,
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const [allPermissions, groups] = await Promise.all([
        permissionApi.getPermissions(),
        permissionGroupApi.getPermissionGroups(),
      ]);

      setPermissions(allPermissions);
      setPermissionGroups(groups);
    } catch (err) {
      setError('Failed to load permissions and groups');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Alias for the function that loads both permissions and groups
  const loadPermissionsAndGroups = loadPermissions;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'groupId' ? (value === '' ? null : Number(value)) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let savedPermission: Permission;
      if (editingPermission) {
        // Update existing permission
        savedPermission = await permissionApi.updatePermission(editingPermission.id, {
          name: formData.name,
          description: formData.description,
          groupId: formData.groupId,
        });
      } else {
        // Create new permission
        savedPermission = await permissionApi.createPermission({
          name: formData.name,
          description: formData.description,
          groupId: formData.groupId,
        });
      }

      // Reset form and reload data
      setFormData({ name: '', description: '', groupId: null });
      setEditingPermission(null);
      setShowForm(false);
      await loadPermissions();
    } catch (err) {
      setError('Failed to save permission');
      console.error(err);
    }
  };

  const handleEdit = (permission: Permission) => {
    setFormData({
      name: permission.name,
      description: permission.description || '',
      groupId: permission.groupId || null,
    });
    setEditingPermission(permission);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      try {
        await permissionApi.deletePermission(id);
        await loadPermissions();
      } catch (err) {
        setError('Failed to delete permission');
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', groupId: null });
    setEditingPermission(null);
    setShowForm(false);
  };

  if (loading) return <div className="p-8 text-center">Loading permissions...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Permission Management</h1>
        <button
          onClick={() => {
            setFormData({ name: '', description: '', groupId: null });
            setEditingPermission(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Permission
        </button>
      </div>

      {showForm && (
        <PermissionForm
          editingPermission={editingPermission}
          formData={formData}
          permissionGroups={permissionGroups}
          handleInputChange={handleInputChange}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          loadPermissionsAndGroups={loadPermissionsAndGroups}
        />
      )}

      {/* Only show permission list if not in form mode (hide when creating or editing) */}
      {!showForm ? (
        <PermissionList
          permissions={permissions}
          permissionGroups={permissionGroups}
          loading={loading}
          error={error}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      ) : null}

      {/* Show empty state when there are no permissions and form is not open */}
      {permissions.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Key className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No permissions</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new permission.
          </p>
          <div className="mt-6">
            <button
              onClick={() => {
                setFormData({ name: '', description: '', groupId: null });
                setEditingPermission(null);
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Permission
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;