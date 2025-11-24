'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Role, Organization } from '../../db/schema';
import { userApi, roleApi, organizationApi } from '@/lib/api/rbac-api';
import { Edit, Trash2, Users, Mail, Building2, Shield, Search, ChevronLeft, ChevronRight } from 'lucide-react';

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
  allUserOrganizations: { [key: string]: UserOrganization[] };
  allUserRoles: { [key: string]: UserRole[] };
  handleEdit: (user: Omit<User, 'password'>) => void;
  handleDelete: (id: string) => void;
}

const ITEMS_PER_PAGE = 20;

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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;

    const term = searchTerm.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      allUserOrganizations[user.id]?.some(org =>
        org.organizationName.toLowerCase().includes(term)
      )
    );
  }, [users, searchTerm, allUserOrganizations]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Users</div>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Search Bar */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="text-sm text-gray-600 font-medium">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Organizations
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedUsers.map((user, index) => {
              const userOrganizations = allUserOrganizations[user.id] || [];
              const orgCount = userOrganizations.length;

              // Count total roles
              let totalRoles = 0;
              userOrganizations.forEach(org => {
                const userOrgKey = `${user.id}-${org.organizationId}`;
                totalRoles += (allUserRoles[userOrgKey] || []).length;
              });

              return (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-teal-50/50 transition-colors duration-150"
                >
                  {/* User Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {user.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Organizations */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {orgCount > 0 ? (
                        <>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-100 border border-blue-200">
                            <Building2 className="w-3.5 h-3.5 text-blue-700" />
                            <span className="text-xs font-medium text-blue-700">
                              {orgCount}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 truncate max-w-[200px]">
                            {userOrganizations[0].organizationName}
                            {orgCount > 1 && ` +${orgCount - 1}`}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No organizations</span>
                      )}
                    </div>
                  </td>

                  {/* Roles */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {totalRoles > 0 ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 border border-purple-200">
                          <Shield className="w-3.5 h-3.5 text-purple-700" />
                          <span className="text-xs font-medium text-purple-700">
                            {totalRoles} {totalRoles === 1 ? 'role' : 'roles'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No roles</span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No users found</h3>
          <p className="text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'No users available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserList;