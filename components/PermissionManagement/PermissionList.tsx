'use client';

import React from 'react';
import { Permission, PermissionGroup } from '../../db/schema';
import { permissionApi, permissionGroupApi } from '@/lib/api/rbac-api';
import { Edit, Trash2, Key } from 'lucide-react';

interface GroupedPermission {
  id: number | null;
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
  handleDelete: (id: number) => void;
}

const PermissionList: React.FC<PermissionListProps> = ({
  permissions,
  permissionGroups,
  loading,
  error,
  handleEdit,
  handleDelete
}) => {
  if (loading) return <div className="p-8 text-center">Loading permissions...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {permissions.map(permission => {
            const permissionGroup = permissionGroups.find(pg => pg.id === permission.groupId);
            
            return (
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
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {permissionGroup ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {permissionGroup.name}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 italic">No group</span>
                    )}
                  </div>
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PermissionList;