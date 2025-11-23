'use client';

import React from 'react';
import { User, Role, Organization } from '../../db/schema';
import { userApi, roleApi, organizationApi } from '@/lib/api/rbac-api';
import { Building2 } from 'lucide-react';

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

interface UserFormProps {
  editingUser: Omit<User, 'password'> | null;
  formData: {
    name: string;
    email: string;
    password: string;
  };
  organizationAssignments: string[];
  selectedUserRoles: {[key: string]: string[]};
  roles: Role[];
  organizations: Organization[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleOrganizationChange: (organizationId: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setShowForm: (show: boolean) => void;
  setFormData: (data: { name: string; email: string; password: string }) => void;
  setOrganizationAssignments: (orgIds: string[]) => void;
  setSelectedUserRoles: (roles: {[key: string]: string[]} | ((prevState: {[key: string]: string[]}) => {[key: string]: string[]} )) => void;
  setEditingUser: (user: Omit<User, 'password'> | null) => void;
}

const UserForm: React.FC<UserFormProps> = ({
  editingUser,
  formData,
  organizationAssignments,
  selectedUserRoles,
  roles,
  organizations,
  handleInputChange,
  handleOrganizationChange,
  handleSubmit,
  setShowForm,
  setFormData,
  setOrganizationAssignments,
  setSelectedUserRoles,
  setEditingUser
}) => {
  // Handle cancel
  const handleCancel = () => {
    setFormData({ name: '', email: '', password: '' });
    setOrganizationAssignments([]);
    setSelectedUserRoles({});
    setEditingUser(null);
    setShowForm(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg border mb-6">
      <h2 className="text-lg font-semibold mb-4">
        {editingUser ? 'Edit User' : 'Create New User'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {!editingUser && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={!editingUser}
            />
          </div>
        )}

        {/* Organization Assignments */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Assign Organizations</label>
          <div className="flex flex-wrap gap-2">
            {organizations.map(organization => (
              <label key={organization.id} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={organizationAssignments.includes(organization.id)}
                  onChange={() => handleOrganizationChange(organization.id)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-1 text-sm text-gray-700">{organization.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Organization-Role Assignment Cards */}
        {organizationAssignments.length > 0 && (
          <div className="mb-4 border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-4">Assign Roles by Organization</label>
            <div className="space-y-4">
              {organizationAssignments.map(orgId => {
                const organization = organizations.find(o => o.id === orgId);
                if (!organization) return null;
                
                const userOrgKey = editingUser ? `${editingUser.id}-${orgId}` : `new-${orgId}`;
                const orgRoles = editingUser ? (selectedUserRoles[userOrgKey] || []) : (selectedUserRoles[userOrgKey] || []);
                
                return (
                  <div key={orgId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center mb-2">
                      <Building2 className="w-5 h-5 text-gray-600 mr-2" />
                      <div className="font-medium text-gray-800">{organization.name}</div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-xs font-medium text-gray-500 mb-2">Assigned Roles:</div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {orgRoles.length > 0 ? (
                          roles
                            .filter(role => orgRoles.includes(role.id))
                            .map(role => (
                              <span
                                key={`${role.id}-${orgId}`}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {role.name}
                              </span>
                            ))
                        ) : (
                          <span className="text-xs text-gray-500 italic">No roles assigned</span>
                        )}
                      </div>
                      
                      {/* Role assignment for this organization */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">Select Roles:</label>
                        <div className="flex flex-wrap gap-2">
                          {roles.map(role => (
                            <label key={`${role.id}-${orgId}`} className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedUserRoles[userOrgKey]?.includes(role.id) || false}
                                onChange={() => {
                                  // Update the selectedUserRoles state locally
                                  const currentRoles = selectedUserRoles[userOrgKey] || [];
                                  const newRoles = currentRoles.includes(role.id)
                                    ? currentRoles.filter(id => id !== role.id)
                                    : [...currentRoles, role.id];
                                  
                                  setSelectedUserRoles((prev: {[key: string]: string[]}) => ({
                                    ...prev,
                                    [userOrgKey]: newRoles
                                  }));
                                }}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <span className="ml-1 text-xs text-gray-700">{role.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {editingUser ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;