import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

interface AutomationState {
  automations: any[];
  currentAutomation: any | null;
  isLoading: boolean;
  error: string | null;
  total: number;
}

const initialState: AutomationState = {
  automations: [],
  currentAutomation: null,
  isLoading: false,
  error: null,
  total: 0,
};

export const fetchAutomations = createAsyncThunk(
  'automation/fetchAutomations',
  async (params?: { page?: number; status?: string }) => {
    const response = await api.get('/automation', { params });
    return response.data;
  }
);

export const fetchAutomationById = createAsyncThunk(
  'automation/fetchAutomationById',
  async (id: string) => {
    const response = await api.get(`/automation/${id}`);
    return response.data;
  }
);

export const createAutomation = createAsyncThunk(
  'automation/createAutomation',
  async (data: any) => {
    const response = await api.post('/automation', data);
    return response.data;
  }
);

export const updateAutomation = createAsyncThunk(
  'automation/updateAutomation',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await api.put(`/automation/${id}`, data);
    return response.data;
  }
);

export const deleteAutomation = createAsyncThunk(
  'automation/deleteAutomation',
  async (id: string) => {
    await api.delete(`/automation/${id}`);
    return id;
  }
);

export const startAutomation = createAsyncThunk(
  'automation/startAutomation',
  async (id: string) => {
    const response = await api.post(`/automation/${id}/start`);
    return response.data;
  }
);

export const pauseAutomation = createAsyncThunk(
  'automation/pauseAutomation',
  async (id: string) => {
    const response = await api.post(`/automation/${id}/pause`);
    return response.data;
  }
);

const automationSlice = createSlice({
  name: 'automation',
  initialState,
  reducers: {
    setCurrentAutomation: (state, action: PayloadAction<any>) => {
      state.currentAutomation = action.payload;
    },
    clearCurrentAutomation: (state) => {
      state.currentAutomation = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch automations
      .addCase(fetchAutomations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAutomations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.automations = action.payload.automations;
        state.total = action.payload.pagination.total;
      })
      .addCase(fetchAutomations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch automations';
      })
      // Fetch automation by id
      .addCase(fetchAutomationById.fulfilled, (state, action) => {
        state.currentAutomation = action.payload;
      })
      // Create automation
      .addCase(createAutomation.fulfilled, (state, action) => {
        state.automations.unshift(action.payload.automation);
        state.total += 1;
      })
      // Update automation
      .addCase(updateAutomation.fulfilled, (state, action) => {
        const index = state.automations.findIndex(a => a._id === action.payload.automation._id);
        if (index !== -1) {
          state.automations[index] = action.payload.automation;
        }
        if (state.currentAutomation?._id === action.payload.automation._id) {
          state.currentAutomation = action.payload.automation;
        }
      })
      // Delete automation
      .addCase(deleteAutomation.fulfilled, (state, action) => {
        state.automations = state.automations.filter(a => a._id !== action.payload);
        state.total -= 1;
        if (state.currentAutomation?._id === action.payload) {
          state.currentAutomation = null;
        }
      })
      // Start automation
      .addCase(startAutomation.fulfilled, (state, action) => {
        if (state.currentAutomation) {
          state.currentAutomation.status = 'active';
        }
        const index = state.automations.findIndex(a => a._id === state.currentAutomation?._id);
        if (index !== -1) {
          state.automations[index].status = 'active';
        }
      })
      // Pause automation
      .addCase(pauseAutomation.fulfilled, (state, action) => {
        if (state.currentAutomation) {
          state.currentAutomation.status = 'paused';
        }
        const index = state.automations.findIndex(a => a._id === state.currentAutomation?._id);
        if (index !== -1) {
          state.automations[index].status = 'paused';
        }
      });
  },
});

export const { setCurrentAutomation, clearCurrentAutomation, clearError } = automationSlice.actions;
export default automationSlice.reducer;
