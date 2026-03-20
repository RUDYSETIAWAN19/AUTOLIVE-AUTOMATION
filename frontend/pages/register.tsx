import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

const RegisterPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
      });
      router.push('/verify-email');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AutoLive</h1>
          <p className="text-gray-600 mt-2">{t('register.welcome')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('register.name')}
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            icon={<UserIcon className="h-5 w-5" />}
            required
          />

          <Input
            label={t('register.email')}
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            icon={<EnvelopeIcon className="h-5 w-5" />}
            required
          />

          <Input
            label={t('register.phone')}
            name="phoneNumber"
            type="tel"
            placeholder="+62 812 3456 7890"
            value={formData.phoneNumber}
            onChange={handleChange}
            icon={<DevicePhoneMobileIcon className="h-5 w-5" />}
            required
          />

          <Input
            label={t('register.password')}
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            icon={<LockClosedIcon className="h-5 w-5" />}
            required
          />

          <Input
            label={t('register.confirmPassword')}
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            icon={<LockClosedIcon className="h-5 w-5" />}
            required
          />

          <Button type="submit" loading={loading} fullWidth size="lg">
            {t('register.button')}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          {t('register.haveAccount')}{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            {t('register.login')}
          </Link>
        </p>

        <p className="text-center mt-4 text-xs text-gray-500">
          By registering, you agree to our{' '}
          <Link href="/terms" className="text-blue-600 hover:text-blue-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
