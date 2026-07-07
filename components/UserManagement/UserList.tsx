'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Role, Organization } from '../../db/schema';
import { userApi, roleApi, organizationApi } from '@/lib/api/rbac-api';
import { Edit, Trash2, Users, Mail, Building2, Shield, Search, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";

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
  isCustomer?: boolean;
  onAddNew?: () => void;
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
  handleDelete,
  isCustomer,
  onAddNew
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');

  // Initialize resizable columns
  const { widths, handleResize } = useResizableColumns({
    name: 200,
    title: 150,
    department: 150,
    email: 220,
    mobile: 150,
    phone: 150,
  });

  // Filter users based on search term and format data for sorting
  const filteredUsers = useMemo(() => {
    const formatUSPhone = (phoneStr: any) => {
      if (!phoneStr || String(phoneStr).toLowerCase() === 'null') return '';
      const cleaned = ('' + phoneStr).replace(/\D/g, '');
      const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        const intlCode = match[1] ? '+1 ' : '';
        return `${intlCode}(${match[2]}) ${match[3]}-${match[4]}`;
      }
      return phoneStr;
    };

    let filtered = users;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = users.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        allUserOrganizations[user.id]?.some(org =>
          org.organizationName.toLowerCase().includes(term)
        )
      );
    }

    return filtered.map(user => {
      const title = (user as any).title && String((user as any).title).toLowerCase() !== 'null' ? (user as any).title : '';
      const department = (user as any).department && String((user as any).department).toLowerCase() !== 'null' ? (user as any).department : '';
      const mobile = formatUSPhone((user as any).mobile);
      const phone = formatUSPhone((user as any).phone);

      return {
        ...user,
        title,
        department,
        mobile,
        phone
      };
    });
  }, [users, searchTerm, allUserOrganizations]);

  // Sorting
  const { items: sortedUsers, requestSort, sortConfig } = useSortableData<any>(filteredUsers, { key: 'name', direction: 'asc' });

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
        <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <p className="text-sm truncate" title="Loading users...">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Users</div>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      {/* Header with Search and Filter */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[220px] max-w-xs flex-shrink-0">
            <input
              type="text"
              placeholder={isCustomer ? "Search users..." : "Search by name, email, or organization..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
          </div>

          <div className="flex items-center gap-2 ml-auto min-w-0">
            {onAddNew && (
              <button
                onClick={onAddNew}
                className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2 px-3"
                title="Add New User"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium truncate">Add</span>
              </button>
            )}
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === "list"
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              title="List View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg transition-colors ${viewMode === "card"
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              title="Card View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        {viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
            {paginatedUsers.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center justify-center min-w-0">
                  <Users className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2 truncate">
                    {searchTerm ? 'Try adjusting your search terms' : 'No contacts available'}
                  </p>
                </div>
              </div>
            ) : (
              paginatedUsers.map((user) => {
                const { title, department, mobile, phone } = user as any;

                return (
                  <div key={user.id} className="flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group">
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col min-w-0 flex-grow">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                              <span className="font-bold text-lg">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate" title={user.name}>
                              {user.name}
                            </h3>
                          </div>
                          <div className="pl-[52px] pr-2 min-w-0 mt-1">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate min-h-[20px]">
                              {title || '\u00A0'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5 min-h-[20px]">
                              {department || '\u00A0'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mt-4 flex-grow">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 truncate h-5">
                          {user.email && (
                            <>
                              <Mail className="w-4 h-4 flex-shrink-0 text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5 min-h-[20px]">
                                {user.email}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 truncate h-5">
                          {mobile && (
                            <>
                              <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5 min-h-[20px]">{mobile}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 truncate h-5">
                          {phone && (
                            <>
                              <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5 min-h-[20px]">
                                {phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-primary-light dark:bg-gray-900">
              <tr>
                <SortableHeader label="Contact Name" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} />
                <SortableHeader label="Title" field="title" sortConfig={sortConfig} requestSort={requestSort} width={widths.title} onResize={handleResize} />
                <SortableHeader label="Department" field="department" sortConfig={sortConfig} requestSort={requestSort} width={widths.department} onResize={handleResize} />
                <SortableHeader label="Email" field="email" sortConfig={sortConfig} requestSort={requestSort} width={widths.email} onResize={handleResize} />
                <SortableHeader label="Mobile" field="mobile" sortConfig={sortConfig} requestSort={requestSort} width={widths.mobile} onResize={handleResize} />
                <SortableHeader label="Phone" field="phone" sortConfig={sortConfig} requestSort={requestSort} width={widths.phone} onResize={handleResize} />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center truncate">
                    <div className="flex flex-col items-center justify-center min-w-0">
                      <Users className="w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg mb-2 truncate">
                        {searchTerm ? 'Try adjusting your search terms' : 'No contacts available'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const { title, department, mobile, phone } = user as any;

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex gap-3 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {user.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {title}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {department}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5 min-h-[20px]">
                          {user.email && user.email}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5 min-h-[20px]">
                          {mobile ? mobile : ''}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5 min-h-[20px]">
                          {phone ? phone : ''}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between min-w-0">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 min-w-0">
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
                        ? 'bg-primary text-white'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;