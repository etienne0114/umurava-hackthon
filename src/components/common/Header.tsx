'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { Button } from './Button';
import toast from 'react-hot-toast';

// Routes that always use sidebar layouts — global header must not render there
const SIDEBAR_PREFIXES = ['/talent/', '/company/'];

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Hide on pages that use TalentLayout or CompanyLayout (they have their own header)
  const onSidebarRoute = SIDEBAR_PREFIXES.some((p) => pathname.startsWith(p));
  // Also hide on /jobs/* when authenticated — those pages now use sidebar layouts
  const onJobsAuthenticated = isAuthenticated && pathname.startsWith('/jobs');

  if (onSidebarRoute || onJobsAuthenticated) return null;

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200" role="banner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <button
              onClick={() => router.push('/')}
              className="text-lg sm:text-xl font-bold text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
              aria-label="Go to home page"
            >
              <span className="hidden sm:inline">AI Recruitment</span>
              <span className="sm:hidden">AI Recruit</span>
            </button>
            {isAuthenticated && (
              <nav className="hidden md:flex space-x-4 lg:space-x-6" role="navigation" aria-label="Main navigation">
                {user?.role === 'talent' ? (
                  <>
                    <button
                      onClick={() => router.push('/talent/dashboard')}
                      className="text-sm lg:text-base text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => router.push('/jobs')}
                      className="text-sm lg:text-base text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
                    >
                      Browse Jobs
                    </button>
                    <button
                      onClick={() => router.push('/talent/applications')}
                      className="text-sm lg:text-base text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
                    >
                      My Applications
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => router.push('/company/dashboard')}
                      className="text-sm lg:text-base text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => router.push('/jobs')}
                      className="text-sm lg:text-base text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
                    >
                      My Jobs
                    </button>
                    <button
                      onClick={() => router.push('/jobs/new')}
                      className="text-sm lg:text-base text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
                    >
                      Post Job
                    </button>
                  </>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated && user ? (
              <>
                <div className="hidden lg:block text-right" aria-label="User information">
                  <p className="text-sm font-medium text-gray-900">{user.profile.name}</p>
                  <p className="text-xs text-gray-600 capitalize">{user.role}</p>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleLogout}
                  aria-label="Log out of your account"
                >
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">Out</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  href="/auth/login"
                  className="text-xs sm:text-sm"
                  aria-label="Sign in to your account"
                >
                  Sign In
                </Button>
                <Button 
                  size="sm" 
                  href="/auth/register" 
                  className="text-xs sm:text-sm"
                  aria-label="Create a new account"
                >
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
