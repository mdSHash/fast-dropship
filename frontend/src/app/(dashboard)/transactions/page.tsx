'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, X } from 'lucide-react';
import api, { isAdmin } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Transaction, TransactionCreate, TransactionType, TransactionCategory } from '@/types';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ total_income: 0, total_expenses: 0, profit: 0 });
  const [loading, setLoading] = useState(true);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<TransactionCreate>({
    type: 'income' as TransactionType,
    category: 'order_payment' as TransactionCategory,
    amount: 0,
    description: '',
  });

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const adminStatus = await isAdmin();
    setUserIsAdmin(adminStatus);
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get('/transactions/summary');
      setSummary(response.data);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/transactions', formData);
      setShowModal(false);
      setFormData({
        type: 'income' as TransactionType,
        category: 'order_payment' as TransactionCategory,
        amount: 0,
        description: '',
      });
      fetchTransactions();
      fetchSummary();
    } catch (err) {
      console.error('Failed to create transaction:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Budget & Transactions</h1>
          <p className="text-gray-400">Track your income and expenses</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-effect rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-green-400" size={24} />
            <h3 className="text-gray-400 text-sm">Total Income</h3>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(summary.total_income)}</p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-red-500/30">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="text-red-400" size={24} />
            <h3 className="text-gray-400 text-sm">Total Expenses</h3>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(summary.total_expenses)}</p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-cyan-400" size={24} />
            <h3 className="text-gray-400 text-sm">Net Profit</h3>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(summary.profit)}</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-effect rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-900/20">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Type</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Category</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Description</th>
                  {userIsAdmin && (
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Created By</th>
                  )}
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-300">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="py-4 px-6 text-gray-300 text-sm">
                      {formatDate(transaction.transaction_date)}
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                        transaction.type === 'income'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {transaction.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span className="text-xs font-medium capitalize">{transaction.type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-300 text-sm capitalize">
                      {transaction.category.replace('_', ' ')}
                    </td>
                    <td className="py-4 px-6 text-white">
                      {transaction.description || 'No description'}
                    </td>
                    {userIsAdmin && (
                      <td className="py-4 px-6 text-gray-300">
                        {transaction.created_by_username || 'N/A'}
                      </td>
                    )}
                    <td className={`py-4 px-6 text-right font-medium ${
                      transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <DollarSign className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400">No transactions yet</p>
            <p className="text-sm text-gray-500 mt-2">Add your first transaction to get started</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect-strong rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add Transaction</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                  required
                >
                  <option value="income" className="bg-slate-800">Income</option>
                  <option value="expense" className="bg-slate-800">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as TransactionCategory })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                  required
                >
                  <option value="order_payment" className="bg-slate-800">Order Payment</option>
                  <option value="delivery_cost" className="bg-slate-800">Delivery Cost</option>
                  <option value="product_cost" className="bg-slate-800">Product Cost</option>
                  <option value="operational" className="bg-slate-800">Operational</option>
                  <option value="other" className="bg-slate-800">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount (USD) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white resize-none"
                  placeholder="Optional description..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Add Transaction
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
