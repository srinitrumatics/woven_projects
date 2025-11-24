'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Permission, PermissionGroup } from '../../db/schema';
import { permissionApi, permissionGroupApi } from '@/lib/api/rbac-api';
import { Edit, Trash2, Key, Tag, Folder, ChevronDown, ChevronUp } from 'lucide-react';

interface GroupedPermission {
  id: string | null;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
}

interface PermissionListProps {
  permissions: Permission[];
  permissionGroups: PermissionGroup[];
  loading: boolean;
  error: string | null;
  handleEdit: (permission: Permission) => void;
  handleDelete: (id: string) => void;
}

const PermissionList: React.FC<PermissionListProps> = ({
  permissions,
  permissionGroups,
  loading,
  error,
  handleEdit,
  handleDelete
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['all']));

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Permissions</div>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Group permissions by their groups
  const groupedPermissions: { group: PermissionGroup | null; permissions: Permission[] }[] = [];

  // Add permissions with groups
  permissionGroups.forEach(group => {
    const groupPerms = permissions.filter(p => p.groupId === group.id);
    if (groupPerms.length > 0) {
      groupedPermissions.push({ group, permissions: groupPerms });
    }
  });

  // Add ungrouped permissions
  const ungroupedPerms = permissions.filter(p => p.groupId === null);
  if (ungroupedPerms.length > 0) {
    groupedPermissions.push({ group: null, permissions: ungroupedPerms });
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {groupedPermissions.map((groupData) => {
        const groupId = groupData.group?.id || 'ungrouped';
        const isExpanded = expandedGroups.has(groupId);
        const permissionCount = groupData.permissions.length;

        return (
          <motion.div
            key={groupId}
            variants={item}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* Group Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    {groupData.group ? (
                      <Folder className="w-5 h-5 text-white" />
                    ) : (
                      <Tag className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">
                      {groupData.group?.name || 'Ungrouped Permissions'}
                    </h3>
                    {groupData.group?.description && (
                      <p className="text-white/80 text-sm mt-0.5">
                        {groupData.group.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg">
                      <span className="text-white font-semibold text-sm">
                        {permissionCount} {permissionCount === 1 ? 'permission' : 'permissions'}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleGroup(groupId)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-white" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions List */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 space-y-3">
                    {groupData.permissions.map((permission, index) => (
                      <motion.div
                        key={permission.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Key className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                                {permission.name}
                              </h4>
                              {permission.description && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {permission.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleEdit(permission)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Edit Permission"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(permission.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Permission"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default PermissionList;