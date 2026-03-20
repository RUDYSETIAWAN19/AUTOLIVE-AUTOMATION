import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Switch } from '@headlessui/react';
import Button from '../ui/Button';
import Select from '../ui/Select';

interface AutoModeConfigProps {
  onStart: (config: any) => void;
}

const AutoModeConfig: React.FC<AutoModeConfigProps> = ({ onStart }) => {
  const [config, setConfig] = useState({
    platform: 'youtube',
    theme: 'gaming',
    duration: 'short',
    processing: {
      cropToVertical: true,
      addSubtitles: true,
      addMusic: true,
      generateThumbnail: true,
    },
    upload: {
      platforms: ['youtube'],
      schedule: 'immediate',
    },
  });

  const platforms = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'rednote', label: 'RedNote' },
  ];

  const themes = [
    { value: 'gaming', label: 'Gaming' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'education', label: 'Education' },
    { value: 'music', label: 'Music' },
    { value: 'vlog', label: 'Vlog' },
    { value: 'sports', label: 'Sports' },
  ];

  const durations = [
    { value: 'short', label: 'Short (< 60s)' },
    { value: 'medium', label: 'Medium (60-180s)' },
    { value: 'long', label: 'Long (> 180s)' },
  ];

  const uploadPlatforms = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Source Platform"
          options={platforms}
          value={config.platform}
          onChange={(e) => setConfig({ ...config, platform: e.target.value })}
        />

        <Select
          label="Content Theme"
          options={themes}
          value={config.theme}
          onChange={(e) => setConfig({ ...config, theme: e.target.value })}
        />

        <Select
          label="Video Duration"
          options={durations}
          value={config.duration}
          onChange={(e) => setConfig({ ...config, duration: e.target.value })}
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="font-medium mb-4">Processing Options</h3>
        <div className="space-y-3">
          {Object.entries(config.processing).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <Switch
                checked={value}
                onChange={(checked) =>
                  setConfig({
                    ...config,
                    processing: { ...config.processing, [key]: checked },
                  })
                }
                className={`${
                  value ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    value ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-medium mb-4">Upload Options</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload to Platforms
            </label>
            <div className="flex flex-wrap gap-3">
              {uploadPlatforms.map((platform) => (
                <label key={platform.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.upload.platforms.includes(platform.value)}
                    onChange={(e) => {
                      const newPlatforms = e.target.checked
                        ? [...config.upload.platforms, platform.value]
                        : config.upload.platforms.filter((p) => p !== platform.value);
                      setConfig({
                        ...config,
                        upload: { ...config.upload, platforms: newPlatforms },
                      });
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{platform.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Select
            label="Schedule"
            options={[
              { value: 'immediate', label: 'Upload Immediately' },
              { value: 'schedule', label: 'Schedule for Later' },
              { value: 'auto', label: 'Auto Schedule (AI Recommended)' },
            ]}
            value={config.upload.schedule}
            onChange={(e) =>
              setConfig({
                ...config,
                upload: { ...config.upload, schedule: e.target.value },
              })
            }
          />
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={() => onStart(config)} fullWidth size="lg">
          Start Auto Mode
        </Button>
      </div>
    </div>
  );
};

export default AutoModeConfig;
