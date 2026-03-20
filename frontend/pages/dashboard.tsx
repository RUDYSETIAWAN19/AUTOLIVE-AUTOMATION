import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  ChartBarIcon,
  CogIcon,
  VideoCameraIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useQuery } from 'react-query';
import api from '../lib/api';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  const { data: dashboardData } = useQuery('dashboard', () =>
    api.get('/users/dashboard').then(res => res.data)
  );

  const quickActions = [
    {
      title: 'FULL AUTO',
      description: 'One-click automation',
      icon: PlayIcon,
      href: '/automation/auto',
      color: 'bg-green-500',
    },
    {
      title: 'MANUAL',
      description: 'Step by step control',
      icon: CogIcon,
      href: '/automation/manual',
      color: 'bg-blue-500',
    },
    {
      title: 'AI Generator',
      description: 'Create from text',
      icon: VideoCameraIcon,
      href: '/editor',
      color: 'bg-purple-500',
    },
  ];

  return (
    <Layout>
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your channels today.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer">
                  <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Views</p>
                <p className="text-2xl font-bold">{stats?.totalViews || '0'}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Videos Today</p>
                <p className="text-2xl font-bold">{dashboardData?.todayVideos || '0'}</p>
              </div>
              <VideoCameraIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Processing</p>
                <p className="text-2xl font-bold">{dashboardData?.processing || '0'}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Engagement</p>
                <p className="text-2xl font-bold">{dashboardData?.engagement || '0'}%</p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {dashboardData?.recentVideos?.map((video, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{video.title}</p>
                  <p className="text-sm text-gray-600">{video.status}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(video.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
