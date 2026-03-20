import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  VideoCameraIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UserIcon,
  DocumentTextIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      name: t('dashboard'),
      href: '/dashboard',
      icon: HomeIcon,
    },
    {
      name: t('automation'),
      href: '/automation',
      icon: RocketLaunchIcon,
      subItems: [
        { name: t('fullAuto'), href: '/automation/auto' },
        { name: t('manual'), href: '/automation/manual' },
      ],
    },
    {
      name: t('videoEditor'),
      href: '/editor',
      icon: VideoCameraIcon,
    },
    {
      name: t('reports'),
      href: '/reports',
      icon: ChartBarIcon,
    },
    {
      name: t('profile'),
      href: '/profile',
      icon: UserIcon,
    },
  ];

  if (user?.role === 'admin') {
    menuItems.push({
      name: t('admin'),
      href: '/admin',
      icon: ShieldCheckIcon,
      subItems: [
        { name: t('users'), href: '/admin/users' },
        { name: t('apiSettings'), href: '/admin/api-settings' },
        { name: t('branding'), href: '/admin/branding' },
      ],
    });
  }

  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold">AutoLive</h1>
        <p className="text-sm text-gray-400 mt-1">Automation Platform</p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => (
          <div key={item.href} className="mb-2">
            <Link
              href={item.href}
              className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition ${
                isActive(item.href) ? 'bg-gray-800 text-white' : ''
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.name}</span>
            </Link>

            {item.subItems && isActive(item.href) && (
              <div className="ml-8 mt-1">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={`block px-4 py-2 text-sm text-gray-400 hover:text-white transition ${
                      router.pathname === subItem.href ? 'text-white' : ''
                    }`}
                  >
                    {subItem.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
