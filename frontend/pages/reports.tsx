import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { useQuery } from 'react-query';
import api from '../lib/api';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function ReportsPage() {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState('7d');
  const [platform, setPlatform] = useState('all');

  const { data, isLoading } = useQuery(
    ['analytics', dateRange, platform],
    () => api.get('/analytics', { params: { range: dateRange, platform } }).then(res => res.data)
  );

  const dateRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '12m', label: 'Last 12 Months' },
  ];

  const platforms = [
    { value: 'all', label: 'All Platforms' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="spinner md" />
        </div>
      </Layout>
    );
  }

  const summaryCards = [
    {
      title: 'Total Views',
      value: data?.summary?.totalViews?.toLocaleString() || '0',
      change: '+12.5%',
      icon: EyeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Likes',
      value: data?.summary?.totalLikes?.toLocaleString() || '0',
      change: '+8.2%',
      icon: HeartIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Comments',
      value: data?.summary?.totalComments?.toLocaleString() || '0',
      change: '+15.3%',
      icon: ChatBubbleLeftIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Shares',
      value: data?.summary?.totalShares?.toLocaleString() || '0',
      change: '+23.1%',
      icon: ShareIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Reports</h1>
            <p className="text-gray-600">Track your content performance and engagement metrics</p>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {platforms.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <DocumentArrowDownIcon className="h-5 w-5" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <span className="text-sm text-green-600">{card.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              <p className="text-gray-600 text-sm mt-1">{card.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Views Trend Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            Views Trend
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data?.trends || []}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#3b82f6"
                fill="url(#viewsGradient)"
                name="Views"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Engagement Metrics</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.engagement || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="likes" stroke="#ef4444" name="Likes" />
                <Line type="monotone" dataKey="comments" stroke="#10b981" name="Comments" />
                <Line type="monotone" dataKey="shares" stroke="#f59e0b" name="Shares" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Platform Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.platformDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(data?.platformDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Videos */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Top Performing Videos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Video Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Likes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.topVideos?.map((video: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{video.title}</div>
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {video.platform}
                      </span>
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {video.views.toLocaleString()}
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {video.likes.toLocaleString()}
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 rounded-full h-2"
                            style={{ width: `${video.engagementRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{video.engagementRate}%</span>
                      </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-6 w-6" />
            AI Recommendations
          </h2>
          <p className="text-purple-100 mb-4">
            Based on your analytics, here are some recommendations to boost your engagement:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="font-medium">Best Upload Time</p>
              <p className="text-sm text-purple-100">Wednesday at 3:00 PM (GMT+7)</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="font-medium">Trending Topic</p>
              <p className="text-sm text-purple-100">AI Tools for Content Creators</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="font-medium">Optimal Video Length</p>
              <p className="text-sm text-purple-100">45-60 seconds for highest engagement</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="font-medium">Hashtag Strategy</p>
              <p className="text-sm text-purple-100">Use 3-5 targeted hashtags per post</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
