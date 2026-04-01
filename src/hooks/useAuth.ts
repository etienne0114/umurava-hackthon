import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  register,
  login,
  logout,
  fetchProfile,
  updateProfile,
  clearError,
  User,
} from '@/store/slices/authSlice';
import { UserRole } from '@/store/slices/authSlice';

export const useAuth = (autoFetch: boolean = false) => {
  const dispatch = useAppDispatch();
  const { user, token, loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (autoFetch && token && !user) {
      dispatch(fetchProfile());
    }
  }, [autoFetch, token, user, dispatch]);

  const handleRegister = async (data: {
    email: string;
    password: string;
    role: UserRole;
    name: string;
    phone?: string;
    company?: string;
    position?: string;
  }) => {
    return await dispatch(register(data)).unwrap();
  };

  const handleLogin = async (data: { email: string; password: string }) => {
    return await dispatch(login(data)).unwrap();
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleFetchProfile = async () => {
    return await dispatch(fetchProfile()).unwrap();
  };

  const handleUpdateProfile = async (updates: Partial<User['profile']>) => {
    return await dispatch(updateProfile(updates)).unwrap();
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    register: handleRegister,
    login: handleLogin,
    logout: handleLogout,
    fetchProfile: handleFetchProfile,
    updateProfile: handleUpdateProfile,
    clearError: handleClearError,
  };
};
