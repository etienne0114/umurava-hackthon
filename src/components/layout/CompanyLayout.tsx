'use client';

import React from 'react';
import { CompanySidebar } from './CompanySidebar';
import { Bell, Search } from 'lucide-react';
import { useAppSelector } from '@/store';

interface CompanyLayoutProps {
  children: React.ReactNode;
}

export const CompanyLayout: React.FC<CompanyLayoutProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <CompanySidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search jobs, candidates, results..."
                className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-indigo-300 focus:ring-0 rounded-full pl-10 pr-4 py-2 text-sm transition-all shadow-sm outline-none"
              />
            </div>
          </div>

          {/* Right: notifications + user */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all">
              <Bell size={20} />
              <span className="w-2 h-2 bg-red-500 rounded-full absolute top-1.5 right-1.5 border-2 border-white" />
            </button>
            <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
                {user?.profile?.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || 'C'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-tight">{user?.profile?.name}</p>
                <p className="text-[10px] text-gray-400">{user?.profile?.position || 'Recruiter'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};
