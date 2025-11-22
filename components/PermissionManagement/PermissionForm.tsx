'use client';

import React, { useState } from 'react';
import { Permission, PermissionGroup } from '../../../db/schema';
import { permissionApi, permissionGroupApi } from '@/lib/api/rbac-api';
import { Plus, Edit, Trash2, Save, X, Key } from 'lucide-react';

interface PermissionFormProps {
  editingPermission: Permission | null;
  formData: {
    name: string;
    description: string;
    groupId: number | null;
  };
  permissionGroups: PermissionGroup[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setFormData: (data: { name: string; description: string; groupId: number | null }) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleCancel: () => void;
  loadPermissionsAndGroups: () => Promise<void>;
}

const PermissionForm: React.FC<PermissionFormProps> = ({
  editingPermission,
  formData,
  permissionGroups,
  handleInputChange,
  setFormData,
  handleSubmit,
  handleCancel,
  loadPermissionsAndGroups
}) => {
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: ''
  });

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
      await loadPermissionsAndGroups();

      // Set the newly created group in the permission form
      setFormData(prev => ({
        ...prev,
        groupId: newGroup.id
      }));

      // Close the group form
      setShowGroupForm(false);
      setNewGroupData({ name: '', description: '' });
    } catch (err) {
      console.error('Failed to create permission group:', err);
      alert('Failed to create permission group');
    }
  };

  const handleCancelGroup = () => {
    setShowGroupForm(false);
    setNewGroupData({ name: '', description: '' });
  };

  return (
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
              onClick={() => setShowGroupForm(!showGroupForm)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showGroupForm ? 'Cancel' : '+ New Group'}
            </button>
          </div>
          <select
            name="groupId"
            value={formData.groupId || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a group...</option>
            {permissionGroups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">Select the group this permission belongs to</p>

          {/* New Group Creation Form */}
          {showGroupForm && (
            <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
              <h3 className="text-md font-semibold mb-2 text-gray-800">Create New Permission Group</h3>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input
                  type="text"
                  name="name"
                  value={newGroupData.name}
                  onChange={handleGroupInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., User Management"
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
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCancelGroup}
                  className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateGroup}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Create Group
                </button>
              </div>
            </div>
          )}
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
  );
};

export default PermissionForm;