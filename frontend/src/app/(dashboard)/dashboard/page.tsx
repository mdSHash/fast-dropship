'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Users, ShoppingBag, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { DashboardData } from '@/types';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
        {error}
      </div>
    );
  }

  const stats = data?.stats || { monthly_profit: 0, monthly_revenue: 0, overall_capital: 0, total_clients: 0, ongoing_orders: 0 };
  const chartData = data?.chart_data?.monthly_data || [];
  const recentClients = data?.recent_clients || [];
  const recentOrders = data?.recent_orders || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's your business overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Monthly Profit Card */}
        <div className="glass-effect rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
              <DollarSign className="text-green-400" size={24} />
            </div>
            <TrendingUp className="text-green-400" size={20} />
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Monthly Profit</h3>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats.monthly_profit)}</p>
        </div>

        {/* Monthly Revenue Card */}
        <div className="glass-effect rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
              <TrendingUp className="text-blue-400" size={24} />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Monthly Revenue</h3>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats.monthly_revenue)}</p>
        </div>

        {/* Overall Capital Card */}
        <div className="glass-effect rounded-xl p-6 border border-cyan-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-lg">
              <DollarSign className="text-cyan-400" size={24} />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Overall Capital</h3>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats.overall_capital)}</p>
        </div>

        {/* Clients Card */}
        <div className="glass-effect rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
              <Users className="text-purple-400" size={24} />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Clients</h3>
          <p className="text-2xl font-bold text-white">{stats.total_clients}</p>
        </div>

        {/* Ongoing Orders Card */}
        <div className="glass-effect rounded-xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg">
              <ShoppingBag className="text-orange-400" size={24} />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Ongoing Orders</h3>
          <p className="text-2xl font-bold text-white">{stats.ongoing_orders}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Monthly Performance</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="pv"
                stroke="#EC4899"
                strokeWidth={2}
                name="Monthly Revenue"
                dot={{ fill: '#EC4899' }}
              />
              <Line
                type="monotone"
                dataKey="uv"
                stroke="#8B5CF6"
                strokeWidth={2}
                name="Monthly Profit"
                dot={{ fill: '#8B5CF6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            No data to display
          </div>
        )}
      </div>

      {/* Recent Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <div className="glass-effect rounded-xl p-6 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl" />
          
          <h2 className="text-xl font-bold text-white mb-4 relative z-10">Last 10 New Clients</h2>
          <div className="relative z-10">
            {recentClients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Name</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Phone</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentClients.map((client) => (
                      <tr key={client.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-2 text-sm text-white">{client.name}</td>
                        <td className="py-3 px-2 text-sm text-gray-300">{client.phone}</td>
                        <td className="py-3 px-2 text-sm text-gray-300">{client.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No clients available.</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="glass-effect rounded-xl p-6 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl" />
          
          <h2 className="text-xl font-bold text-white mb-4 relative z-10">Last 10 Orders</h2>
          <div className="relative z-10">
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Order Name</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Qty</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Price</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-2 text-sm text-white">{order.order_name}</td>
                        <td className="py-3 px-2 text-sm text-gray-300">{order.quantity}</td>
                        <td className="py-3 px-2 text-sm text-gray-300">{formatCurrency(order.customer_price)}</td>
                        <td className="py-3 px-2 text-sm text-green-400">{formatCurrency(order.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No orders available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
