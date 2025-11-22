'use client';

import React, { useState, useEffect } from 'react';
import { Permission } from '../../../db/schema';
import { permissionApi } from '../../../lib/api/rbac-api';
import { Plus, Edit, Trash2, Save, X, Key } from 'lucide-react';

const PermissionManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const permissionsData = await permissionApi.getPermissions();
      setPermissions(permissionsData);
    } catch (err) {
      setError('Failed to load permissions');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let savedPermission: Permission;
      if (editingPermission) {
        // Update existing permission
        savedPermission = await permissionApi.updatePermission(editingPermission.id, {
          name: formData.name,
          description: formData.description,
        });
      } else {
        // Create new permission
        savedPermission = await permissionApi.createPermission({
          name: formData.name,
          description: formData.description,
        });
      }
      
      // Reset form and reload data
      setFormData({ name: '', description: '' });
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
    setFormData({ name: '', description: '' });
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
            setFormData({ name: '', description: '' });
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {permissions.map(permission => (
                <tr key={permission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Key className="flex-shrink-0 h-10 w-10 text-gray-400" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{permission.description || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(permission)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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