'use client';

import React, { useState, useEffect } from 'react';
import { User, Role, Organization } from '../../../db/schema';
import { userApi, roleApi, organizationApi } from '../../../lib/api/rbac-api';
import { Plus, Edit, Trash2, Save, X, Users, Shield, Key, Building2 } from 'lucide-react';

interface UserRole {
  roleId: number;
  roleName: string;
  roleDescription: string | null;
}

interface UserOrganization {
  organizationId: number;
  organizationName: string;
  organizationDescription: string | null;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Omit<User, 'password'> | null>(null);
  const [selectedUserRoles, setSelectedUserRoles] = useState<{[key: string]: number[]}>({});
  const [selectedUserOrganizations, setSelectedUserOrganizations] = useState<{[key: number]: number[]}>({});
  const [allUserRoles, setAllUserRoles] = useState<{[key: string]: UserRole[]}>({});
  const [allUserOrganizations, setAllUserOrganizations] = useState<{[key: number]: UserOrganization[]}>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [roleAssignments, setRoleAssignments] = useState<number[]>([]);
  const [organizationAssignments, setOrganizationAssignments] = useState<number[]>([]);

  useEffect(() => {
    loadUsersRolesAndOrganizations();
  }, []);

  const loadUsersRolesAndOrganizations = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData, organizationsData] = await Promise.all([
        userApi.getUsers(),
        roleApi.getRoles(),
        organizationApi.getOrganizations(),
      ]);

      setUsers(usersData);
      setRoles(rolesData);
      setOrganizations(organizationsData);

      // Load roles for each user organization combination
      const userOrgRolesMap: {[key: string]: UserRole[]} = {};
      // Load organizations for each user
      const userOrganizationsMap: {[key: number]: UserOrganization[]} = {};

      for (const user of usersData) {
        try {
          // Load user organizations
          const userOrgs = await userApi.getUserOrganizations(user.id);
          userOrganizationsMap[user.id] = userOrgs.map(ug => {
            const org = organizationsData.find(o => o.id === ug.organizationId);
            return {
              organizationId: ug.organizationId,
              organizationName: org?.name || 'Unknown Organization',
              organizationDescription: org?.description || null
            };
          });

          // For each organization, load the roles for this user
          for (const userOrg of userOrgs) {
            const userOrgKey = `${user.id}-${userOrg.organizationId}`;
            const rolesForOrg = await userApi.getUserRoles(user.id, userOrg.organizationId);
            userOrgRolesMap[userOrgKey] = rolesForOrg.map(ur => {
              const role = rolesData.find(r => r.id === ur.roleId);
              return {
                roleId: ur.roleId,
                roleName: role?.name || 'Unknown Role',
                roleDescription: role?.description || null
              };
            });
          }
        } catch (err) {
          console.error(`Error loading roles/organizations for user ${user.id}:`, err);
          userOrgRolesMap[user.id.toString()] = []; // Use the string key for consistency
          userOrganizationsMap[user.id] = [];
        }
      }

      setAllUserRoles(userOrgRolesMap);
      setAllUserOrganizations(userOrganizationsMap);

      // Initialize selected user roles and organizations
      const selectedRolesMap: {[key: string]: number[]} = {};
      const selectedOrgsMap: {[key: number]: number[]} = {};

      for (const user of usersData) {
        // For each organization the user belongs to, set up role selections
        for (const userOrg of userOrganizationsMap[user.id] || []) {
          const userOrgKey = `${user.id}-${userOrg.organizationId}`;
          selectedRolesMap[userOrgKey] = userOrgRolesMap[userOrgKey]?.map(ur => ur.roleId) || [];
        }

        selectedOrgsMap[user.id] = userOrganizationsMap[user.id].map(ug => ug.organizationId);
      }

      // Don't override the selectedUserRoles state here since it's used for form operations
      // Only update it when loading for the table view
      setSelectedUserRoles(selectedRolesMap);
      setSelectedUserOrganizations(selectedOrgsMap);

    } catch (err) {
      setError('Failed to load users, roles, and organizations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (roleId: number, userId?: number, organizationId?: number) => {
    if (userId !== undefined && organizationId !== undefined) {
      // For role assignment to user in a specific organization
      setSelectedUserRoles(prev => {
        // Find the current roles for this specific user-organization combination
        const userOrgKey = `${userId}-${organizationId}`;
        const currentRoles = prev[userOrgKey] || [];
        const newRoles = currentRoles.includes(roleId)
          ? currentRoles.filter(id => id !== roleId)
          : [...currentRoles, roleId];

        // Update the backend
        userApi.assignRolesToUser(userId, newRoles, organizationId)
          .then(success => {
            if (success) {
              // Update all user roles cache
              setAllUserRoles(prevRoles => ({
                ...prevRoles,
                [userOrgKey]: roles.filter(r => newRoles.includes(r.id)).map(r => ({
                  roleId: r.id,
                  roleName: r.name,
                  roleDescription: r.description
                }))
              }));
            }
          })
          .catch(err => console.error('Error updating user roles:', err));

        return {
          ...prev,
          [userOrgKey]: newRoles
        };
      });
    } else {
      // For form role selection
      setRoleAssignments(prev =>
        prev.includes(roleId)
          ? prev.filter(id => id !== roleId)
          : [...prev, roleId]
      );
    }
  };

  const handleOrganizationChange = (organizationId: number, userId?: number) => {
    if (userId !== undefined) {
      // For organization assignment to user
      setSelectedUserOrganizations(prev => {
        const currentOrganizations = prev[userId] || [];
        const newOrganizations = currentOrganizations.includes(organizationId)
          ? currentOrganizations.filter(id => id !== organizationId)
          : [...currentOrganizations, organizationId];

        // Update the backend
        userApi.assignOrganizationsToUser(userId, newOrganizations)
          .then(success => {
            if (success) {
              // Update all user organizations cache
              setAllUserOrganizations(prevOrgs => ({
                ...prevOrgs,
                [userId]: organizations.filter(o => newOrganizations.includes(o.id)).map(o => ({
                  organizationId: o.id,
                  organizationName: o.name,
                  organizationDescription: o.description
                }))
              }));
            }
          })
          .catch(err => console.error('Error updating user organizations:', err));

        return {
          ...prev,
          [userId]: newOrganizations
        };
      });
    } else {
      // For form organization selection
      setOrganizationAssignments(prev =>
        prev.includes(organizationId)
          ? prev.filter(id => id !== organizationId)
          : [...prev, organizationId]
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // Update existing user
        await userApi.updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          ...(formData.password && { password: formData.password })
        });

        // Update user organizations
        await userApi.assignOrganizationsToUser(editingUser.id, organizationAssignments);

        // Update roles for each organization
        for (const orgId of organizationAssignments) {
          const userOrgKey = `${editingUser.id}-${orgId}`;
          const rolesForOrg = selectedUserRoles[userOrgKey] || [];
          await userApi.assignRolesToUser(editingUser.id, rolesForOrg, orgId);
        }
      } else {
        // Create new user
        const newUser = await userApi.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });

        // Assign organizations to new user
        await userApi.assignOrganizationsToUser(newUser.id, organizationAssignments);

        // Assign roles to new user for each organization
        for (const orgId of organizationAssignments) {
          const userOrgKey = `new-${orgId}`;
          const rolesForOrg = selectedUserRoles[userOrgKey] || [];
          await userApi.assignRolesToUser(newUser.id, rolesForOrg, orgId);
        }
      }

      // Reset form and reload data
      setFormData({ name: '', email: '', password: '' });
      setRoleAssignments([]);
      setOrganizationAssignments([]);
      // Reset the selected user roles
      setSelectedUserRoles({});
      setEditingUser(null);
      setShowForm(false);
      await loadUsersRolesAndOrganizations();
    } catch (err) {
      setError('Failed to save user');
      console.error(err);
    }
  };

  const handleEdit = (user: Omit<User, 'password'>) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '' // Don't prefill password
    });

    // Pre-populate organization assignments for editing
    const userOrganizations = allUserOrganizations[user.id]?.map(ug => ug.organizationId) || [];

    // For role assignments in edit mode, we'll load all role-organization assignments
    setOrganizationAssignments(userOrganizations);

    // Reset selected user roles and populate with existing role assignments per organization
    const newSelectedRoles: {[key: string]: number[]} = {};
    for (const org of allUserOrganizations[user.id] || []) {
      const userOrgKey = `${user.id}-${org.organizationId}`;
      newSelectedRoles[userOrgKey] = allUserRoles[userOrgKey]?.map(r => r.roleId) || [];
    }
    setSelectedUserRoles(newSelectedRoles);

    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userApi.deleteUser(id);
        await loadUsersRolesAndOrganizations();
      } catch (err) {
        setError('Failed to delete user');
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', password: '' });
    setRoleAssignments([]);
    setOrganizationAssignments([]);
    setSelectedUserRoles({});
    setEditingUser(null);
    setShowForm(false);
  };

  if (loading) return <div className="p-8 text-center">Loading users...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button
          onClick={() => {
            setFormData({ name: '', email: '', password: '' });
            setEditingUser(null);
            setRoleAssignments([]);
            setOrganizationAssignments([]);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      {showForm && (
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
                    const orgRoles = editingUser ? (allUserRoles[userOrgKey] || []) : [];

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
                              orgRoles.map(userRole => (
                                <span
                                  key={`${userRole.roleId}-${orgId}`}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {userRole.roleName}
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
                                    onChange={() => handleRoleChange(role.id, editingUser?.id, orgId)}
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
      )}

      {/* Only show user list if not in form mode (hide when creating or editing) */}
      {!showForm ? (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizations</th>
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
                        <div className="flex flex-wrap gap-1">
                          {allUserOrganizations[user.id].map(userOrg => {
                            // Get roles specific to this user-organization combination
                            const userOrgKey = `${user.id}-${userOrg.organizationId}`;
                            const orgRoles = allUserRoles[userOrgKey] || [];

                            return (
                              <div key={userOrg.organizationId} className="inline-block mr-2">
                                <div className="font-medium text-xs text-gray-800">{userOrg.organizationName}:</div>
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
                                  <span className="text-xs text-gray-500">No roles</span>
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
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {allUserOrganizations[user.id]?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {allUserOrganizations[user.id].map(userOrg => (
                            <span
                              key={userOrg.organizationId}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            >
                              {userOrg.organizationName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No organizations assigned</span>
                      )}
                    </div>

                    {/* Organization assignment dropdown */}
                    <div className="mt-2">
                      <label className="block text-xs text-gray-500 mb-1">Assign Organizations:</label>
                      <div className="flex flex-wrap gap-2">
                        {organizations.map(org => (
                          <label key={org.id} className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedUserOrganizations[user.id]?.includes(org.id) || false}
                              onChange={() => handleOrganizationChange(org.id, user.id)}
                              className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                            />
                            <span className="ml-1 text-sm text-gray-700">{org.name}</span>
                          </label>
                        ))}
                      </div>
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
      ) : null}

      {/* Show empty state when there are no users and form is not open */}
      {users.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new user.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New User
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;