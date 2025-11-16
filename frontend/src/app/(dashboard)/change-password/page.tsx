'use client';

import { useState } from 'react';
import { Lock, Check } from 'lucide-react';
import api from '@/lib/api';

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    if (formData.new_password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/change-password', {
        old_password: formData.old_password,
        new_password: formData.new_password,
      });
      
      setSuccess(true);
      setFormData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full mb-4">
          <Lock className="text-purple-400" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Change Password</h1>
        <p className="text-gray-400">Update your account password</p>
      </div>

      {/* Form */}
      <div className="glass-effect rounded-xl p-6">
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-3">
            <Check size={20} />
            <span>Password changed successfully!</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={formData.old_password}
                onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                placeholder="Enter your current password"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                placeholder="Enter your new password"
                required
                minLength={6}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Password must be at least 6 characters long
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                placeholder="Confirm your new password"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </form>

        {/* Security Tips */}
        <div className="mt-8 p-4 glass-effect-strong rounded-lg">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Password Security Tips</h3>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              <span>Use a combination of letters, numbers, and special characters</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              <span>Avoid using personal information or common words</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              <span>Don't reuse passwords from other accounts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              <span>Change your password regularly for better security</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
