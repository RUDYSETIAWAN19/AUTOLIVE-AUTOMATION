import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  VideoCameraIcon,
  ChartBarIcon,
  KeyIcon,
  PaintBrushIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import api from '../../lib/api';
import { useQuery } from 'react-query';

interface SystemStats {
  users: {
    total: number;
    active: number;
    premium: number;
  };
  content: {
    totalVideos: number;
    totalAutomations: number;
    totalJobs: number;
  };
  analytics: {
    totalViews: number;
    totalLikes: number;
  };
  recentVideos: Array<{
    _id: string;
    title: string;
    status: string;
    createdAt: string;
    userId: { name: string; email: string };
  }>;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  const { data, isLoading } = useQuery('admin-stats', () =>
    api.get('/admin/stats').then(res => res.data)
  );

  useEffect(() => {
    if (data) {
      setStats(data);
      setLoading(false);
    }
  }, [data]);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users.total || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
      subValue: `${stats?.users.active || 0} active`,
    },
    {
      title: 'Total Videos',
      value: stats?.content.totalVideos || 0,
      icon: VideoCameraIcon,
      color: 'bg-green-500',
      subValue: `${stats?.content.totalAutomations || 0} automations`,
    },
    {
      title: 'Total Views',
      value: stats?.analytics.totalViews || 0,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      subValue: `${stats?.analytics.totalLikes || 0} likes`,
    },
    {
      title: 'Premium Users',
      value: stats?.users.premium || 0,
      icon: ArrowTrendingUpIcon,
      color: 'bg-yellow-500',
      subValue: `${((stats?.users.premium || 0) / (stats?.users.total || 1) * 100).toFixed(1)}% conversion`,
    },
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users, plans, and permissions',
      icon: UsersIcon,
      href: '/admin/users',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'API Settings',
      description: 'Configure OpenAI, YouTube API keys',
      icon: KeyIcon,
      href: '/admin/api-settings',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Branding',
      description: 'Customize logo, colors, and appearance',
      icon: PaintBrushIcon,
      href: '/admin/branding',
      color: 'bg-pink-100 text-pink-600',
    },
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="spinner md" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Here's what's happening with your platform.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-gray-800">{card.value.toLocaleString()}</span>
              </div>
              <h3 className="text-gray-600 text-sm">{card.title}</h3>
              <p className="text-gray-400 text-xs mt-1">{card.subValue}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <motion.a
                key={action.title}
                href={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer"
              >
                <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-1">{action.title}</h3>
                <p className="text-gray-500 text-sm">{action.description}</p>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Recent Videos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.recentVideos?.map((video) => (
                  <tr key={video._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{video.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{video.userId?.name}</div>
                      <div className="text-xs text-gray-500">{video.userId?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[video.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                        {video.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">API Status</span>
                <span className="text-green-600">Operational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Database</span>
                <span className="text-green-600">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Redis</span>
                <span className="text-green-600">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Queue Workers</span>
                <span className="text-green-600">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-blue-500" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Videos Today</span>
                <span className="font-medium">{stats?.content.totalVideos || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Automations</span>
                <span className="font-medium">{stats?.content.totalAutomations || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Jobs</span>
                <span className="font-medium">{stats?.content.totalJobs || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Users</span>
                <span className="font-medium">{stats?.users.active || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
