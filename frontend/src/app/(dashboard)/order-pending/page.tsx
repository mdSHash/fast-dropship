'use client';

import { useEffect, useState } from 'react';
import { Clock, CheckCircle, Eye, Edit, X } from 'lucide-react';
import api, { isAdmin } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { OrderWithClient } from '@/types';

interface EditFormData {
  order_name: string;
  order_link: string;
  quantity: number;
  cost: number;
  customer_price: number;
  taxes: number;
}

export default function OrderPendingPage() {
  const [orders, setOrders] = useState<OrderWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderWithClient | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    order_name: '',
    order_link: '',
    quantity: 0,
    cost: 0,
    customer_price: 0,
    taxes: 0,
  });

  useEffect(() => {
    fetchOrders();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const adminStatus = await isAdmin();
    setUserIsAdmin(adminStatus);
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/pending');
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (orderId: number) => {
    if (!confirm('Mark this order as completed?')) return;

    try {
      await api.put(`/orders/${orderId}`, { status: 'completed' });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order:', err);
    }
  };

  const handleEditClick = (order: OrderWithClient) => {
    setEditingOrder(order);
    setEditForm({
      order_name: order.order_name,
      order_link: order.order_link || '',
      quantity: order.quantity,
      cost: order.cost,
      customer_price: order.customer_price,
      taxes: order.taxes,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      await api.put(`/orders/${editingOrder.id}`, editForm);
      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order:', err);
      alert('Failed to update order. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setEditForm({
      order_name: '',
      order_link: '',
      quantity: 0,
      cost: 0,
      customer_price: 0,
      taxes: 0,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Pending Orders</h1>
        <p className="text-gray-400">Track and manage orders awaiting completion</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-effect rounded-xl p-6 border border-orange-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-orange-400" size={24} />
            <h3 className="text-gray-400 text-sm">Total Pending</h3>
          </div>
          <p className="text-3xl font-bold text-white">{orders.length}</p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="text-cyan-400" size={24} />
            <h3 className="text-gray-400 text-sm">Total Value</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(orders.reduce((sum, order) => sum + (order.customer_price || 0), 0))}
          </p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-purple-400" size={24} />
            <h3 className="text-gray-400 text-sm">Total Items</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {orders.reduce((sum, order) => sum + (order.quantity || 0), 0)}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-effect rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-orange-900/20">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Order</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Client</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Quantity</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Price</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Total</th>
                  {userIsAdmin && (
                    <>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Created By</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Assigned To</th>
                    </>
                  )}
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Date</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-white font-medium">{order.order_name}</p>
                        {order.order_link && (
                          <a
                            href={order.order_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-400 hover:underline"
                          >
                            View Link
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-white">{order.client_name}</p>
                        <p className="text-xs text-gray-400">{order.client_phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-300">{order.quantity || 0}</td>
                    <td className="py-4 px-6 text-gray-300">{formatCurrency(order.customer_price || 0)}</td>
                    <td className="py-4 px-6 text-white font-medium">
                      {formatCurrency(order.customer_price || 0)}
                    </td>
                    {userIsAdmin && (
                      <>
                        <td className="py-4 px-6 text-gray-300">
                          {order.created_by_username || 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {order.assigned_to_username || 'Not assigned'}
                        </td>
                      </>
                    )}
                    <td className="py-4 px-6 text-gray-300 text-sm">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(order)}
                          className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium flex items-center gap-1"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleMarkComplete(order.id)}
                          className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium"
                        >
                          Mark Complete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400">No pending orders</p>
            <p className="text-sm text-gray-500 mt-2">All orders have been completed!</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Order</h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Order Name *
                </label>
                <input
                  type="text"
                  value={editForm.order_name}
                  onChange={(e) => setEditForm({ ...editForm, order_name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Order Link
                </label>
                <input
                  type="url"
                  value={editForm.order_link}
                  onChange={(e) => setEditForm({ ...editForm, order_link: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cost *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.cost}
                    onChange={(e) => setEditForm({ ...editForm, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Customer Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.customer_price}
                    onChange={(e) => setEditForm({ ...editForm, customer_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Taxes *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.taxes}
                    onChange={(e) => setEditForm({ ...editForm, taxes: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Calculated Profit Display */}
              <div className="glass-effect rounded-lg p-4 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Calculated Profit:</span>
                  <span className="text-xl font-bold text-green-400">
                    {formatCurrency(
                      editForm.customer_price - editForm.cost - editForm.taxes
                    )}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Customer Price - Cost - Taxes
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium"
                >
                  Save Changes
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
