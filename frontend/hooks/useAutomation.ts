import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const useAutomation = () => {
  const queryClient = useQueryClient();

  const getAutomations = (params?: any) => {
    return useQuery(
      ['automations', params],
      () => api.get('/automation', { params }).then(res => res.data),
      {
        staleTime: 30000,
      }
    );
  };

  const getAutomationById = (id: string) => {
    return useQuery(
      ['automation', id],
      () => api.get(`/automation/${id}`).then(res => res.data),
      {
        enabled: !!id,
      }
    );
  };

  const createAutomation = useMutation(
    (data: any) => api.post('/automation', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['automations']);
        toast.success('Automation created successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create automation');
      },
    }
  );

  const updateAutomation = useMutation(
    ({ id, data }: { id: string; data: any }) => api.put(`/automation/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['automations']);
        toast.success('Automation updated successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update automation');
      },
    }
  );

  const deleteAutomation = useMutation(
    (id: string) => api.delete(`/automation/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['automations']);
        toast.success('Automation deleted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete automation');
      },
    }
  );

  const startAutomation = useMutation(
    (id: string) => api.post(`/automation/${id}/start`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['automations']);
        toast.success('Automation started');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to start automation');
      },
    }
  );

  const pauseAutomation = useMutation(
    (id: string) => api.post(`/automation/${id}/pause`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['automations']);
        toast.success('Automation paused');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to pause automation');
      },
    }
  );

  return {
    getAutomations,
    getAutomationById,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    startAutomation,
    pauseAutomation,
  };
};
