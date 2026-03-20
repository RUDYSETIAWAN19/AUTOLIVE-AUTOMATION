import { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const useVideoEditor = () => {
  const [progress, setProgress] = useState(0);

  const getVideo = (id: string) => {
    return useQuery(
      ['video', id],
      () => api.get(`/videos/${id}`).then(res => res.data),
      {
        enabled: !!id,
      }
    );
  };

  const uploadVideo = useMutation(
    (formData: FormData) => api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percent = (progressEvent.loaded * 100) / (progressEvent.total || 1);
        setProgress(percent);
      },
    }),
    {
      onSuccess: () => {
        toast.success('Video uploaded successfully');
        setProgress(0);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to upload video');
        setProgress(0);
      },
    }
  );

  const processVideo = useMutation(
    ({ id, options }: { id: string; options: any }) => api.post(`/videos/${id}/process`, options),
    {
      onSuccess: () => {
        toast.success('Video processing started');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to process video');
      },
    }
  );

  const generateThumbnail = useMutation(
    ({ id, timestamp }: { id: string; timestamp?: string }) =>
      api.post(`/videos/${id}/thumbnail`, { timestamp }),
    {
      onSuccess: () => {
        toast.success('Thumbnail generated');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to generate thumbnail');
      },
    }
  );

  const addSubtitle = useMutation(
    ({ id, language, content }: { id: string; language: string; content: string }) =>
      api.post(`/videos/${id}/subtitle`, { language, content }),
    {
      onSuccess: () => {
        toast.success('Subtitle added');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to add subtitle');
      },
    }
  );

  const generateAIContent = useMutation(
    ({ id, topic }: { id: string; topic: string }) =>
      api.post(`/videos/${id}/ai-content`, { topic }),
    {
      onSuccess: () => {
        toast.success('AI content generated');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to generate AI content');
      },
    }
  );

  const uploadToPlatform = useMutation(
    ({ id, platform, accountId, scheduledFor }: { id: string; platform: string; accountId?: string; scheduledFor?: string }) =>
      api.post(`/upload/platform/${id}`, { platform, accountId, scheduledFor }),
    {
      onSuccess: () => {
        toast.success('Video queued for upload');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to queue upload');
      },
    }
  );

  return {
    progress,
    getVideo,
    uploadVideo,
    processVideo,
    generateThumbnail,
    addSubtitle,
    generateAIContent,
    uploadToPlatform,
  };
};
