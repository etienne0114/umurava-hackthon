import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';
import { Job, JobStatus } from '@/types';

interface JobState {
  jobs: Job[];
  currentJob: Job | null;
  loading: boolean;
  error: string | null;
}

const initialState: JobState = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,
};

export const createJob = createAsyncThunk('jobs/create', async (jobData: any) => {
  const response = await apiClient.post('/jobs', jobData);
  return response.data.data;
});

export const fetchJobs = createAsyncThunk(
  'jobs/fetchAll',
  async (filters?: { status?: JobStatus; limit?: number; offset?: number }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await apiClient.get(`/jobs?${params.toString()}`);
    return response.data.data;
  }
);

export const fetchJobById = createAsyncThunk('jobs/fetchById', async (jobId: string) => {
  const response = await apiClient.get(`/jobs/${jobId}`);
  return response.data.data;
});

export const updateJob = createAsyncThunk(
  'jobs/update',
  async ({ jobId, updates }: { jobId: string; updates: Partial<Job> }) => {
    const response = await apiClient.put(`/jobs/${jobId}`, updates);
    return response.data.data;
  }
);

export const deleteJob = createAsyncThunk('jobs/delete', async (jobId: string) => {
  await apiClient.delete(`/jobs/${jobId}`);
  return jobId;
});

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action: PayloadAction<Job>) => {
        state.loading = false;
        state.jobs.unshift(action.payload);
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create job';
      })
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch jobs';
      })
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action: PayloadAction<Job>) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch job';
      })
      .addCase(updateJob.fulfilled, (state, action: PayloadAction<Job>) => {
        const index = state.jobs.findIndex((job) => job._id === action.payload._id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
        if (state.currentJob?._id === action.payload._id) {
          state.currentJob = action.payload;
        }
      })
      .addCase(deleteJob.fulfilled, (state, action: PayloadAction<string>) => {
        state.jobs = state.jobs.filter((job) => job._id !== action.payload);
        if (state.currentJob?._id === action.payload) {
          state.currentJob = null;
        }
      });
  },
});

export const { clearCurrentJob, clearError } = jobSlice.actions;
export default jobSlice.reducer;
