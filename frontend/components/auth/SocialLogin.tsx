import React from 'react';
import { useTranslation } from 'react-i18next';

interface SocialLoginProps {
  onSocialLogin: (provider: string) => void;
  loading?: boolean;
}

export default function SocialLogin({ onSocialLogin, loading }: SocialLoginProps) {
  const { t } = useTranslation();

  const providers = [
    { name: 'google', label: t('login.google'), icon: 'G', color: 'bg-red-500 hover:bg-red-600' },
    { name: 'youtube', label: t('login.youtube'), icon: 'YT', color: 'bg-red-600 hover:bg-red-700' },
    { name: 'facebook', label: t('login.facebook'), icon: 'F', color: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'instagram', label: t('login.instagram'), icon: 'IG', color: 'bg-pink-600 hover:bg-pink-700' },
    { name: 'tiktok', label: t('login.tiktok'), icon: 'TT', color: 'bg-black hover:bg-gray-900' },
  ];

  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <button
          key={provider.name}
          onClick={() => onSocialLogin(provider.name)}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 ${provider.color} text-white py-2 rounded-lg transition disabled:opacity-50`}
        >
          <span className="font-bold w-8 h-8 flex items-center justify-center bg-white bg-opacity-20 rounded-full">
            {provider.icon}
          </span>
          {provider.label}
        </button>
      ))}
    </div>
  );
}
