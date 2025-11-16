'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Package } from 'lucide-react';
import api, { isAdmin } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { OrderWithClient } from '@/types';

export default function OrderCompletedPage() {
  const [orders, setOrders] = useState<OrderWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

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
      const response = await api.get('/orders/completed');
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Completed Orders</h1>
        <p className="text-gray-400">View your order history and completed transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-effect rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-400" size={24} />
            <h3 className="text-gray-400 text-sm">Total Completed</h3>
          </div>
          <p className="text-3xl font-bold text-white">{orders.length}</p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-cyan-400" size={24} />
            <h3 className="text-gray-400 text-sm">Total Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(orders.reduce((sum, order) => sum + order.customer_price, 0))}
          </p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-green-400" size={24} />
            <h3 className="text-gray-400 text-sm">Total Profit</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(orders.reduce((sum, order) => sum + order.profit, 0))}
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
              <thead className="bg-green-900/20">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Order</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Client</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Qty</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Cost</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Price</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Taxes</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Profit</th>
                  {userIsAdmin && (
                    <>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Created By</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Assigned To</th>
                    </>
                  )}
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Completed</th>
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
                    <td className="py-4 px-6 text-gray-300">{order.quantity}</td>
                    <td className="py-4 px-6 text-gray-300">{formatCurrency(order.cost)}</td>
                    <td className="py-4 px-6 text-gray-300">{formatCurrency(order.customer_price)}</td>
                    <td className="py-4 px-6 text-gray-300">{formatCurrency(order.taxes)}</td>
                    <td className="py-4 px-6 text-green-400 font-medium">
                      {formatCurrency(order.profit)}
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
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-gray-300 text-sm">
                          {order.completed_at ? formatDate(order.completed_at) : 'N/A'}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle className="text-green-400" size={14} />
                          <span className="text-xs text-green-400">Completed</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400">No completed orders yet</p>
            <p className="text-sm text-gray-500 mt-2">Complete your first order to see it here!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob
