'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Role, Permission } from '../../db/schema';
import { roleApi } from '@/lib/api/rbac-api';
import { Edit, Trash2, Shield, Key, Users, ChevronRight } from 'lucide-react';

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

interface RoleListProps {
  roles: Role[];
  loading: boolean;
  error: string | null;
  allRolePermissions: {[key: string]: RolePermission[]};
  groupedPermissions: GroupedPermission[];
  handleEdit: (role: Role) => void;
  handleDelete: (id: string) => void;
}

const RoleList: React.FC<RoleListProps> = ({
  roles,
  loading,
  error,
  allRolePermissions,
  groupedPermissions,
  handleEdit,
  handleDelete
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              <div className="h-6 bg-gray-200 rounded-full w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Roles</div>
        <div className="text-red-500">{error}</div>
      </div>
    );
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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {roles.map((role) => {
        const permissions = allRolePermissions[role.id] || [];
        const permissionCount = permissions.length;
        
        return (
          <motion.div
            key={role.id}
            variants={item}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 hover:border-[#96C2DB] hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#96C2DB]/5 to-[#6B9DB8]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative p-6">
              {/* Header with Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#96C2DB] to-[#6B9DB8] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#6B9DB8] transition-colors">
                      {role.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Key className="w-3 h-3" />
                      <span>{permissionCount} {permissionCount === 1 ? 'permission' : 'permissions'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                {role.description || 'No description provided'}
              </p>

              {/* Permissions Preview */}
              {permissions.length > 0 ? (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1.5">
                    {permissions.slice(0, 3).map((perm) => (
                      <span
                        key={perm.permissionId}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border border-purple-200"
                      >
                        {perm.permissionName}
                      </span>
                    ))}
                    {permissions.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                        +{permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-xs text-gray-500 text-center">No permissions assigned</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(role)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#96C2DB] to-[#6B9DB8] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(role.id)}
                  className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 hover:shadow-md hover:scale-105 transition-all duration-200 font-medium text-sm"
                  title="Delete Role"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Decorative corner element */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#96C2DB]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default RoleList;