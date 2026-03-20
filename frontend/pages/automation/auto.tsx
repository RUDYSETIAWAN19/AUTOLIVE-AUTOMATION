import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import AutoModeConfig from '../../components/automation/AutoModeConfig';
import { useAutomation } from '../../hooks/useAutomation';
import toast from 'react-hot-toast';
import {
  RocketLaunchIcon,
  SparklesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function AutoMode() {
  const { t } = useTranslation();
  const router = useRouter();
  const { createAutomation } = useAutomation();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const steps = [
    { id: 1, title: 'Configure', icon: SparklesIcon },
    { id: 2, title: 'Review', icon: CheckCircleIcon },
    { id: 3, title: 'Running', icon: RocketLaunchIcon },
  ];

  const handleConfigSubmit = (configData: any) => {
    setConfig(configData);
    setStep(2);
  };

  const handleStart = async () => {
    if (!config) return;

    setCreating(true);
    try {
      const automation = {
        name: `${config.theme} Automation - ${new Date().toLocaleDateString()}`,
        mode: 'auto',
        source: {
          platform: config.platform,
          keywords: [config.theme],
          themes: [config.theme],
          duration: {
            min: config.duration === 'short' ? 15 : config.duration === 'medium' ? 60 : 180,
            max: config.duration === 'short' ? 60 : config.duration === 'medium' ? 180 : 600,
          },
        },
        processing: config.processing,
        upload: config.upload,
        ai: {
          generateTitle: true,
          generateDescription: true,
          generateTags: true,
        },
      };

      await createAutomation.mutateAsync(automation);
      setStep(3);
      
      // After 2 seconds, redirect to automations list
      setTimeout(() => {
        router.push('/automation');
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create automation');
      setStep(1);
    } finally {
      setCreating(false);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4">
            <RocketLaunchIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Full Auto Mode</h1>
          <p className="text-gray-600 mt-2">
            One-click automation. Let AI handle everything from discovery to upload.
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      step >= s.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step > s.id ? (
                      <CheckCircleIcon className="h-6 w-6" />
                    ) : (
                      <s.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 ${step >= s.id ? 'text-blue-600' : 'text-gray-400'}`}>
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step > s.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8"
        >
          {step === 1 && (
            <AutoModeConfig onStart={handleConfigSubmit} />
          )}

          {step === 2 && config && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Review Your Configuration</h2>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Source Settings</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500">Platform:</span>
                    <span className="font-medium capitalize">{config.platform}</span>
                    <span className="text-gray-500">Theme:</span>
                    <span className="font-medium capitalize">{config.theme}</span>
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium capitalize">{config.duration}</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Processing Options</h3>
                  <div className="space-y-1 text-sm">
                    {Object.entries(config.processing).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-500 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className={value ? 'text-green-600' : 'text-gray-400'}>
                          {value ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Upload Settings</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Platforms:</span>
                      <span className="font-medium">
                        {config.upload.platforms.join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Schedule:</span>
                      <span className="font-medium capitalize">
                        {config.upload.schedule}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleStart}
                  disabled={creating}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      Creating Automation...
                    </>
                  ) : (
                    <>
                      <RocketLaunchIcon className="h-5 w-5" />
                      Start Automation
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6"
              >
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Automation Created!</h2>
              <p className="text-gray-600 mb-6">
                Your automation is now running. You'll be redirected to the automations list.
              </p>
              <div className="flex justify-center">
                <ArrowPathIcon className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            </div>
          )}
        </motion.div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Pro Tip:</strong> Full Auto mode uses AI to discover viral content,
            automatically edit videos with subtitles and music, and upload them to your
            connected platforms. You can monitor progress in the automation dashboard.
          </p>
        </div>
      </div>
    </Layout>
  );
}
