'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Permission, PermissionGroup } from '../../db/schema';
import { permissionApi, permissionGroupApi } from '@/lib/api/rbac-api';
import { Save, X, Key, Folder, Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface PermissionFormData {
  name: string;
  description: string;
  groupId: string | null;
}

interface PermissionFormProps {
  editingPermission: Permission | null;
  formData: PermissionFormData;
  permissionGroups: PermissionGroup[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setFormData: (data: PermissionFormData | ((prevState: PermissionFormData) => PermissionFormData)) => void;
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
  const [isSaving, setIsSaving] = useState(false);
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

      await loadPermissionsAndGroups();

      setFormData((prev: PermissionFormData) => ({
        ...prev,
        groupId: newGroup.id
      }));

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await handleSubmit(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-xl mb-8 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {editingPermission ? 'Edit Permission' : 'Create New Permission'}
              </h2>
              <p className="text-white/80 text-sm mt-0.5">
                {editingPermission ? 'Update permission details' : 'Define a new permission for your system'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="p-8">
          {/* Form Fields */}
          <div className="space-y-6">
            {/* Permission Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Permission Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="e.g., USER_CREATE, ORDER_DELETE, REPORT_VIEW"
                required
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Use UPPERCASE with underscores (e.g., MODULE_ACTION)
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                placeholder="Describe what this permission allows users to do..."
              />
            </div>

            {/* Permission Group */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Permission Group
                </label>
                <button
                  type="button"
                  onClick={() => setShowGroupForm(!showGroupForm)}
                  className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  {showGroupForm ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      Hide Group Form
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      New Group
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  name="groupId"
                  value={formData.groupId || ''}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none bg-white"
                >
                  <option value="">Select a group (optional)...</option>
                  {permissionGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Group related permissions together for better organization
              </p>

              {/* New Group Creation Form */}
              <AnimatePresence>
                {showGroupForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-5 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white">
                      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Folder className="w-5 h-5 text-purple-600" />
                        Create New Permission Group
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Group Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={newGroupData.name}
                            onChange={handleGroupInputChange}
                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="e.g., User Management, Order Management"
                            required={showGroupForm}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={newGroupData.description}
                            onChange={handleGroupInputChange}
                            rows={2}
                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            placeholder="Describe this permission group..."
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleCancelGroup}
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleCreateGroup}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                          >
                            Create Group
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-8 border-t border-gray-200 mt-8">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {editingPermission ? 'Update Permission' : 'Create Permission'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default PermissionForm;