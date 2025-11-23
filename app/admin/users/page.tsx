'use client';

import React, { useState, useEffect } from 'react';
import { User, Role, Organization } from '../../../db/schema';
import { userApi, roleApi, organizationApi } from '../../../lib/api/rbac-api';
import { Plus, Edit, Trash2, Users, Building2 } from 'lucide-react';
import UserList from '../../../components/UserManagement/UserList';
import UserForm from '../../../components/UserManagement/UserForm';

interface UserRole {
  roleId: string;
  roleName: string;
  roleDescription: string | null;
}

interface UserOrganization {
  organizationId: string;
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
  const [selectedUserRoles, setSelectedUserRoles] = useState<{[key: string]: string[]}>({});
  const [selectedUserOrganizations, setSelectedUserOrganizations] = useState<{[key: string]: string[]}>({});
  const [allUserRoles, setAllUserRoles] = useState<{[key: string]: UserRole[]}>({});
  const [allUserOrganizations, setAllUserOrganizations] = useState<{[key: string]: UserOrganization[]}>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [organizationAssignments, setOrganizationAssignments] = useState<string[]>([]);

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
      const userOrganizationsMap: {[key: string]: UserOrganization[]} = {};

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
          userOrgRolesMap[user.id] = []; // Use the string key for consistency
          userOrganizationsMap[user.id] = [];
        }
      }

      setAllUserRoles(userOrgRolesMap);
      setAllUserOrganizations(userOrganizationsMap);

      // Initialize selected user roles and organizations
      const selectedRolesMap: {[key: string]: string[]} = {};
      const selectedOrgsMap: {[key: string]: string[]} = {};

      for (const user of usersData) {
        // For each organization the user belongs to, set up role selections
        for (const userOrg of userOrganizationsMap[user.id] || []) {
          const userOrgKey = `${user.id}-${userOrg.organizationId}`;
          selectedRolesMap[userOrgKey] = userOrgRolesMap[userOrgKey]?.map(ur => ur.roleId) || [];
        }

        selectedOrgsMap[user.id] = userOrganizationsMap[user.id].map(ug => ug.organizationId);
      }

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

  const handleOrganizationChange = (organizationId: string, userId?: string) => {
    if (userId !== undefined) {
      // For organization assignment to user in table view
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

  const handleRoleChange = (roleId: string, userId: string, organizationId: string) => {
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
    const newSelectedRoles: {[key: string]: string[]} = {};
    for (const org of allUserOrganizations[user.id] || []) {
      const userOrgKey = `${user.id}-${org.organizationId}`;
      newSelectedRoles[userOrgKey] = allUserRoles[userOrgKey]?.map(r => r.roleId) || [];
    }
    setSelectedUserRoles(newSelectedRoles);

    setEditingUser(user);
    setShowForm(true);
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

  const handleDelete = async (id: string) => {
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

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button
          onClick={() => {
            setFormData({ name: '', email: '', password: '' });
            setOrganizationAssignments([]);
            setSelectedUserRoles({});
            setEditingUser(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      {showForm ? (
        <UserForm
          editingUser={editingUser}
          formData={formData}
          organizationAssignments={organizationAssignments}
          selectedUserRoles={selectedUserRoles}
          roles={roles}
          organizations={organizations}
          handleInputChange={handleInputChange}
          handleOrganizationChange={handleOrganizationChange}
          handleSubmit={handleSubmit}
          setShowForm={setShowForm}
          setFormData={setFormData}
          setOrganizationAssignments={setOrganizationAssignments}
          setSelectedUserRoles={setSelectedUserRoles}
          setEditingUser={setEditingUser}
        />
      ) : null}

      {/* Only show user list if not in form mode (hide when creating or editing) */}
      {!showForm ? (
        <UserList
          users={users}
          roles={roles}
          organizations={organizations}
          loading={loading}
          error={error}
          allUserOrganizations={allUserOrganizations}
          allUserRoles={allUserRoles}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
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
              onClick={() => {
                setFormData({ name: '', email: '', password: '' });
                setOrganizationAssignments([]);
                setSelectedUserRoles({});
                setEditingUser(null);
                setShowForm(true);
              }}
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