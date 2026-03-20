import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

interface VideoState {
  videos: any[];
  currentVideo: any | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

const initialState: VideoState = {
  videos: [],
  currentVideo: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 20,
};

export const fetchVideos = createAsyncThunk(
  'video/fetchVideos',
  async (params: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get('/videos', { params });
    return response.data;
  }
);

export const fetchVideoById = createAsyncThunk(
  'video/fetchVideoById',
  async (id: string) => {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  }
);

export const createVideo = createAsyncThunk(
  'video/createVideo',
  async (data: any) => {
    const response = await api.post('/videos', data);
    return response.data;
  }
);

export const updateVideo = createAsyncThunk(
  'video/updateVideo',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await api.put(`/videos/${id}`, data);
    return response.data;
  }
);

export const deleteVideo = createAsyncThunk(
  'video/deleteVideo',
  async (id: string) => {
    await api.delete(`/videos/${id}`);
    return id;
  }
);

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setCurrentVideo: (state, action: PayloadAction<any>) => {
      state.currentVideo = action.payload;
    },
    clearCurrentVideo: (state) => {
      state.currentVideo = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch videos
      .addCase(fetchVideos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos = action.payload.videos;
        state.total = action.payload.pagination.total;
        state.page = action.payload.pagination.page;
        state.limit = action.payload.pagination.limit;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch videos';
      })
      // Fetch video by id
      .addCase(fetchVideoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVideoById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentVideo = action.payload;
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch video';
      })
      // Create video
      .addCase(createVideo.fulfilled, (state, action) => {
        state.videos.unshift(action.payload.video);
        state.total += 1;
      })
      // Update video
      .addCase(updateVideo.fulfilled, (state, action) => {
        const index = state.videos.findIndex(v => v._id === action.payload.video._id);
        if (index !== -1) {
          state.videos[index] = action.payload.video;
        }
        if (state.currentVideo?._id === action.payload.video._id) {
          state.currentVideo = action.payload.video;
        }
      })
      // Delete video
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.videos = state.videos.filter(v => v._id !== action.payload);
        state.total -= 1;
        if (state.currentVideo?._id === action.payload) {
          state.currentVideo = null;
        }
      });
  },
});

export const { setCurrentVideo, clearCurrentVideo, setPage, clearError } = videoSlice.actions;
export default videoSlice.reducer;
