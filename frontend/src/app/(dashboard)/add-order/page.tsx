'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import api, { isAdmin } from '@/lib/api';
import type { Client, OrderCreate, User } from '@/types';

export default function AddOrderPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OrderCreate>({
    client_id: 0,
    order_name: '',
    order_link: '',
    quantity: 1,
    cost: 0,
    customer_price: 0,
    taxes: 0,
    assigned_to: undefined,
  });

  useEffect(() => {
    fetchClients();
    checkAdminAndFetchUsers();
  }, []);

  const checkAdminAndFetchUsers = async () => {
    const adminStatus = await isAdmin();
    setUserIsAdmin(adminStatus);
    
    if (adminStatus) {
      fetchUsers();
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/orders', formData);
      router.push('/order-pending');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full mb-4">
          <ShoppingBag className="text-purple-400" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Add New Order</h1>
        <p className="text-gray-400">Create a new order for your client</p>
      </div>

      {/* Form */}
      <div className="glass-effect rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Client *
            </label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              required
            >
              <option value={0}>Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id} className="bg-slate-800">
                  {client.name} - {client.phone}
                </option>
              ))}
            </select>
            {clients.length === 0 && (
              <p className="mt-2 text-sm text-amber-400">
                No clients available. Please add a client first.
              </p>
            )}
          </div>

          {userIsAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Assign to User (Optional)
              </label>
              <select
                value={formData.assigned_to || 0}
                onChange={(e) => setFormData({ ...formData, assigned_to: parseInt(e.target.value) || undefined })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              >
                <option value={0}>Not assigned (use default)</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id} className="bg-slate-800">
                    {user.username} ({user.role})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">
                Assign this order to a specific user. If not selected, it will be assigned to you.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Order Name *
            </label>
            <input
              type="text"
              value={formData.order_name}
              onChange={(e) => setFormData({ ...formData, order_name: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              placeholder="e.g., Summer Collection T-Shirt"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Order Link
            </label>
            <input
              type="url"
              value={formData.order_link}
              onChange={(e) => setFormData({ ...formData, order_link: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              placeholder="https://example.com/product"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cost (USD) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                placeholder="Your cost"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Customer Price (USD) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.customer_price}
                onChange={(e) => setFormData({ ...formData, customer_price: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                placeholder="Selling price"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Taxes (USD) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.taxes}
                onChange={(e) => setFormData({ ...formData, taxes: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                placeholder="Tax amount"
                required
              />
            </div>
          </div>

          {/* Summary */}
          <div className="glass-effect-strong rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Quantity:</span>
              <span className="text-white">{formData.quantity} items</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Cost:</span>
              <span className="text-white">${formData.cost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Customer Price:</span>
              <span className="text-white">${formData.customer_price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Taxes:</span>
              <span className="text-white">${formData.taxes.toFixed(2)}</span>
            </div>
            <div className="border-t border-white/10 pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span className="text-gray-300">Expected Profit:</span>
                <span className="text-green-400 text-lg">
                  ${(formData.customer_price - formData.cost - formData.taxes).toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Customer Price - Cost - Taxes
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || clients.length === 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Made with Bob
