'use client';

import { useEffect, useState } from 'react';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { MonthlyData } from '@/types';

export default function PreviousMonthsPage() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchMonthlyData();
  }, [selectedYear]);

  const fetchMonthlyData = async () => {
    try {
      const response = await api.get('/transactions/monthly', {
        params: { year: selectedYear }
      });
      setMonthlyData(response.data);
    } catch (err) {
      console.error('Failed to fetch monthly data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = monthlyData.reduce((sum, month) => sum + month.pv, 0);
  const totalExpenses = monthlyData.reduce((sum, month) => sum + month.uv, 0);
  const netProfit = totalRevenue - totalExpenses;

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Previous Months</h1>
          <p className="text-gray-400">Historical performance and analytics</p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
        >
          {years.map((year) => (
            <option key={year} value={year} className="bg-slate-800">
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-effect rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-green-400" size={24} />
            <h3 className="text-gray-400 text-sm">Total Revenue ({selectedYear})</h3>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-red-500/30">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="text-red-400" size={24} />
            <h3 className="text-gray-400 text-sm">Total Expenses ({selectedYear})</h3>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-cyan-400" size={24} />
            <h3 className="text-gray-400 text-sm">Net Profit ({selectedYear})</h3>
          </div>
          <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(netProfit)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Monthly Performance - {selectedYear}</h2>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData}>
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
                stroke="#10B981"
                strokeWidth={3}
                name="Revenue"
                dot={{ fill: '#10B981', r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="uv"
                stroke="#EF4444"
                strokeWidth={3}
                name="Expenses"
                dot={{ fill: '#EF4444', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-400">
            No data available for {selectedYear}
          </div>
        )}
      </div>

      {/* Monthly Breakdown Table */}
      <div className="glass-effect rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Monthly Breakdown</h2>
        </div>
        {monthlyData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-900/20">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Month</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-300">Revenue</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-300">Expenses</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-300">Profit</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-300">Margin</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month, index) => {
                  const profit = month.pv - month.uv;
                  const margin = month.pv > 0 ? (profit / month.pv) * 100 : 0;
                  
                  return (
                    <tr key={index} className="border-t border-white/5 hover:bg-white/5">
                      <td className="py-4 px-6 text-white font-medium">{month.month}</td>
                      <td className="py-4 px-6 text-right text-green-400">
                        {formatCurrency(month.pv)}
                      </td>
                      <td className="py-4 px-6 text-right text-red-400">
                        {formatCurrency(month.uv)}
                      </td>
                      <td className={`py-4 px-6 text-right font-medium ${
                        profit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(profit)}
                      </td>
                      <td className={`py-4 px-6 text-right ${
                        margin >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {margin.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-purple-900/20 border-t-2 border-purple-500/30">
                <tr>
                  <td className="py-4 px-6 text-white font-bold">Total</td>
                  <td className="py-4 px-6 text-right text-green-400 font-bold">
                    {formatCurrency(totalRevenue)}
                  </td>
                  <td className="py-4 px-6 text-right text-red-400 font-bold">
                    {formatCurrency(totalExpenses)}
                  </td>
                  <td className={`py-4 px-6 text-right font-bold ${
                    netProfit >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(netProfit)}
                  </td>
                  <td className={`py-4 px-6 text-right font-bold ${
                    netProfit >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0'}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            No data available for {selectedYear}
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob
