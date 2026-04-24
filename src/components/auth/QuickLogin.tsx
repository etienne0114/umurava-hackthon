'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { login, logout } from '@/store/slices/authSlice';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';

interface QuickLoginProps {
  onLoginSuccess?: () => void;
}

export const QuickLogin: React.FC<QuickLoginProps> = ({ onLoginSuccess }) => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [localLoading, setLocalLoading] = useState(false);

  const loginAsCompany = async () => {
    setLocalLoading(true);
    try {
      await dispatch(login({
        email: 'company@test.com',
        password: 'password123'
      })).unwrap();
      toast.success('Logged in as company user');
      onLoginSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLocalLoading(false);
    }
  };

  const loginAsTalent = async () => {
    setLocalLoading(true);
    try {
      await dispatch(login({
        email: 'talent@test.com',
        password: 'password123'
      })).unwrap();
      toast.success('Logged in as talent user');
      onLoginSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out');
    onLoginSuccess?.();
  };

  const isLoading = loading || localLoading;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-blue-900 mb-3">Quick Login (Testing)</h3>
      
      {user ? (
        <div className="space-y-3">
          <p className="text-sm text-blue-800">
            Logged in as: <strong>{user.profile.name}</strong> ({user.role})
          </p>
          <Button 
            onClick={handleLogout} 
            variant="secondary" 
            size="sm"
            disabled={isLoading}
          >
            Logout
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-blue-800 mb-3">
            Login with test credentials to access the screening page:
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={loginAsCompany} 
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login as Company'}
            </Button>
            <Button 
              onClick={loginAsTalent} 
              variant="secondary"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login as Talent'}
            </Button>
          </div>
          <div className="text-xs text-blue-600 mt-2">
            <p>Company: company@test.com / password123</p>
            <p>Talent: talent@test.com / password123</p>
          </div>
        </div>
      )}
    </div>
  );
};