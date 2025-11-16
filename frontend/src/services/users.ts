import api from '@/lib/api';
import { User, UserCreate, UserUpdate } from '@/types';

export const usersService = {
  // Get all users (admin only)
  async getUsers(): Promise<User[]> {
    const response = await api.get('/users/');
    return response.data;
  },

  // Get a specific user
  async getUser(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create a new user (admin only)
  async createUser(data: UserCreate): Promise<User> {
    const response = await api.post('/users/', data);
    return response.data;
  },

  // Update a user (admin only)
  async updateUser(id: number, data: UserUpdate): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete/deactivate a user (admin only)
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  // Reset user password (admin only)
  async resetPassword(id: number, newPassword: string): Promise<void> {
    await api.post(`/users/${id}/reset-password`, { new_password: newPassword });
  },

  // Activate a user (admin only)
  async activateUser(id: number): Promise<void> {
    await api.post(`/users/${id}/activate`);
  },
};

// Made with Bob