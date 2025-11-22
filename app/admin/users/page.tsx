'use client';

import React, { useState, useEffect } from 'react';
import { User, Role } from '../../../db/schema';
import { userApi, roleApi } from '../../../lib/api/rbac-api';
import { Plus, Edit, Trash2, Save, X, Users, Shield, Key } from 'lucide-react';

interface UserRole {
  roleId: number;
  roleName: string;
  roleDescription: string | null;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Omit<User, 'password'> | null>(null);
  const [selectedUserRoles, setSelectedUserRoles] = useState<{[key: number]: number[]}>({});
  const [allUserRoles, setAllUserRoles] = useState<{[key: number]: UserRole[]}>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [roleAssignments, setRoleAssignments] = useState<number[]>([]);

  useEffect(() => {
    loadUsersAndRoles();
  }, []);

  const loadUsersAndRoles = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        userApi.getUsers(),
        roleApi.getRoles(),
      ]);
      
      setUsers(usersData);
      setRoles(rolesData);
      
      // Load roles for each user
      const userRolesMap: {[key: number]: UserRole[]} = {};
      for (const user of usersData) {
        try {
          const userRoles = await userApi.getUserRoles(user.id);
          userRolesMap[user.id] = userRoles.map(ur => {
            const role = rolesData.find(r => r.id === ur.roleId);
            return {
              roleId: ur.roleId,
              roleName: role?.name || 'Unknown Role',
              roleDescription: role?.description || null
            };
          });
        } catch (err) {
          console.error(`Error loading roles for user ${user.id}:`, err);
          userRolesMap[user.id] = [];
        }
      }
      setAllUserRoles(userRolesMap);
      
      // Initialize selected user roles
      const selectedRolesMap: {[key: number]: number[]} = {};
      for (const user of usersData) {
        selectedRolesMap[user.id] = userRolesMap[user.id].map(ur => ur.roleId);
      }
      setSelectedUserRoles(selectedRolesMap);
      
    } catch (err) {
      setError('Failed to load users and roles');
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

  const handleRoleChange = (roleId: number, userId?: number) => {
    if (userId !== undefined) {
      // For role assignment to user
      setSelectedUserRoles(prev => {
        const currentRoles = prev[userId] || [];
        const newRoles = currentRoles.includes(roleId)
          ? currentRoles.filter(id => id !== roleId)
          : [...currentRoles, roleId];
        
        // Update the backend
        userApi.assignRolesToUser(userId, newRoles)
          .then(success => {
            if (success) {
              // Update all user roles cache
              setAllUserRoles(prevRoles => ({
                ...prevRoles,
                [userId]: roles.filter(r => newRoles.includes(r.id)).map(r => ({
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
          [userId]: newRoles
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
      } else {
        // Create new user
        await userApi.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      }
      
      // Reset form and reload data
      setFormData({ name: '', email: '', password: '' });
      setRoleAssignments([]);
      setEditingUser(null);
      setShowForm(false);
      await loadUsersAndRoles();
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
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userApi.deleteUser(id);
        await loadUsersAndRoles();
      } catch (err) {
        setError('Failed to delete user');
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', password: '' });
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
                    {allUserRoles[user.id]?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {allUserRoles[user.id].map(userRole => (
                          <span 
                            key={userRole.roleId}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {userRole.roleName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No roles assigned</span>
                    )}
                  </div>
                  
                  {/* Role assignment dropdown */}
                  <div className="mt-2">
                    <label className="block text-xs text-gray-500 mb-1">Assign Roles:</label>
                    <div className="flex flex-wrap gap-2">
                      {roles.map(role => (
                        <label key={role.id} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedUserRoles[user.id]?.includes(role.id) || false}
                            onChange={() => handleRoleChange(role.id, user.id)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-1 text-sm text-gray-700">{role.name}</span>
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

      {users.length === 0 && (
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