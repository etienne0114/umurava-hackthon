import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';
import { ScreeningResult, ScreeningSession } from '@/types';

interface ScreeningState {
  results: ScreeningResult[];
  session: ScreeningSession | null;
  loading: boolean;
  error: string | null;
}

const initialState: ScreeningState = {
  results: [],
  session: null,
  loading: false,
  error: null,
};

export const startScreening = createAsyncThunk(
  'screening/start',
  async ({ jobId, options }: { jobId: string; options?: any }) => {
    const response = await apiClient.post('/screening/start', { jobId, options });
    return response.data.data;
  }
);

export const fetchScreeningStatus = createAsyncThunk(
  'screening/fetchStatus',
  async (sessionId: string) => {
    const response = await apiClient.get(`/screening/session/${sessionId}`);
    return response.data.data;
  }
);

export const fetchScreeningResults = createAsyncThunk(
  'screening/fetchResults',
  async ({ jobId, limit }: { jobId: string; limit?: number }) => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get(`/screening/results/${jobId}${params}`);
    return response.data.data;
  }
);

export const regenerateScreening = createAsyncThunk(
  'screening/regenerate',
  async ({ jobId, applicantIds }: { jobId: string; applicantIds?: string[] }) => {
    const response = await apiClient.post('/screening/regenerate', { jobId, applicantIds });
    return response.data.data;
  }
);

const screeningSlice = createSlice({
  name: 'screening',
  initialState,
  reducers: {
    clearResults: (state) => {
      state.results = [];
      state.session = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startScreening.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startScreening.fulfilled, (state, action: PayloadAction<ScreeningSession>) => {
        state.loading = false;
        state.session = action.payload;
      })
      .addCase(startScreening.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to start screening';
      })
      .addCase(fetchScreeningStatus.fulfilled, (state, action: PayloadAction<ScreeningSession>) => {
        state.session = action.payload;
      })
      .addCase(fetchScreeningResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScreeningResults.fulfilled, (state, action: PayloadAction<ScreeningResult[]>) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(fetchScreeningResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch results';
      })
      .addCase(regenerateScreening.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(regenerateScreening.fulfilled, (state, action: PayloadAction<ScreeningSession>) => {
        state.loading = false;
        state.session = action.payload;
        state.results = [];
      })
      .addCase(regenerateScreening.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to regenerate screening';
      });
  },
});

export const { clearResults, clearError } = screeningSlice.actions;
export default screeningSlice.reducer;
