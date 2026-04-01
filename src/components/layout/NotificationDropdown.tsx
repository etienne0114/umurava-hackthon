'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Clock, Inbox } from 'lucide-react';
import apiClient from '@/store/api/apiClient';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import clsx from 'clsx';

interface Notification {
  _id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/notifications');
      setNotifications(response.data.data.notifications);
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds for new notifications
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (id: string, isRead: boolean) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (!isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "relative p-2 rounded-full transition-all hover:bg-gray-100",
          isOpen ? "text-indigo-600 bg-gray-50" : "text-gray-400"
        )}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-400">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Inbox size={32} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm font-medium text-gray-900">No notifications</p>
                <p className="text-xs text-gray-400 mt-1">We'll alert you when something happens</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={clsx(
                    "p-4 hover:bg-gray-50 transition-colors group relative",
                    !n.isRead && "bg-indigo-50/30"
                  )}
                >
                  <div className="flex gap-3">
                    <div className={clsx(
                      "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                      n.isRead ? "bg-transparent" : "bg-indigo-600"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 mb-0.5">{n.title}</p>
                      <p className="text-[11px] text-gray-500 leading-relaxed mb-2">{n.message}</p>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Clock size={10} />
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                        {n.link && (
                          <Link 
                            href={n.link}
                            className="text-[10px] font-bold text-indigo-600 hover:underline"
                            onClick={() => setIsOpen(false)}
                          >
                            View details
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead(n._id)}
                          className="p-1 text-gray-400 hover:text-indigo-600 bg-white rounded shadow-sm border border-gray-100"
                          title="Mark as read"
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n._id, n.isRead)}
                        className="p-1 text-gray-400 hover:text-red-600 bg-white rounded shadow-sm border border-gray-100"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 bg-gray-50 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
