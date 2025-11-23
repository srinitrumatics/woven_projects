'use client';

import React from 'react';
import { User, Role, Organization } from '../../db/schema';
import { userApi, roleApi, organizationApi } from '@/lib/api/rbac-api';
import { Edit, Trash2, Users } from 'lucide-react';

interface UserOrganization {
  organizationId: string;
  organizationName: string;
  organizationDescription: string | null;
}

interface UserRole {
  roleId: string;
  roleName: string;
  roleDescription: string | null;
}

interface UserListProps {
  users: Omit<User, 'password'>[];
  roles: Role[];
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  allUserOrganizations: {[key: string]: UserOrganization[]};
  allUserRoles: {[key: string]: UserRole[]};
  handleEdit: (user: Omit<User, 'password'>) => void;
  handleDelete: (id: string) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  roles,
  organizations,
  loading,
  error,
  allUserOrganizations,
  allUserRoles,
  handleEdit,
  handleDelete
}) => {
  if (loading) return <div className="p-8 text-center">Loading users...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map(user => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Users className="flex-shrink-0 h-10 w-10 text-gray-400" />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.email}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {allUserOrganizations[user.id]?.length > 0 ? (
                    <div className="space-y-2">
                      {allUserOrganizations[user.id].map(userOrg => {
                        // Get roles specific to this user-organization combination
                        const userOrgKey = `${user.id}-${userOrg.organizationId}`;
                        const orgRoles = allUserRoles[userOrgKey] || [];

                        return (
                          <div key={userOrg.organizationId} className="mb-1">
                            <div className="font-medium text-xs text-gray-600 mb-1">{userOrg.organizationName}</div>
                            {orgRoles.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {orgRoles.map(userRole => (
                                  <span
                                    key={`${userRole.roleId}-${userOrg.organizationId}`}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {userRole.roleName}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 italic">No roles</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No organizations assigned</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleEdit(user)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
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

export default UserList;