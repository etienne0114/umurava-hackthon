'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { Loader } from './common/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'talent' | 'company';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }

    if (!loading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      router.push('/jobs');
    }
  }, [isAuthenticated, loading, requiredRole, user, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
