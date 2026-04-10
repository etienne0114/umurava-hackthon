import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';
import {
  User,
  ExperienceEntry,
  EducationEntry,
  CertificationEntry,
  ProjectEntry,
  Availability,
  SocialLinks,
  UserRole,
} from '@/types';

export interface ParsedResumeProfile {
  firstName: string;
  lastName: string;
  headline: string;
  bio: string;
  phone: string;
  location: string;
  skills: string[];
  languages: Array<{ name: string; proficiency: string }>;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects?: ProjectEntry[];
  certifications?: CertificationEntry[];
  availability?: Availability;
  socialLinks?: SocialLinks;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const existingToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const initialState: AuthState = {
  user: null,
  token: existingToken,
  loading: !!existingToken,
  error: null,
  isAuthenticated: false,
};

export const register = createAsyncThunk(
  'auth/register',
  async (data: {
    email: string;
    password: string;
    role: UserRole;
    name: string;
    firstName?: string;
    lastName?: string;
    headline?: string;
    location?: string;
    phone?: string;
    company?: string;
    position?: string;
  }) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data.data;
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data.data;
  }
);

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async () => {
  const response = await apiClient.get('/auth/profile');
  return response.data.data;
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updates: Partial<User['profile']>) => {
    const response = await apiClient.put('/auth/profile', updates);
    return response.data.data;
  }
);

export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await apiClient.post('/auth/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Avatar upload failed');
    }
  }
);

export const uploadResume = createAsyncThunk(
  'auth/uploadResume',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await apiClient.post('/talent/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Returns { user, extracted }
      return response.data.data as { user: User; extracted: ParsedResumeProfile; parsedBy: string };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Resume upload failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        if (typeof window !== 'undefined') localStorage.setItem('token', action.payload.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        if (typeof window !== 'undefined') localStorage.setItem('token', action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(fetchProfile.pending, (state) => { state.loading = true; })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        if (typeof window !== 'undefined') localStorage.removeItem('token');
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        // Update user profile with the AI-parsed data
        state.user = action.payload.user;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        if (state.user) {
          state.user.profile.avatar = action.payload.avatarUrl;
        }
      });
  },
});

export const { logout, clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
