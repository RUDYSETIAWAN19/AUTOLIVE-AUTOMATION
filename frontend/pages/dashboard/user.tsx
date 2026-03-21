import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import {
  VideoCameraIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  UserIcon,
  ArrowTrendingUpIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export default function UserDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('videos');
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
    { id: 'videos', label: t('dashboard.user.videos'), icon: VideoCameraIcon },
    { id: 'automations', label: t('dashboard.user.automations'), icon: RocketLaunchIcon },
    { id: 'analytics', label: t('dashboard.user.analytics'), icon: ChartBarIcon },
    { id: 'profile', label: t('dashboard.user.profile'), icon: UserIcon },
    { id: 'upgrade', label: t('dashboard.user.upgrade'), icon: ArrowTrendingUpIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">AutoLive</h1>
          <p className="text-sm text-gray-500 mt-1">User Dashboard</p>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition ${
                activeTab === item.id ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition mt-4 border-t border-gray-200"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.user.title')}</h1>
          <p className="text-gray-600">{t('dashboard.user.welcome')}, {user?.name || 'User'}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Videos</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <VideoCameraIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Views</p>
                <p className="text-2xl font-bold">12,345</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Automations</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <RocketLaunchIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Engagement Rate</p>
                <p className="text-2xl font-bold">8.5%</p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'videos' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">My Videos</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                + Upload Video
              </button>
            </div>
            <div className="p-6 text-center text-gray-500">
              No videos yet. Click "Upload Video" to get started.
            </div>
          </div>
        )}

        {activeTab === 'automations' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">My Automations</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                + Create Automation
              </button>
            </div>
            <div className="p-6 text-center text-gray-500">
              No automations yet. Click "Create Automation" to start.
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Content Analytics</h2>
            <p className="text-gray-500">Analytics dashboard coming soon...</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Profile Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" className="w-full px-3 py-2 border rounded-md" defaultValue={user?.name || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full px-3 py-2 border rounded-md bg-gray-50" defaultValue={user?.email || ''} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" className="w-full px-3 py-2 border rounded-md" placeholder="+62 812 3456 7890" />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Update Profile</button>
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
              <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Subscribe with PayPal</button>
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
              <button className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700">Subscribe with PayPal</button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option>English</option>
                  <option>Bahasa Indonesia</option>
                  <option>中文</option>
                  <option>日本語</option>
                  <option>한국어</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notifications</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span>Email notifications</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span>WhatsApp notifications</span>
                  </label>
                </div>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save Settings</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
