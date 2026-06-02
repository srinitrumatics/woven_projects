'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Role, Organization } from '../../../db/schema';
import { userApi, roleApi, organizationApi } from '../../../lib/api/rbac-api';
import { Plus, Users, Sparkles } from 'lucide-react';
import UserList from '../../../components/UserManagement/UserList';
import UserForm from '../../../components/UserManagement/UserForm';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useUserSession } from '../../../components/UserSessionContext';

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

  const { user, selectedAccount } = useUserSession();
  const accountType = selectedAccount?.Account_Record_Type__c || 'Customer';
  const typeCategory = (accountType === 'Customer' || accountType === 'NSO') ? 'Customer' :
    (accountType === 'Hybrid') ? 'Hybrid' : 'Partner';
  const isCustomer = typeCategory === 'Customer';

  useEffect(() => {
    if (selectedAccount !== undefined) {
      loadUsersRolesAndOrganizations();
    }
  }, [selectedAccount, isCustomer]);

  const loadUsersRolesAndOrganizations = async () => {
    try {
      setLoading(true);

      const accountId = selectedAccount?.Id || selectedAccount?.id;
      const contactId = user?.Id || user?.contact?.Id;

      if (!accountId || !contactId) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const url = `/api/salesforce/orders?action=contacts&accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch Salesforce contacts');
      }
      const data = await response.json();
      const sfData = Array.isArray(data) ? data : (data.data || []);

      const uniqueUsersMap = new Map();
      sfData.forEach((contact: any) => {
        const contactId = contact.Id || contact.id;
        if (contactId && !uniqueUsersMap.has(contactId)) {
          uniqueUsersMap.set(contactId, {
            id: contact.Id || contact.id,
            name: contact.Name || contact.name || 'Unknown',
            email: contact.Email || contact.email || '',
            phone: contact.Phone || contact.phone || '',
            title: contact.Title || contact.title || '',
            department: contact.Department || contact.department || '',
            mobile: contact.MobilePhone || contact.mobilePhone || contact.mobile || '',
          });
        }
      });

      const sfUsers = Array.from(uniqueUsersMap.values());

      setUsers(sfUsers);
      setRoles([]);
      setOrganizations([]);
      setAllUserRoles({});
      setAllUserOrganizations({});
      setSelectedUserRoles({});
      setSelectedUserOrganizations({});

    } catch (err) {
      setError('Failed to load users from Salesforce');
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
    <ProtectedRoute>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-gray-600 dark:text-gray-400 text-[16px] mt-1 truncate" title="Manage contacts assigned to your company account">
          Manage contacts assigned to your company account
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
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
            isCustomer={true}
          />
        )}

        {/* Empty State */}
        {users.length === 0 && !showForm && (
          <div className="py-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No Users Found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              There are currently no contacts assigned to your company account.
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default UserManagement;