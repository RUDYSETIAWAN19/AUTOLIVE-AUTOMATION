import React, { useState, useRef } from 'react';
import Layout from '../../components/layout/Layout';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  PaintBrushIcon,
  PhotoIcon,
  SwatchIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface BrandingSettings {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  customCss: string;
  favicon: string;
  appName: string;
  appTagline: string;
}

export default function BrandingSettings() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<BrandingSettings>({
    logo: '',
    primaryColor: '#0ea5e9',
    secondaryColor: '#6366f1',
    accentColor: '#f59e0b',
    fontFamily: 'Inter',
    customCss: '',
    favicon: '',
    appName: 'AutoLive',
    appTagline: 'Automate Your Viral Content',
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleColorChange = (field: keyof BrandingSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await api.post('/admin/branding/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSettings(prev => ({ ...prev, logo: response.data.url }));
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleFaviconUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('favicon', file);

    try {
      const response = await api.post('/admin/branding/favicon', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSettings(prev => ({ ...prev, favicon: response.data.url }));
      toast.success('Favicon uploaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload favicon');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/admin/settings/branding', settings);
      toast.success('Branding settings saved successfully');
      // Apply changes to document
      document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save branding settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      logo: '',
      primaryColor: '#0ea5e9',
      secondaryColor: '#6366f1',
      accentColor: '#f59e0b',
      fontFamily: 'Inter',
      customCss: '',
      favicon: '',
      appName: 'AutoLive',
      appTagline: 'Automate Your Viral Content',
    });
    toast.success('Settings reset to default');
  };

  const colorPresets = [
    { name: 'Blue', primary: '#0ea5e9', secondary: '#6366f1', accent: '#f59e0b' },
    { name: 'Purple', primary: '#8b5cf6', secondary: '#a855f7', accent: '#ec489a' },
    { name: 'Green', primary: '#10b981', secondary: '#34d399', accent: '#fbbf24' },
    { name: 'Red', primary: '#ef4444', secondary: '#f97316', accent: '#eab308' },
    { name: 'Dark', primary: '#1f2937', secondary: '#374151', accent: '#3b82f6' },
  ];

  const fonts = [
    'Inter',
    'Poppins',
    'Roboto',
    'Open Sans',
    'Montserrat',
    'Playfair Display',
  ];

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Branding Settings</h1>
          <p className="text-gray-600">Customize your app's appearance and branding</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Settings Form */}
          <div className="space-y-6">
            {/* Logo & Favicon */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <PhotoIcon className="h-5 w-5" />
                Logo & Icons
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    App Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {settings.logo && (
                      <img src={settings.logo} alt="Logo" className="h-12 w-auto" />
                    )}
                    <input
                      type="file"
                      ref={logoInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload(file);
                      }}
                    />
                    <Button
                      variant="secondary"
                      onClick={() => logoInputRef.current?.click()}
                      loading={uploading}
                      icon={<CloudArrowUpIcon className="h-4 w-4" />}
                    >
                      Upload Logo
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended size: 200x200px, PNG or SVG format
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Favicon
                  </label>
                  <div className="flex items-center gap-4">
                    {settings.favicon && (
                      <img src={settings.favicon} alt="Favicon" className="h-8 w-8" />
                    )}
                    <input
                      type="file"
                      ref={faviconInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFaviconUpload(file);
                      }}
                    />
                    <Button
                      variant="secondary"
                      onClick={() => faviconInputRef.current?.click()}
                      loading={uploading}
                    >
                      Upload Favicon
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <SwatchIcon className="h-5 w-5" />
                Color Scheme
              </h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="h-10 w-10 rounded border border-gray-300"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="h-10 w-10 rounded border border-gray-300"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="h-10 w-10 rounded border border-gray-300"
                    />
                    <Input
                      value={settings.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Presets
                </label>
                <div className="flex gap-3">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setSettings(prev => ({
                          ...prev,
                          primaryColor: preset.primary,
                          secondaryColor: preset.secondary,
                          accentColor: preset.accent,
                        }));
                      }}
                      className="group relative"
                    >
                      <div
                        className="w-8 h-8 rounded-full border-2 border-gray-200"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold mb-4">Typography</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Family
                </label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => setSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fonts.map((font) => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom CSS */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold mb-4">Custom CSS</h3>
              <textarea
                value={settings.customCss}
                onChange={(e) => setSettings(prev => ({ ...prev, customCss: e.target.value }))}
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/* Add your custom CSS here */"
              />
              <p className="text-xs text-gray-500 mt-2">
                Add custom CSS to override default styles
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleSave} loading={loading} icon={<CheckIcon className="h-5 w-5" />}>
                Save Changes
              </Button>
              <Button variant="secondary" onClick={handleReset} icon={<ArrowPathIcon className="h-5 w-5" />}>
                Reset to Default
              </Button>
              <Button variant="secondary" onClick={() => setPreview(!preview)}>
                {preview ? 'Hide Preview' : 'Show Preview'}
              </Button>
            </div>
          </div>

          {/* Preview Section */}
          {preview && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                <h3 className="font-semibold mb-4">Live Preview</h3>
                
                {/* Preview Card */}
                <div className="border rounded-lg overflow-hidden">
                  <div
                    className="p-4"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {settings.logo ? (
                          <img src={settings.logo} alt="Logo" className="h-8 w-auto" />
                        ) : (
                          <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-lg">🎬</span>
                          </div>
                        )}
                        <span className="text-white font-bold">{settings.appName}</span>
                      </div>
                      <button
                        className="px-3 py-1 rounded-lg text-sm"
                        style={{
                          backgroundColor: settings.secondaryColor,
                          color: 'white',
                        }}
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h2
                      className="text-2xl font-bold mb-2"
                      style={{ color: settings.primaryColor }}
                    >
                      {settings.appTagline}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      This is a preview of your brand colors and typography settings.
                    </p>
                    <button
                      className="px-4 py-2 rounded-lg text-white"
                      style={{
                        backgroundColor: settings.accentColor,
                      }}
                    >
                      Get Started
                    </button>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div
                    className="h-12 rounded-lg flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    Primary
                  </div>
                  <div
                    className="h-12 rounded-lg flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: settings.secondaryColor }}
                  >
                    Secondary
                  </div>
                  <div
                    className="h-12 rounded-lg flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: settings.accentColor }}
                  >
                    Accent
                  </div>
                </div>

                {/* Font Preview */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p style={{ fontFamily: settings.fontFamily }} className="text-center">
                    The quick brown fox jumps over the lazy dog.
                    <br />
                    0123456789
                    <br />
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
