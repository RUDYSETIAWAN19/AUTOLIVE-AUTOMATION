import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface ApiKey {
  platform: string;
  key: string;
  permissions: string[];
  isValid?: boolean;
  lastUsed?: string;
}

export default function ApiSettings() {
  const { t } = useTranslation();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { platform: 'openai', key: '', permissions: ['read', 'write'] },
    { platform: 'youtube', key: '', permissions: ['read', 'write'] },
    { platform: 'googleTts', key: '', permissions: ['write'] },
    { platform: 'stability', key: '', permissions: ['write'] },
  ]);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await api.get('/admin/api-keys');
      if (response.data) {
        setApiKeys(prev => prev.map(apiKey => ({
          ...apiKey,
          key: response.data[apiKey.platform]?.key || '',
          isValid: response.data[apiKey.platform]?.isValid,
          lastUsed: response.data[apiKey.platform]?.lastUsed,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const handleKeyChange = (platform: string, value: string) => {
    setApiKeys(prev => prev.map(key =>
      key.platform === platform ? { ...key, key: value } : key
    ));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates: Record<string, string> = {};
      apiKeys.forEach(key => {
        if (key.key) {
          updates[key.platform] = key.key;
        }
      });

      await api.put('/admin/api-keys', updates);
      toast.success('API keys saved successfully');
      await fetchApiKeys();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (platform: string, key: string) => {
    setTesting(platform);
    try {
      const response = await api.post('/admin/api-keys/test', { platform, key });
      if (response.data.valid) {
        toast.success(`${platform} API key is valid!`);
        setApiKeys(prev => prev.map(k =>
          k.platform === platform ? { ...k, isValid: true, lastUsed: new Date().toISOString() } : k
        ));
      } else {
        toast.error(`${platform} API key is invalid`);
        setApiKeys(prev => prev.map(k =>
          k.platform === platform ? { ...k, isValid: false } : k
        ));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to test ${platform} API key`);
      setApiKeys(prev => prev.map(k =>
        k.platform === platform ? { ...k, isValid: false } : k
      ));
    } finally {
      setTesting(null);
    }
  };

  const toggleShowKey = (platform: string) => {
    setShowKeys(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  const platformInfo = {
    openai: {
      name: 'OpenAI',
      description: 'Used for AI script generation, content creation, and image generation',
      docs: 'https://platform.openai.com/api-keys',
      icon: '🤖',
    },
    youtube: {
      name: 'YouTube Data API',
      description: 'Used for video discovery, analytics, and uploads',
      docs: 'https://console.cloud.google.com/apis/credentials',
      icon: '📺',
    },
    googleTts: {
      name: 'Google Cloud Text-to-Speech',
      description: 'Used for generating voiceovers for AI-generated videos',
      docs: 'https://console.cloud.google.com/apis/credentials',
      icon: '🗣️',
    },
    stability: {
      name: 'Stability AI',
      description: 'Used for generating images and thumbnails',
      docs: 'https://platform.stability.ai/account/keys',
      icon: '🎨',
    },
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">API Settings</h1>
          <p className="text-gray-600">Configure API keys for third-party services</p>
        </div>

        {/* Security Notice */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Security Notice</h3>
              <p className="text-sm text-yellow-700 mt-1">
                API keys are encrypted before storage. Never share your API keys with anyone.
                Keys with full permissions can access your account data.
              </p>
            </div>
          </div>
        </div>

        {/* API Keys Form */}
        <div className="space-y-6">
          {apiKeys.map((apiKey) => (
            <motion.div
              key={apiKey.platform}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{platformInfo[apiKey.platform as keyof typeof platformInfo]?.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {platformInfo[apiKey.platform as keyof typeof platformInfo]?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {platformInfo[apiKey.platform as keyof typeof platformInfo]?.description}
                    </p>
                  </div>
                </div>
                {apiKey.isValid !== undefined && (
                  <div className="flex items-center gap-2">
                    {apiKey.isValid ? (
                      <>
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-600">Valid</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                        <span className="text-sm text-red-600">Invalid</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type={showKeys[apiKey.platform] ? 'text' : 'password'}
                    value={apiKey.key}
                    onChange={(e) => handleKeyChange(apiKey.platform, e.target.value)}
                    placeholder={`Enter ${platformInfo[apiKey.platform as keyof typeof platformInfo]?.name} API Key`}
                    icon={<KeyIcon className="h-5 w-5" />}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey(apiKey.platform)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKeys[apiKey.platform] ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {apiKey.lastUsed && (
                  <p className="text-xs text-gray-500">
                    Last used: {new Date(apiKey.lastUsed).toLocaleString()}
                  </p>
                )}

                <div className="flex gap-3">
                  <a
                    href={platformInfo[apiKey.platform as keyof typeof platformInfo]?.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Get API Key →
                  </a>
                  {apiKey.key && (
                    <button
                      onClick={() => handleTest(apiKey.platform, apiKey.key)}
                      disabled={testing === apiKey.platform}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      {testing === apiKey.platform ? 'Testing...' : 'Test Connection'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSave}
            loading={loading}
            size="lg"
            icon={<KeyIcon className="h-5 w-5" />}
          >
            Save All API Keys
          </Button>
        </div>

        {/* Documentation Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? Check our{' '}
            <a href="/docs/api" className="text-blue-600 hover:text-blue-700">
              API Documentation
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
