'use client';

import React from 'react';
import { TalentSidebar } from './TalentSidebar';
import { Bell, Search } from 'lucide-react';
import { useAppSelector } from '@/store';
import Link from 'next/link';
import { NotificationDropdown } from './NotificationDropdown';
import { SearchDropdown } from './SearchDropdown';

export const TalentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);

  const initials = user?.profile?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'T';

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <TalentSidebar />

      <div className="flex-1 min-w-0 ml-64 bg-gray-50 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm transition-shadow">
          <SearchDropdown role="talent" placeholder="Search jobs, companies, skills..." />

          <div className="flex items-center space-x-4">
            <NotificationDropdown />
            <Link href="/talent/profile" className="flex items-center space-x-2 border-l border-gray-200 pl-4 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow overflow-hidden">
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
                    .slice(0, 2) || 'T'
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[10px] uppercase font-black text-blue-600 tracking-wider">Talent</p>
                <p className="text-xs font-bold text-gray-500 truncate max-w-[120px]">{user?.profile?.position || 'Job Seeker'}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};
