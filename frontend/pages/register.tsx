import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/auth/LanguageSelector';
import SocialLogin from '../components/auth/SocialLogin';
import api from '../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    youtubeApiKey: '',
    facebookApiKey: '',
    instagramApiKey: '',
    tiktokApiKey: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socialUser, setSocialUser] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialLogin = async (provider: string) => {
    setLoading(true);
    try {
      // Simulate social login
      setSocialUser({
        name: `User from ${provider}`,
        email: `user@${provider}.com`,
        provider
      });
      setStep(2);
    } catch (err: any) {
      setError(`Failed to login with ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const userData = {
        ...formData,
        socialAccounts: socialUser ? { provider: socialUser.provider, email: socialUser.email } : {}
      };
      
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      router.push('/dashboard/user');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Save API keys
      await api.post('/user/api-keys', {
        youtube: formData.youtubeApiKey,
        facebook: formData.facebookApiKey,
        instagram: formData.instagramApiKey,
        tiktok: formData.tiktokApiKey,
      });
      setStep(3);
    } catch (err: any) {
      setError('Failed to save API keys');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex justify-end p-4">
        <LanguageSelector />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">AutoLive</h1>
            <p className="text-gray-600 mt-2">Create your account</p>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            {/* Step Indicator */}
            <div className="flex mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 text-center">
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {s}
                  </div>
                  <p className="text-xs mt-1 text-gray-500">
                    {s === 1 ? 'Account' : s === 2 ? 'API Keys' : 'Complete'}
                  </p>
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Account Info */}
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Continue
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                  </div>
                </div>

                <SocialLogin onSocialLogin={handleSocialLogin} loading={loading} />

                <p className="mt-6 text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-600 hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            )}

            {/* Step 2: API Keys */}
            {step === 2 && (
              <form onSubmit={handleApiSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube API Key</label>
                  <input
                    type="text"
                    name="youtubeApiKey"
                    value={formData.youtubeApiKey}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="AIza..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Required for YouTube uploads</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facebook API Key</label>
                  <input
                    type="text"
                    name="facebookApiKey"
                    value={formData.facebookApiKey}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram API Key</label>
                  <input
                    type="text"
                    name="instagramApiKey"
                    value={formData.instagramApiKey}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">TikTok API Key</label>
                  <input
                    type="text"
                    name="tiktokApiKey"
                    value={formData.tiktokApiKey}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Complete Registration'}
                </button>
              </form>
            )}

            {/* Step 3: Complete */}
            {step === 3 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Registration Complete!</h2>
                <p className="text-gray-600 mb-6">Your account has been created successfully.</p>
                <button
                  onClick={() => router.push('/dashboard/user')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
