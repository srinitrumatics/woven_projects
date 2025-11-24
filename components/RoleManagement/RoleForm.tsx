'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Role, Permission, PermissionGroup } from '../../db/schema';
import { roleApi, permissionApi, permissionGroupApi } from '@/lib/api/rbac-api';
import { Save, X, Shield, Key, ChevronDown, ChevronUp, Search, CheckCircle2 } from 'lucide-react';

interface GroupedPermission {
  id: string | null;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
}

interface RoleFormProps {
  editingRole: Role | null;
  formData: {
    name: string;
    description: string;
  };
  formPermissionAssignments: string[];
  groupedPermissions: GroupedPermission[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setFormPermissionAssignments: (ids: string[] | ((prevState: string[]) => string[])) => void;
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(groupedPermissions.map(g => g.id || 'ungrouped'))
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toggleGroup = (groupId: string | null) => {
    const id = groupId || 'ungrouped';
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingRole) {
        await roleApi.updateRole(editingRole.id, {
          name: formData.name,
          description: formData.description,
        });
        await roleApi.assignPermissionsToRole(editingRole.id, formPermissionAssignments);
      } else {
        const savedRole = await roleApi.createRole({
          name: formData.name,
          description: formData.description,
        });
        if (formPermissionAssignments.length > 0) {
          await roleApi.assignPermissionsToRole(savedRole.id, formPermissionAssignments);
        }
      }

      setFormData({ name: '', description: '' });
      setFormPermissionAssignments([]);
      setEditingRole(null);
      setShowForm(false);
      await loadRolesPermissionsAndOrganizations();
    } catch (err) {
      console.error('Failed to save role:', err);
      alert('Failed to save role');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setFormPermissionAssignments([]);
    setEditingRole(null);
    setShowForm(false);
  };

  const toggleAllInGroup = (group: GroupedPermission) => {
    const groupPermissionIds = group.permissions?.map(p => p.id) || [];
    const allSelected = groupPermissionIds.every(id => formPermissionAssignments.includes(id));

    if (allSelected) {
      setFormPermissionAssignments(prev => prev.filter(id => !groupPermissionIds.includes(id)));
    } else {
      setFormPermissionAssignments(prev => [...new Set([...prev, ...groupPermissionIds])]);
    }
  };

  const filteredGroups = groupedPermissions.map(group => ({
    ...group,
    permissions: group.permissions?.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => (group.permissions?.length || 0) > 0);

  const totalPermissions = groupedPermissions.reduce((sum, g) => sum + (g.permissions?.length || 0), 0);
  const selectedCount = formPermissionAssignments.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-xl mb-8 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#96C2DB] to-[#6B9DB8] px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h2>
              <p className="text-white/80 text-sm mt-0.5">
                {editingRole ? 'Update role details and permissions' : 'Define a new role with specific permissions'}
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

      <form onSubmit={handleSubmit}>
        <div className="p-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left Column - Role Details */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#96C2DB] focus:border-transparent transition-all"
                  placeholder="e.g., Administrator, Manager, Viewer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#96C2DB] focus:border-transparent transition-all resize-none"
                  placeholder="Describe the purpose and responsibilities of this role..."
                />
              </div>

              {/* Permission Summary */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-900">Permissions Selected</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">
                    {selectedCount}/{totalPermissions}
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(selectedCount / totalPermissions) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Permissions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Assign Permissions
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search permissions..."
                    className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#96C2DB] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto bg-white">
                {filteredGroups.map((group) => {
                  const groupId = group.id || 'ungrouped';
                  const isExpanded = expandedGroups.has(groupId);
                  const groupPermissions = group.permissions || [];
                  const selectedInGroup = groupPermissions.filter(p => formPermissionAssignments.includes(p.id)).length;
                  const allSelected = groupPermissions.length > 0 && selectedInGroup === groupPermissions.length;

                  return (
                    <div key={groupId} className="border-b border-gray-100 last:border-b-0">
                      {/* Group Header */}
                      <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => toggleGroup(group.id)}
                            className="flex items-center gap-2 flex-1 text-left group"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-[#96C2DB] transition-colors" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-[#96C2DB] transition-colors" />
                            )}
                            <span className="font-semibold text-gray-900 group-hover:text-[#96C2DB] transition-colors">
                              {group.name}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                              {selectedInGroup}/{groupPermissions.length}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleAllInGroup(group)}
                            className="text-xs font-medium text-[#6B9DB8] hover:text-[#96C2DB] transition-colors"
                          >
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                      </div>

                      {/* Group Permissions */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="p-2 space-y-1">
                              {groupPermissions.map(permission => {
                                const isSelected = formPermissionAssignments.includes(permission.id);

                                return (
                                  <motion.label
                                    key={permission.id}
                                    whileHover={{ x: 4 }}
                                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${isSelected
                                        ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200'
                                        : 'hover:bg-gray-50 border-2 border-transparent'
                                      }`}
                                  >
                                    <div className="relative flex items-center h-5">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setFormPermissionAssignments((prev: string[]) => [...prev, permission.id]);
                                          } else {
                                            setFormPermissionAssignments((prev: string[]) => prev.filter(id => id !== permission.id));
                                          }
                                        }}
                                        className="w-5 h-5 text-[#96C2DB] rounded border-gray-300 focus:ring-[#96C2DB] cursor-pointer"
                                      />
                                      {isSelected && (
                                        <CheckCircle2 className="absolute -right-1 -top-1 w-3 h-3 text-purple-600 pointer-events-none" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-gray-900">
                                        {permission.name}
                                      </div>
                                      {permission.description && (
                                        <div className="text-xs text-gray-500 mt-0.5">
                                          {permission.description}
                                        </div>
                                      )}
                                    </div>
                                  </motion.label>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {filteredGroups.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Key className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">
                      {searchTerm ? 'No permissions match your search' : 'No permissions available'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
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
              className="px-8 py-3 bg-gradient-to-r from-[#96C2DB] to-[#6B9DB8] text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {editingRole ? 'Update Role' : 'Create Role'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default RoleForm;