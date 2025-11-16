'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import api from '@/lib/api';
import type { Client, ClientCreate } from '@/types';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientCreate>({
    name: '',
    email: '',
    phone: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async (search?: string) => {
    try {
      const params = search ? { search } : {};
      const response = await api.get('/clients', { params });
      setClients(response.data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchClients(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      setShowModal(false);
      setEditingClient(null);
      setFormData({ name: '', email: '', phone: '', location: '', notes: '' });
      fetchClients(searchTerm);
    } catch (err) {
      console.error('Failed to save client:', err);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      location: client.location,
      notes: client.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
      await api.delete(`/clients/${id}`);
      fetchClients(searchTerm);
    } catch (err) {
      console.error('Failed to delete client:', err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', location: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clients</h1>
          <p className="text-gray-400">Manage your client database</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          Add New Client
        </button>
      </div>

      {/* Search */}
      <div className="glass-effect rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="glass-effect rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : clients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-900/20">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Name</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Email</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Phone</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Location</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="py-4 px-6 text-white">{client.name}</td>
                    <td className="py-4 px-6 text-gray-300">{client.email}</td>
                    <td className="py-4 px-6 text-gray-300">{client.phone}</td>
                    <td className="py-4 px-6 text-gray-300">{client.location}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            No clients found. Add your first client to get started.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect-strong rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingClient ? 'Update' : 'Create'}
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
