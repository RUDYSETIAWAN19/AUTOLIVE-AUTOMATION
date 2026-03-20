import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useMutation } from 'react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
  SparklesIcon,
  DocumentTextIcon,
  MusicalNoteIcon,
  PhotoIcon,
  VideoCameraIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export default function VideoEditor() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
  const [script, setScript] = useState('');
  const [generating, setGenerating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState(null);

  const generateVideo = useMutation(
    async (data) => {
      const response = await api.post('/videos/generate', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Video generated successfully!');
        setPreview(data.previewUrl);
      },
      onError: () => {
        toast.error('Failed to generate video');
      },
    }
  );

  const generateScript = async () => {
    if (!topic) {
      toast.error('Please enter a topic');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/ai/generate-script', { topic });
      setScript(response.data.script);
      toast.success('Script generated!');
    } catch (error) {
      toast.error('Failed to generate script');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!script) {
      toast.error('Please generate a script first');
      return;
    }

    setProcessing(true);
    try {
      await generateVideo.mutateAsync({
        topic,
        script,
        voice: 'en-US-Neural2-D',
        musicGenre: 'cinematic',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            AI Video Generator
          </h1>
          <p className="text-gray-600">
            Create original videos from text using AI
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Topic Input */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Topic
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., How to make money online"
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={generateScript}
                  disabled={generating}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {generating ? (
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  ) : (
                    <SparklesIcon className="h-5 w-5 mr-2" />
                  )}
                  Generate
                </button>
              </div>
            </div>

            {/* Script Editor */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <DocumentTextIcon className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="font-medium">Script</h3>
              </div>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={10}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your AI-generated script will appear here..."
              />
            </div>

            {/* Voice & Music Options */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium mb-4">Audio Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Voice
                  </label>
                  <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                    <option>English (US) - Male</option>
                    <option>English (US) - Female</option>
                    <option>Indonesian - Male</option>
                    <option>Indonesian - Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Background Music
                  </label>
                  <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                    <option>Cinematic</option>
                    <option>Upbeat</option>
                    <option>Relaxing</option>
                    <option>No Music</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateVideo}
              disabled={processing || !script}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
            >
              {processing ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                  Generating Video...
                </>
              ) : (
                <>
                  <VideoCameraIcon className="h-5 w-5 mr-2" />
                  Generate Video
                </>
              )}
            </button>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium mb-4">Preview</h3>
              {preview ? (
                <video
                  src={preview}
                  controls
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  <VideoCameraIcon className="h-12 w-12" />
                </div>
              )}
            </div>

            {/* Generated Images */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <PhotoIcon className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="font-medium">Generated Images</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"
                  >
                    <PhotoIcon className="h-6 w-6" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
