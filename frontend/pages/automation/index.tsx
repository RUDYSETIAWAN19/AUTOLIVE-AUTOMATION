import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  RocketLaunchIcon,
  Cog6ToothIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useAutomation } from '../../hooks/useAutomation';
import { formatDistanceToNow } from 'date-fns';

export default function AutomationList() {
  const { t } = useTranslation();
  const { getAutomations, startAutomation, pauseAutomation, deleteAutomation } = useAutomation();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, refetch } = getAutomations({ page, status: statusFilter });

  const handleStart = async (id: string) => {
    await startAutomation.mutateAsync(id);
    refetch();
  };

  const handlePause = async (id: string) => {
    await pauseAutomation.mutateAsync(id);
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this automation?')) {
      await deleteAutomation.mutateAsync(id);
      refetch();
    }
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
  };

  if (isLoading) {
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
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Automations</h1>
            <p className="text-gray-600">Manage your content automation workflows</p>
          </div>
          <Link href="/automation/auto">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              <PlusIcon className="h-5 w-5" />
              New Automation
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-lg transition ${
                statusFilter === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-lg transition ${
                statusFilter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('paused')}
              className={`px-4 py-2 rounded-lg transition ${
                statusFilter === 'paused' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Paused
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-lg transition ${
                statusFilter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Automation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.automations?.map((automation: any) => (
            <motion.div
              key={automation._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <RocketLaunchIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{automation.name || 'Untitled Automation'}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[automation.status as keyof typeof statusColors]}`}>
                        {automation.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => automation.status === 'active' ? handlePause(automation._id) : handleStart(automation._id)}
                      className="p-1 hover:bg-gray-100 rounded transition"
                    >
                      {automation.status === 'active' ? (
                        <PauseIcon className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <PlayIcon className="h-5 w-5 text-green-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(automation._id)}
                      className="p-1 hover:bg-gray-100 rounded transition"
                    >
                      <TrashIcon className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mode:</span>
                    <span className="font-medium capitalize">{automation.mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Source:</span>
                    <span className="font-medium capitalize">{automation.source?.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Videos:</span>
                    <span className="font-medium">{automation.stats?.videosProcessed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(automation.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <ArrowPathIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {automation.stats?.successRate || 0}% success
                      </span>
                    </div>
                    <Link href={`/automation/${automation._id}`}>
                      <button className="text-sm text-blue-600 hover:text-blue-700">
                        View Details →
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {data?.automations?.length === 0 && (
          <div className="text-center py-12">
            <RocketLaunchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No automations yet</h3>
            <p className="text-gray-500 mb-4">Create your first automation to start automating your content</p>
            <Link href="/automation/auto">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Create Automation
              </button>
            </Link>
          </div>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {data.pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
              disabled={page === data.pagination.pages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
