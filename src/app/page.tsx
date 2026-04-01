'use client';

import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { Button } from '@/components/common/Button';
import { memo } from 'react';

const Home = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            AI-Powered Recruitment Screening
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Efficiently screen and shortlist candidates using AI-powered analysis while maintaining human control over final hiring decisions
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">🎯</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Smart Screening</h3>
            <p className="text-sm sm:text-base text-gray-600">
              AI-powered candidate evaluation with explainable reasoning and match scores
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">📊</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Ranked Shortlists</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Automatically rank candidates and get Top 10-20 recommendations
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md sm:col-span-2 lg:col-span-1">
            <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">🔄</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Multi-Source Import</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Import from Umurava Platform or upload CSV, Excel, and PDF files
            </p>
          </div>
        </div>

        <div className="text-center space-y-4">
          {isAuthenticated ? (
            <div>
              <p className="text-sm sm:text-base text-gray-700 mb-4">
                Welcome back, {user?.profile?.name}!
              </p>
              <Button
                size="lg"
                onClick={() =>
                  router.push(user?.role === 'talent' ? '/talent/dashboard' : '/company/dashboard')
                }
                className="w-full sm:w-auto"
              >
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button size="lg" onClick={() => router.push('/auth/register')} className="w-full sm:w-auto">
                Get Started Free
              </Button>
              <Button variant="secondary" size="lg" onClick={() => router.push('/auth/login')} className="w-full sm:w-auto">
                Sign In
              </Button>
            </div>
          )}
        </div>

        <div className="mt-12 sm:mt-16 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">How It Works</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <span className="text-blue-600 font-bold text-sm sm:text-base">1</span>
              </div>
              <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Create Account</h4>
              <p className="text-xs sm:text-sm text-gray-600">Sign up as a company or talent</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <span className="text-blue-600 font-bold text-sm sm:text-base">2</span>
              </div>
              <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Post Job</h4>
              <p className="text-xs sm:text-sm text-gray-600">Create job with requirements</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <span className="text-blue-600 font-bold text-sm sm:text-base">3</span>
              </div>
              <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Add Candidates</h4>
              <p className="text-xs sm:text-sm text-gray-600">Upload files or import from Umurava</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <span className="text-blue-600 font-bold text-sm sm:text-base">4</span>
              </div>
              <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Get Results</h4>
              <p className="text-xs sm:text-sm text-gray-600">AI ranks and shortlists top candidates</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Memoize the home page component
export default memo(Home);
