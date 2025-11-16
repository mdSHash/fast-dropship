'use client';

import { useEffect, useState } from 'react';
import { Truck, Package, CheckCircle, AlertCircle, Plus, Edit, X } from 'lucide-react';
import api, { isAdmin } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { DeliveryWithOrder, OrderWithClient, DeliveryStatus } from '@/types';

interface DeliveryFormData {
  order_id: number;
  delivery_address: string;
  tracking_number: string;
  driver_name: string;
  driver_phone: string;
  status: DeliveryStatus;
  notes: string;
}

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState<DeliveryWithOrder[]>([]);
  const [pendingOrders, setPendingOrders] = useState<OrderWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<DeliveryWithOrder | null>(null);
  const [formData, setFormData] = useState<DeliveryFormData>({
    order_id: 0,
    delivery_address: '',
    tracking_number: '',
    driver_name: '',
    driver_phone: '',
    status: 'pending' as DeliveryStatus,
    notes: '',
  });

  useEffect(() => {
    fetchDeliveries();
    fetchPendingOrders();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const adminStatus = await isAdmin();
    setUserIsAdmin(adminStatus);
  };

  const fetchDeliveries = async () => {
    try {
      const response = await api.get('/deliveries');
      setDeliveries(response.data);
    } catch (err) {
      console.error('Failed to fetch deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const response = await api.get('/orders/pending');
      setPendingOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch pending orders:', err);
    }
  };

  const handleCreateClick = () => {
    setShowCreateModal(true);
    setFormData({
      order_id: 0,
      delivery_address: '',
      tracking_number: '',
      driver_name: '',
      driver_phone: '',
      status: 'pending' as DeliveryStatus,
      notes: '',
    });
  };

  const handleEditClick = (delivery: DeliveryWithOrder) => {
    setEditingDelivery(delivery);
    setFormData({
      order_id: delivery.order_id,
      delivery_address: delivery.delivery_address,
      tracking_number: delivery.tracking_number || '',
      driver_name: delivery.driver_name || '',
      driver_phone: delivery.driver_phone || '',
      status: delivery.status,
      notes: delivery.notes || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDelivery) {
        // Update existing delivery
        await api.put(`/deliveries/${editingDelivery.id}`, formData);
      } else {
        // Create new delivery
        await api.post('/deliveries', formData);
      }
      
      setShowCreateModal(false);
      setEditingDelivery(null);
      fetchDeliveries();
      fetchPendingOrders();
    } catch (err: any) {
      console.error('Failed to save delivery:', err);
      alert(err.response?.data?.detail || 'Failed to save delivery. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowCreateModal(false);
    setEditingDelivery(null);
    setFormData({
      order_id: 0,
      delivery_address: '',
      tracking_number: '',
      driver_name: '',
      driver_phone: '',
      status: 'pending' as DeliveryStatus,
      notes: '',
    });
  };

  const handleOrderChange = (orderId: number) => {
    const order = pendingOrders.find(o => o.id === orderId);
    if (order) {
      setFormData({
        ...formData,
        order_id: orderId,
        delivery_address: order.client_location || '',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-400 bg-green-500/20';
      case 'in_transit':
        return 'text-cyan-400 bg-cyan-500/20';
      case 'failed':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-orange-400 bg-orange-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={16} />;
      case 'in_transit':
        return <Truck size={16} />;
      case 'failed':
        return <AlertCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Delivery Tracking</h1>
          <p className="text-gray-400">Monitor and manage all deliveries</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Create Delivery
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-effect rounded-xl p-6 border border-orange-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-orange-400" size={24} />
            <h3 className="text-gray-400 text-sm">Pending</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {deliveries.filter(d => d.status === 'pending').length}
          </p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="text-cyan-400" size={24} />
            <h3 className="text-gray-400 text-sm">In Transit</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {deliveries.filter(d => d.status === 'in_transit').length}
          </p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-400" size={24} />
            <h3 className="text-gray-400 text-sm">Delivered</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {deliveries.filter(d => d.status === 'delivered').length}
          </p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-red-500/30">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="text-red-400" size={24} />
            <h3 className="text-gray-400 text-sm">Failed</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {deliveries.filter(d => d.status === 'failed').length}
          </p>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="glass-effect rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : deliveries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-900/20">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Order</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Client</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Address</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Driver</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Tracking</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Status</th>
                  {userIsAdmin && (
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Created By</th>
                  )}
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Date</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery) => (
                  <tr key={delivery.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="py-4 px-6 text-white font-medium">{delivery.order_name}</td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-white">{delivery.client_name}</p>
                        <p className="text-xs text-gray-400">{delivery.client_phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-300 text-sm max-w-xs truncate">
                      {delivery.delivery_address}
                    </td>
                    <td className="py-4 px-6">
                      {delivery.driver_name ? (
                        <div>
                          <p className="text-white text-sm">{delivery.driver_name}</p>
                          <p className="text-xs text-gray-400">{delivery.driver_phone}</p>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Not assigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {delivery.tracking_number ? (
                        <span className="text-cyan-400 text-sm font-mono">
                          {delivery.tracking_number}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(delivery.status)}`}>
                        {getStatusIcon(delivery.status)}
                        <span className="text-xs font-medium capitalize">
                          {delivery.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    {userIsAdmin && (
                      <td className="py-4 px-6 text-gray-300">
                        {delivery.created_by_username || 'N/A'}
                      </td>
                    )}
                    <td className="py-4 px-6 text-gray-300 text-sm">
                      {formatDate(delivery.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleEditClick(delivery)}
                          className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium flex items-center gap-1"
                        >
                          <Edit size={14} />
                          Edit
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
            <Truck className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400">No deliveries found</p>
            <p className="text-sm text-gray-500 mt-2">Deliveries will appear here once created</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingDelivery) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingDelivery ? 'Edit Delivery' : 'Create Delivery'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingDelivery && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Order *
                  </label>
                  <select
                    value={formData.order_id}
                    onChange={(e) => handleOrderChange(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  >
                    <option value={0}>Select an order...</option>
                    {pendingOrders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.order_name} - {order.client_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Delivery Address *
                </label>
                <textarea
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={formData.tracking_number}
                    onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="TRK123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as DeliveryStatus })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    value={formData.driver_name}
                    onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Driver Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.driver_phone}
                    onChange={(e) => setFormData({ ...formData, driver_phone: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  rows={3}
                  placeholder="Additional delivery notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium"
                >
                  {editingDelivery ? 'Save Changes' : 'Create Delivery'}
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
