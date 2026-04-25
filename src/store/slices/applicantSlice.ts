import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';
import { Applicant } from '@/types';

interface ApplicantState {
  applicants: Applicant[];
  loading: boolean;
  error: string | null;
  uploadProgress: number;
  uploadMeta: {
    parsed: number;
    created: number;
    duplicates: number;
  } | null;
}

const initialState: ApplicantState = {
  applicants: [],
  loading: false,
  error: null,
  uploadProgress: 0,
  uploadMeta: null,
};

export const uploadApplicants = createAsyncThunk(
  'applicants/upload',
  async ({ jobId, file }: { jobId: string; file: File }) => {
    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('file', file);

    const response = await apiClient.post('/applicants/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return {
      applicants: response.data.data,
      meta: response.data.meta,
    };
  }
);

export const importFromUmurava = createAsyncThunk(
  'applicants/import',
  async ({ jobId, profileIds }: { jobId: string; profileIds: string[] }) => {
    const response = await apiClient.post('/applicants/import', { jobId, profileIds });
    return response.data.data;
  }
);

export const fetchApplicants = createAsyncThunk(
  'applicants/fetchAll',
  async (
    { jobId, limit, offset }: { jobId: string; limit?: number; offset?: number },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({ jobId });
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());

      const response = await apiClient.get(`/applicants?${params.toString()}`);
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch applicants');
    }
  }
);

export const deleteApplicant = createAsyncThunk(
  'applicants/delete',
  async (applicantId: string) => {
    await apiClient.delete(`/applicants/${applicantId}`);
    return applicantId;
  }
);

export const clearAllApplicants = createAsyncThunk(
  'applicants/clearAll',
  async (jobId: string) => {
    const response = await apiClient.delete(`/applicants/job/${jobId}`);
    return response.data.data?.deletedCount ?? 0;
  }
);

const applicantSlice = createSlice({
  name: 'applicants',
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearApplicants: (state) => {
      state.applicants = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadApplicants.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadProgress = 0;
        state.uploadMeta = null;
      })
      .addCase(uploadApplicants.fulfilled, (state, action: PayloadAction<{ applicants: Applicant[]; meta: any }>) => {
        state.loading = false;
        state.applicants = [...state.applicants, ...(action.payload.applicants || [])];
        state.uploadProgress = 100;
        state.uploadMeta = action.payload.meta || null;
      })
      .addCase(uploadApplicants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to upload applicants';
        state.uploadProgress = 0;
        state.uploadMeta = null;
      })
      .addCase(importFromUmurava.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importFromUmurava.fulfilled, (state, action: PayloadAction<Applicant[]>) => {
        state.loading = false;
        state.applicants = [...state.applicants, ...action.payload];
      })
      .addCase(importFromUmurava.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to import from Umurava';
      })
      .addCase(fetchApplicants.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.applicants = [];
      })
      .addCase(fetchApplicants.fulfilled, (state, action: PayloadAction<Applicant[]>) => {
        state.loading = false;
        state.applicants = action.payload;
      })
      .addCase(fetchApplicants.rejected, (state, action) => {
        state.loading = false;
        state.applicants = [];
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch applicants';
      })
      .addCase(deleteApplicant.fulfilled, (state, action: PayloadAction<string>) => {
        state.applicants = state.applicants.filter((app) => app._id !== action.payload);
      })
      .addCase(clearAllApplicants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearAllApplicants.fulfilled, (state) => {
        state.loading = false;
        state.applicants = [];
        state.uploadMeta = null;
      })
      .addCase(clearAllApplicants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to clear applicants';
      });
  },
});

export const { setUploadProgress, clearError, clearApplicants } = applicantSlice.actions;
export default applicantSlice.reducer;
