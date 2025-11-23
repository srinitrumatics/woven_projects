'use client';

import React from 'react';
import { Role, Permission } from '../../db/schema';
import { roleApi } from '@/lib/api/rbac-api';
import { Edit, Trash2, Shield, Building2 } from 'lucide-react';

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
  permissions?: Permission[]; // Make it optional since it might be populated later
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
  if (loading) return <div className="p-8 text-center">Loading roles...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {roles.map(role => (
            <tr key={role.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Shield className="flex-shrink-0 h-10 w-10 text-gray-400" />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{role.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{role.description || '-'}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {allRolePermissions[role.id]?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {allRolePermissions[role.id].map(rolePermission => (
                        <span
                          key={rolePermission.permissionId}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {rolePermission.permissionName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No permissions assigned</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleEdit(role)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(role.id)}
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
  );
};

export default RoleList;