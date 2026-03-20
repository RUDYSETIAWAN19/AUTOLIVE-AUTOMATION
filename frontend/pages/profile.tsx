import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  LanguageIcon,
  KeyIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { t, changeLanguage, currentLanguage, languages } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    bio: '',
    website: '',
    language: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalAutomations: 0,
    totalViews: 0,
    totalLikes: 0,
    totalSubscribers: 0,
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        bio: user.profile?.bio || '',
        website: user.profile?.website || '',
        language: user.profile?.language || 'id',
      });
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/users/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(profileForm);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (lang: string) => {
    changeLanguage(lang);
    setProfileForm(prev => ({ ...prev, language: lang }));
    try {
      await updateProfile({ language: lang });
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: UserIcon },
    { id: 'security', label: 'Security', icon: KeyIcon },
    { id: 'stats', label: 'Statistics', icon: ArrowPathIcon },
  ];

  const statCards = [
    { label: 'Total Videos', value: stats.totalVideos, icon: '🎬' },
    { label: 'Automations', value: stats.totalAutomations, icon: '🤖' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: '👁️' },
    { label: 'Total Likes', value: stats.totalLikes.toLocaleString(), icon: '❤️' },
    { label: 'Subscribers', value: stats.totalSubscribers.toLocaleString(), icon: '📺' },
  ];

  const connectedAccounts = [
    { platform: 'YouTube', connected: user?.socialAccounts?.youtube?.length > 0, icon: '📺' },
    { platform: 'TikTok', connected: user?.socialAccounts?.tiktok?.length > 0, icon: '🎵' },
    { platform: 'Instagram', connected: user?.socialAccounts?.instagram?.length > 0, icon: '📷' },
    { platform: 'Facebook', connected: user?.socialAccounts?.facebook?.length > 0, icon: '📘' },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-blue-100">{user?.email}</p>
              <div className="mt-2 flex gap-2">
                <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                  {user?.plan?.toUpperCase()}
                </span>
                <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 px-1 transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <form onSubmit={handleProfileUpdate} className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    icon={<UserIcon className="h-5 w-5" />}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={profileForm.email}
                    disabled
                    icon={<EnvelopeIcon className="h-5 w-5" />}
                  />
                  <Input
                    label="Phone Number"
                    value={profileForm.phoneNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                    icon={<DevicePhoneMobileIcon className="h-5 w-5" />}
                  />
                  <Input
                    label="Website"
                    value={profileForm.website}
                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                    icon={<GlobeAltIcon className="h-5 w-5" />}
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Button type="submit" loading={loading}>
                    Save Changes
                  </Button>
                </div>
              </form>

              {/* Language Preferences */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <LanguageIcon className="h-5 w-5" />
                  Language Preferences
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`p-3 rounded-lg border text-center transition ${
                        currentLanguage === lang.code
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Connected Accounts */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Connected Accounts</h3>
                <div className="space-y-3">
                  {connectedAccounts.map((account) => (
                    <div key={account.platform} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{account.icon}</span>
                        <span className="font-medium">{account.platform}</span>
                      </div>
                      <div>
                        {account.connected ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircleIcon className="h-5 w-5" />
                            Connected
                          </span>
                        ) : (
                          <button className="text-blue-600 hover:text-blue-700 text-sm">
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <form onSubmit={handlePasswordChange} className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                
                <div className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="mt-6">
                  <Button type="submit" loading={loading}>
                    Change Password
                  </Button>
                </div>
              </form>

              {/* Session Management */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-gray-500">Chrome on Windows • IP: 192.168.1.1</p>
                    </div>
                    <span className="text-green-600 text-sm">Active Now</span>
                  </div>
                </div>
                <button className="mt-4 text-red-600 text-sm hover:text-red-700">
                  Sign Out All Devices
                </button>
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {statCards.map((card) => (
                  <div key={card.label} className="bg-white rounded-xl shadow-md p-4 text-center">
                    <div className="text-3xl mb-2">{card.icon}</div>
                    <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{card.label}</div>
                  </div>
                ))}
              </div>

              {/* Usage Statistics */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Usage Statistics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Videos Today</span>
                      <span>{user?.stats?.videosUploaded || 0} / {user?.limits?.videosPerDay || 5}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 rounded-full h-2"
                        style={{ width: `${((user?.stats?.videosUploaded || 0) / (user?.limits?.videosPerDay || 5)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage Used</span>
                      <span>{((user?.stats?.storageUsed || 0) / (user?.limits?.storage || 1073741824) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 rounded-full h-2"
                        style={{ width: `${((user?.stats?.storageUsed || 0) / (user?.limits?.storage || 1073741824)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Upgrade Plan */}
              {user?.plan === 'free' && (
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Upgrade Your Plan</h3>
                  <p className="text-yellow-100 mb-4">
                    Get more videos, more accounts, and advanced features with Pro or Premium plan.
                  </p>
                  <button className="bg-white text-yellow-600 px-6 py-2 rounded-lg font-medium hover:bg-opacity-90">
                    View Plans →
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
