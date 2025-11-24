'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Permission, PermissionGroup } from '../../../db/schema';
import { permissionApi, permissionGroupApi } from '@/lib/api/rbac-api';
import { Plus, Key, Sparkles } from 'lucide-react';
import PermissionList from '../../../components/PermissionManagement/PermissionList';
import PermissionForm from '../../../components/PermissionManagement/PermissionForm';

interface GroupedPermission {
  id: string | null;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
}

const PermissionManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    groupId: null as string | null,
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

  const loadPermissionsAndGroups = loadPermissions;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'groupId' ? (value === '' ? null : value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let savedPermission: Permission | null;
      if (editingPermission) {
        savedPermission = await permissionApi.updatePermission(editingPermission.id, {
          name: formData.name,
          description: formData.description,
          groupId: formData.groupId,
        });
      } else {
        savedPermission = await permissionApi.createPermission({
          name: formData.name,
          description: formData.description,
          groupId: formData.groupId,
        });
      }

      if (savedPermission) {
        setFormData({ name: '', description: '', groupId: null });
        setEditingPermission(null);
        setShowForm(false);
        await loadPermissions();
      } else {
        setError('Failed to save permission - permission not found');
      }
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

  const handleDelete = async (id: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-16 bg-gray-200 rounded-2xl mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
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
            <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Permissions</div>
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20 p-8">
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
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Key className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Permission Management
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Define and manage system permissions
                  </p>
                </div>
              </div>
              {!showForm && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setFormData({ name: '', description: '', groupId: null });
                    setEditingPermission(null);
                    setShowForm(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add New Permission
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Form */}
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

        {/* Permission List */}
        {!showForm && permissions.length > 0 && (
          <PermissionList
            permissions={permissions}
            permissionGroups={permissionGroups}
            loading={loading}
            error={error}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        )}

        {/* Empty State */}
        {permissions.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center">
                  <Key className="w-12 h-12 text-purple-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Permissions Yet</h3>
              <p className="text-gray-500 mb-8">
                Get started by creating your first permission to control access to specific features and actions.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFormData({ name: '', description: '', groupId: null });
                  setEditingPermission(null);
                  setShowForm(true);
                }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 font-semibold text-lg"
              >
                <Plus className="w-6 h-6" />
                Create Your First Permission
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PermissionManagement;