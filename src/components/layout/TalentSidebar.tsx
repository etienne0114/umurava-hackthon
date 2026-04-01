'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/slices/authSlice';
import {
  LayoutDashboard,
  User,
  Briefcase,
  ClipboardList,
  LogOut,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const navGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard',     icon: LayoutDashboard, href: '/talent/dashboard' },
      { name: 'My Profile',    icon: User,            href: '/talent/profile' },
    ],
  },
  {
    title: 'Jobs & Applications',
    items: [
      { name: 'Browse Jobs',     icon: Briefcase,     href: '/jobs' },
      { name: 'My Applications', icon: ClipboardList, href: '/talent/applications' },
    ],
  },
];

export const TalentSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-gray-100 flex flex-col z-20 sidebar-scroll overflow-y-auto">
      {/* Logo / brand */}
      <div className="h-16 px-6 border-b border-gray-100 flex items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <div>
            <p className="text-sm font-black text-gray-900 tracking-tight leading-none">AI Recruit</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Talent Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon
                      size={17}
                      className={clsx('flex-shrink-0', isActive ? 'text-white' : 'text-gray-400')}
                    />
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full opacity-60" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={17} className="flex-shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
