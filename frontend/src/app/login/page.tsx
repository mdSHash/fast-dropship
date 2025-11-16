'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { getCurrentUser } from '@/lib/api';
import { Lock, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const formDataObj = new FormData();
        formDataObj.append('username', formData.username);
        formDataObj.append('password', formData.password);

        const response = await api.post('/auth/login', formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        localStorage.setItem('token', response.data.access_token);
        // Fetch and cache user info
        await getCurrentUser();
        router.push('/dashboard');
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        await api.post('/auth/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });

        // Auto login after registration
        const formDataObj = new FormData();
        formDataObj.append('username', formData.username);
        formDataObj.append('password', formData.password);

        const response = await api.post('/auth/login', formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        localStorage.setItem('token', response.data.access_token);
        // Fetch and cache user info
        await getCurrentUser();
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Fast-Dropship
          </h1>
          <p className="text-gray-400">Business Management Dashboard</p>
        </div>

        {/* Form Card */}
        <div className="glass-effect-strong rounded-2xl p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                  placeholder="Enter your email"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                    placeholder="Confirm your password"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
