'use client';

import React from 'react';
import { CompanySidebar } from './CompanySidebar';
import { Bell, Search } from 'lucide-react';
import { useAppSelector } from '@/store';
import Link from 'next/link';
import { NotificationDropdown } from './NotificationDropdown';
import { SearchDropdown } from './SearchDropdown';

interface CompanyLayoutProps {
  children: React.ReactNode;
}

export const CompanyLayout: React.FC<CompanyLayoutProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <CompanySidebar />

      <div className="flex-1 min-w-0 ml-60 bg-gray-50 min-h-screen flex flex-col">
        {/* Top header bar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm transition-shadow">
          <SearchDropdown role="company" placeholder="Search jobs, candidates, results..." />

          <div className="flex items-center space-x-4">
            <NotificationDropdown />
            <Link href="/company/profile" className="flex items-center space-x-2 border-l border-gray-200 pl-4 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow overflow-hidden">
                {user?.profile?.avatar ? (
                  <img 
                    src={user.profile.avatar.startsWith('http') 
                      ? user.profile.avatar 
                      : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')}${user.profile.avatar.startsWith('/api') ? '' : '/api'}${user.profile.avatar}`} 
                    alt={user?.profile?.name || 'User'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.profile?.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'C'
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[10px] uppercase font-black text-indigo-600 tracking-wider">Recruiter</p>
                <p className="text-xs font-bold text-gray-500 truncate max-w-[120px]">{user?.profile?.position || 'Talent Acquisition'}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};
