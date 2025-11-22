'use client';

import React, { useState, useEffect } from 'react';
import { Permission, PermissionGroup } from '../../../db/schema';
import { permissionApi, permissionGroupApi } from '../../../lib/api/rbac-api';
import { Plus, Edit, Trash2, Save, X, Key, ChevronDown, ChevronRight } from 'lucide-react';

interface GroupedPermission {
  id: number | null;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
}

const PermissionManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<GroupedPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    groupId: null as number | null,
  });

  // Group form state
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const groups = await permissionGroupApi.getPermissionGroups();
      setPermissionGroups(groups);
    } catch (err) {
      setError('Failed to load permissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

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
    setShowGroupForm(false); // Close group form when starting to edit a permission
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

  const handleGroupInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewGroupData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newGroup = await permissionGroupApi.createPermissionGroup({
        name: newGroupData.name,
        description: newGroupData.description,
      });

      // Refresh permission groups
      await loadPermissions();

      // Set the newly created group in the permission form
      setFormData(prev => ({
        ...prev,
        groupId: newGroup.id
      }));

      // Close the group form
      setShowGroupForm(false);
      setNewGroupData({ name: '', description: '' });
    } catch (err) {
      setError('Failed to create permission group');
      console.error(err);
    }
  };

  const handleCancelGroup = () => {
    setShowGroupForm(false);
    setNewGroupData({ name: '', description: '' });
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', groupId: null });
    setEditingPermission(null);
    setShowForm(false);
    setShowGroupForm(false); // Also close group form when canceling permission form
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
            setNewGroupData({ name: '', description: '' }); // Reset group form data
            setEditingPermission(null);
            setShowForm(true);
            setShowGroupForm(false); // Close group form when creating new permission
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Permission
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingPermission ? 'Edit Permission' : 'Create New Permission'}
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
              <p className="mt-1 text-xs text-gray-500">
                Use lowercase with underscores (e.g., create_user, delete_item)
              </p>
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
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Permission Group</label>
                <button
                  type="button"
                  onClick={() => setShowGroupForm(true)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  + New Group
                </button>
              </div>
              <select
                name="groupId"
                value={formData.groupId || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Group</option>
                {permissionGroups
                  .filter(group => group.id !== null) // Exclude the "Ungrouped" pseudo-group
                  .map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Group Creation Form - shown when user clicks "New Group" */}
            {showGroupForm && (
              <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Create New Permission Group</h3>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newGroupData.name}
                    onChange={handleGroupInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Order Management"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={newGroupData.description}
                    onChange={handleGroupInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Description of this permission group"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelGroup}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateGroup}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Create Group
                  </button>
                </div>
              </div>
            )}

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
                {editingPermission ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Only show permission list if not in form mode (hide when creating or editing) */}
      {!showForm ? (
        <div className="bg-white rounded-lg border overflow-hidden">
          {permissionGroups.map((group) => (
            <div key={group.id !== null ? `group-${group.id}` : 'ungrouped'} className="border-b border-gray-200 last:border-b-0">
              <div
                className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
                onClick={() => toggleGroup(group.name)}
              >
                <h3 className="text-lg font-medium text-gray-800">{group.name} ({group.permissions.length})</h3>
                <button className="text-gray-500 hover:text-gray-700">
                  {expandedGroups.has(group.name) ?
                    <ChevronDown className="h-5 w-5" /> :
                    <ChevronRight className="h-5 w-5" />
                  }
                </button>
              </div>

              {expandedGroups.has(group.name) && (
                <div className="divide-y divide-gray-200">
                  {group.permissions.map(permission => (
                    <div key={permission.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center">
                        <Key className="flex-shrink-0 h-6 w-6 text-gray-400" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                          <div className="text-sm text-gray-500">{permission.description || '-'}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(permission)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(permission.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {/* Show empty state when there are no permissions and form is not open */}
      {permissionGroups.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Key className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No permissions</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new permission.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowForm(true)}
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