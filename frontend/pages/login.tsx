import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/auth/LanguageSelector';
import SocialLogin from '../components/auth/SocialLogin';
import api from '../lib/api';
import '../lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Admin users list
  const adminUsers = [
    'rudysetiawan111@gmail.com',
    'marga.jaya.bird.shop@gmail.com',
    'autolive1.0.0@gmail.com'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on role
      if (user.role === 'admin' || adminUsers.includes(user.email)) {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/user');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setLoading(true);
    try {
      // Redirect to social auth
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
    } catch (err: any) {
      setError(`Failed to login with ${provider}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-end p-4">
        <LanguageSelector />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">AutoLive</h1>
            <p className="text-gray-600 mt-2">{t('login.subtitle')}</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-center mb-6">{t('login.title')}</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('login.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="octocat@github.com"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('login.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50 font-medium"
              >
                {loading ? 'Signing in...' : t('login.button')}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('login.or')}</span>
              </div>
            </div>

            <SocialLogin onSocialLogin={handleSocialLogin} loading={loading} />

            <div className="mt-6 text-center text-sm">
              <Link href="/forgot-password" className="text-blue-600 hover:underline">
                {t('login.forgotPassword')}
              </Link>
            </div>
          </div>

          {/* Sign up link */}
          <div className="mt-4 text-center text-sm text-gray-600">
            {t('login.noAccount')}{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              {t('login.createAccount')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
