'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Role, Organization } from '../../../db/schema';
import { userApi, roleApi, organizationApi } from '../../../lib/api/rbac-api';
import { Plus, Users, Sparkles } from 'lucide-react';
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
  const [selectedUserRoles, setSelectedUserRoles] = useState<{ [key: string]: string[] }>({});
  const [selectedUserOrganizations, setSelectedUserOrganizations] = useState<{ [key: string]: string[] }>({});
  const [allUserRoles, setAllUserRoles] = useState<{ [key: string]: UserRole[] }>({});
  const [allUserOrganizations, setAllUserOrganizations] = useState<{ [key: string]: UserOrganization[] }>({});

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

      const userOrgRolesMap: { [key: string]: UserRole[] } = {};
      const userOrganizationsMap: { [key: string]: UserOrganization[] } = {};

      for (const user of usersData) {
        try {
          const userOrgs = await userApi.getUserOrganizations(user.id);
          userOrganizationsMap[user.id] = userOrgs.map(ug => {
            const org = organizationsData.find(o => o.id === ug.organizationId);
            return {
              organizationId: ug.organizationId,
              organizationName: org?.name || 'Unknown Organization',
              organizationDescription: org?.description || null
            };
          });

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
          userOrgRolesMap[user.id] = [];
          userOrganizationsMap[user.id] = [];
        }
      }

      setAllUserRoles(userOrgRolesMap);
      setAllUserOrganizations(userOrganizationsMap);

      const selectedRolesMap: { [key: string]: string[] } = {};
      const selectedOrgsMap: { [key: string]: string[] } = {};

      for (const user of usersData) {
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
      setSelectedUserOrganizations(prev => {
        const currentOrganizations = prev[userId] || [];
        const newOrganizations = currentOrganizations.includes(organizationId)
          ? currentOrganizations.filter(id => id !== organizationId)
          : [...currentOrganizations, organizationId];

        userApi.assignOrganizationsToUser(userId, newOrganizations)
          .then(success => {
            if (success) {
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
      setOrganizationAssignments(prev =>
        prev.includes(organizationId)
          ? prev.filter(id => id !== organizationId)
          : [...prev, organizationId]
      );
    }
  };

  const handleRoleChange = (roleId: string, userId: string, organizationId: string) => {
    setSelectedUserRoles(prev => {
      const userOrgKey = `${userId}-${organizationId}`;
      const currentRoles = prev[userOrgKey] || [];
      const newRoles = currentRoles.includes(roleId)
        ? currentRoles.filter(id => id !== roleId)
        : [...currentRoles, roleId];

      userApi.assignRolesToUser(userId, newRoles, organizationId)
        .then(success => {
          if (success) {
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
      password: ''
    });

    const userOrganizations = allUserOrganizations[user.id]?.map(ug => ug.organizationId) || [];
    setOrganizationAssignments(userOrganizations);

    const newSelectedRoles: { [key: string]: string[] } = {};
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
        await userApi.updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          ...(formData.password && { password: formData.password })
        });

        await userApi.assignOrganizationsToUser(editingUser.id, organizationAssignments);

        for (const orgId of organizationAssignments) {
          const userOrgKey = `${editingUser.id}-${orgId}`;
          const rolesForOrg = selectedUserRoles[userOrgKey] || [];
          await userApi.assignRolesToUser(editingUser.id, rolesForOrg, orgId);
        }
      } else {
        const newUser = await userApi.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });

        await userApi.assignOrganizationsToUser(newUser.id, organizationAssignments);

        for (const orgId of organizationAssignments) {
          const userOrgKey = `new-${orgId}`;
          const rolesForOrg = selectedUserRoles[userOrgKey] || [];
          await userApi.assignRolesToUser(newUser.id, rolesForOrg, orgId);
        }
      }

      setFormData({ name: '', email: '', password: '' });
      setOrganizationAssignments([]);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-16 bg-gray-200 rounded-2xl mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Users</div>
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/20 to-cyan-50/20 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    User Management
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Manage users, roles, and organization assignments
                  </p>
                </div>
              </div>
              {!showForm && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setFormData({ name: '', email: '', password: '' });
                    setOrganizationAssignments([]);
                    setSelectedUserRoles({});
                    setEditingUser(null);
                    setShowForm(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add New User
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Form */}
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

        {/* User List */}
        {!showForm && users.length > 0 && (
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
        )}

        {/* Empty State */}
        {users.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-500/20 to-cyan-600/20 rounded-2xl flex items-center justify-center">
                  <Users className="w-12 h-12 text-teal-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Users Yet</h3>
              <p className="text-gray-500 mb-8">
                Get started by creating your first user account to manage access and permissions.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFormData({ name: '', email: '', password: '' });
                  setOrganizationAssignments([]);
                  setSelectedUserRoles({});
                  setEditingUser(null);
                  setShowForm(true);
                }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 font-semibold text-lg"
              >
                <Plus className="w-6 h-6" />
                Create Your First User
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;