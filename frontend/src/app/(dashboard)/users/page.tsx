'use client';

import { useState, useEffect } from 'react';
import { usersService } from '@/services/users';
import { User, UserRole, UserCreate } from '@/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserCreate>({
    username: '',
    email: '',
    password: '',
    role: UserRole.USER,
    is_active: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usersService.createUser(formData);
      alert('User created successfully');
      setShowAddModal(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: UserRole.USER,
        is_active: true,
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(error.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await usersService.updateUser(selectedUser.id, {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        is_active: formData.is_active,
      });
      alert('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      await usersService.deleteUser(userId);
      alert('User deactivated successfully');
      fetchUsers();
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      alert(error.response?.data?.detail || 'Failed to deactivate user');
    }
  };

  const handleActivateUser = async (userId: number) => {
    try {
      await usersService.activateUser(userId);
      alert('User activated successfully');
      fetchUsers();
    } catch (error: any) {
      console.error('Error activating user:', error);
      alert(error.response?.data?.detail || 'Failed to activate user');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      is_active: user.is_active,
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Users Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Add New User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-purple-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-white">Username</th>
              <th className="px-6 py-3 text-left text-white">Email</th>
              <th className="px-6 py-3 text-left text-white">Role</th>
              <th className="px-6 py-3 text-left text-white">Status</th>
              <th className="px-6 py-3 text-left text-white">Created At</th>
              <th className="px-6 py-3 text-left text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-6 py-4 text-white">{user.username}</td>
                  <td className="px-6 py-4 text-gray-300">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === UserRole.ADMIN
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.is_active
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      {user.is_active ? (
                        <button
                          onClick={() => handleDeactivateUser(user.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateUser(user.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Add New User</h2>
            <form onSubmit={handleAddUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
                  >
                    <option value={UserRole.USER}>User</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-gray-300">Active</label>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Edit User</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
                  >
                    <option value={UserRole.USER}>User</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-gray-300">Active</label>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Update User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob