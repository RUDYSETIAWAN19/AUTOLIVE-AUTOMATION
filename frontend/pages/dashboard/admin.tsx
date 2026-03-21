import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import {
  UsersIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  KeyIcon,
  PaintBrushIcon,
  ArrowTrendingUpIcon,
  ArrowLeftOnRectangleIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('users');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      router.push('/login');
      return;
    }
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const menuItems = [
    { id: 'users', label: t('dashboard.admin.users'), icon: UsersIcon },
    { id: 'settings', label: t('dashboard.admin.settings'), icon: Cog6ToothIcon },
    { id: 'analytics', label: t('dashboard.admin.analytics'), icon: ChartBarIcon },
    { id: 'api', label: t('dashboard.admin.api'), icon: KeyIcon },
    { id: 'branding', label: t('dashboard.admin.branding'), icon: PaintBrushIcon },
    { id: 'upgrade', label: t('dashboard.admin.upgrade'), icon: ArrowTrendingUpIcon },
  ];

  const usersData = [
    { id: 1, name: 'Rudy Setiawan', email: 'rudysetiawan111@gmail.com', plan: 'premium', status: 'active', joined: '2024-01-15' },
    { id: 2, name: 'Marga Jaya Bird Shop', email: 'marga.jaya.bird.shop@gmail.com', plan: 'pro', status: 'active', joined: '2024-02-20' },
    { id: 3, name: 'AutoLive Admin', email: 'autolive1.0.0@gmail.com', plan: 'free', status: 'active', joined: '2024-03-01' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-2xl font-bold">AutoLive</h1>
          <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
        </div>

        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">{user?.name?.charAt(0) || 'A'}</span>
            </div>
            <div>
              <p className="font-medium">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 transition ${
                activeTab === item.id ? 'bg-gray-800 text-white' : ''
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 transition mt-4 border-t border-gray-800"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.admin.title')}</h1>
          <p className="text-gray-600">{t('dashboard.admin.welcome')}, {user?.name || 'Admin'}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <UserGroupIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Users</p>
                <p className="text-2xl font-bold">892</p>
              </div>
              <ShieldCheckIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Videos</p>
                <p className="text-2xl font-bold">5,678</p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Premium Users</p>
                <p className="text-2xl font-bold">234</p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">User Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usersData.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.plan === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                          user.plan === 'pro' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.joined}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-800">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Website Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                <input type="text" className="w-full px-3 py-2 border rounded-md" defaultValue="AutoLive" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                <textarea className="w-full px-3 py-2 border rounded-md" rows={3} defaultValue="Automate Your Viral Content" />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save Settings</button>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Platform Analytics</h2>
            <p className="text-gray-500">Analytics dashboard coming soon...</p>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">API Keys Management</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API Key</label>
                <input type="password" className="w-full px-3 py-2 border rounded-md" placeholder="sk-..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube API Key</label>
                <input type="password" className="w-full px-3 py-2 border rounded-md" placeholder="AIza..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google TTS API Key</label>
                <input type="password" className="w-full px-3 py-2 border rounded-md" placeholder="Enter API key" />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save API Keys</button>
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Branding Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                <input type="file" className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <input type="color" className="w-20 h-10" defaultValue="#0ea5e9" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                <input type="color" className="w-20 h-10" defaultValue="#6366f1" />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save Branding</button>
            </div>
          </div>
        )}

        {activeTab === 'upgrade' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <p className="text-3xl font-bold mb-4">$0<span className="text-sm text-gray-500">/month</span></p>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>✓ 5 videos/day</li>
                <li>✓ 1 social account</li>
                <li>✓ Basic AI features</li>
                <li>✗ Priority support</li>
              </ul>
              <button className="w-full bg-gray-200 text-gray-600 py-2 rounded-md">Current Plan</button>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center border-2 border-blue-500">
              <h3 className="text-xl font-bold mb-2 text-blue-600">Pro</h3>
              <p className="text-3xl font-bold mb-4">$29<span className="text-sm text-gray-500">/month</span></p>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>✓ 20 videos/day</li>
                <li>✓ 5 social accounts</li>
                <li>✓ Advanced AI features</li>
                <li>✓ Priority support</li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Upgrade to Pro</button>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Premium</h3>
              <p className="text-3xl font-bold mb-4">$99<span className="text-sm text-gray-500">/month</span></p>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>✓ Unlimited videos</li>
                <li>✓ Unlimited accounts</li>
                <li>✓ Full AI features</li>
                <li>✓ 24/7 priority support</li>
              </ul>
              <button className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700">Upgrade to Premium</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
