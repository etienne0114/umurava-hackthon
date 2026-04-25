'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, Trash2, Clock, Inbox, Settings, ChevronLeft, BellOff } from 'lucide-react';
import apiClient from '@/store/api/apiClient';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import clsx from 'clsx';

interface NotificationPreferences {
  masterEnabled: boolean;
  screeningCompleted: boolean;
  newApplicants: boolean;
  assessmentSubmitted: boolean;
  jobStatusChanged: boolean;
  systemAlerts: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  masterEnabled: true,
  screeningCompleted: true,
  newApplicants: true,
  assessmentSubmitted: true,
  jobStatusChanged: true,
  systemAlerts: true,
};

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  saving?: boolean;
  label: string;
  description?: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, disabled, saving, label, description }) => (
  <div className={clsx('flex items-center justify-between gap-3 py-2.5', (disabled || saving) && 'opacity-40')}>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-gray-800">{label}</p>
      {description && <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{description}</p>}
    </div>
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled || saving}
      onClick={() => !disabled && !saving && onChange(!checked)}
      className={clsx(
        'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1',
        checked ? 'bg-indigo-600' : 'bg-gray-200',
        (disabled || saving) && 'cursor-not-allowed'
      )}
    >
      <span
        className={clsx(
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  </div>
);

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
  const [view, setView] = useState<'list' | 'settings'>('list');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Load preferences from backend on mount ──
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setPrefsLoading(true);
        const res = await apiClient.get('/notifications/preferences');
        if (res.data.success) {
          setPreferences({ ...DEFAULT_PREFERENCES, ...res.data.data });
        }
      } catch {
        // Fall back to defaults silently if not authenticated yet
      } finally {
        setPrefsLoading(false);
      }
    };
    loadPreferences();
  }, []);

  const [prefsError, setPrefsError] = useState<string | null>(null);

  // ── Debounced save to backend (500ms after last change) ──
  const savePreferences = useCallback((updated: NotificationPreferences, previous: NotificationPreferences) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setPrefsSaved(false);
    setPrefsError(null);
    saveTimerRef.current = setTimeout(async () => {
      try {
        setPrefsSaving(true);
        await apiClient.put('/notifications/preferences', updated);
        setPrefsSaved(true);
      } catch {
        // Rollback to previous value so the toggle doesn't stay in a false state
        setPreferences(previous);
        setPrefsError('Failed to save. Please try again.');
      } finally {
        setPrefsSaving(false);
      }
    }, 500);
  }, []);

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: value };
      savePreferences(updated, prev);
      return updated;
    });
  };

  // ── Fetch notifications (respects master toggle) ──
  const fetchNotifications = useCallback(async () => {
    if (!preferences.masterEnabled) return;
    try {
      setLoading(true);
      const response = await apiClient.get('/notifications');
      setNotifications(response.data.data.notifications);
      setUnreadCount(response.data.data.unreadCount);
    } catch {
      // Silently ignore
    } finally {
      setLoading(false);
    }
  }, [preferences.masterEnabled]);

  useEffect(() => {
    if (preferences.masterEnabled) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [preferences.masterEnabled, fetchNotifications]);

  // ── Close on outside click ──
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setView('list');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Cleanup debounce timer on unmount ──
  useEffect(() => () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); }, []);

  const markAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const deleteNotification = async (id: string, isRead: boolean) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (!isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const handleBellClick = () => {
    if (!isOpen) setView('list');
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleBellClick}
        aria-label="Notifications"
        className={clsx(
          'relative p-2 rounded-full transition-all hover:bg-gray-100',
          isOpen ? 'text-indigo-600 bg-gray-50' : 'text-gray-400'
        )}
      >
        {preferences.masterEnabled ? <Bell size={20} /> : <BellOff size={20} />}
        {preferences.masterEnabled && unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-3xl border border-gray-100 overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-200 ring-4 ring-black/5">

          {/* ── NOTIFICATIONS LIST VIEW ── */}
          {view === 'list' && (
            <>
              <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && preferences.masterEnabled && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                    >
                      Mark all as read
                    </button>
                  )}
                  <button
                    onClick={() => setView('settings')}
                    aria-label="Notification settings"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Notification settings"
                  >
                    <Settings size={14} />
                  </button>
                </div>
              </div>

              <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
                {!preferences.masterEnabled ? (
                  <div className="p-10 text-center">
                    <BellOff size={32} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-sm font-semibold text-gray-700">Notifications are off</p>
                    <p className="text-xs text-gray-400 mt-1 mb-4 leading-relaxed">
                      You won't receive any alerts while notifications are disabled.
                    </p>
                    <button
                      onClick={() => setView('settings')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
                    >
                      Go to settings to turn them on
                    </button>
                  </div>
                ) : loading && notifications.length === 0 ? (
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
                        'p-4 hover:bg-gray-50 transition-colors group relative',
                        !n.isRead && 'bg-indigo-50/30'
                      )}
                    >
                      <div className="flex gap-3">
                        <div className={clsx(
                          'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                          n.isRead ? 'bg-transparent' : 'bg-indigo-600'
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

              {notifications.length > 0 && preferences.masterEnabled && (
                <div className="p-3 bg-gray-50 text-center">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-bold text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── SETTINGS VIEW ── */}
          {view === 'settings' && (
            <>
              <div className="p-4 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
                <button
                  onClick={() => setView('list')}
                  aria-label="Back to notifications"
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <h3 className="font-bold text-gray-900 text-sm flex-1">Notification Settings</h3>
                {prefsSaving && (
                  <span className="text-[10px] text-indigo-500 font-medium flex items-center gap-1">
                    <span className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin inline-block" />
                    Saving…
                  </span>
                )}
                {!prefsSaving && prefsSaved && (
                  <span className="text-[10px] text-green-500 font-medium">Saved ✓</span>
                )}
                {!prefsSaving && prefsError && (
                  <span className="text-[10px] text-red-500 font-medium">{prefsError}</span>
                )}
              </div>

              <div className="p-4 space-y-1 max-h-[420px] overflow-y-auto">
                {prefsLoading ? (
                  <div className="py-10 text-center">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Loading preferences…</p>
                  </div>
                ) : (
                  <>
                    {/* Master toggle */}
                    <div className="pb-3 mb-1 border-b border-gray-100">
                      <Toggle
                        label="Enable Notifications"
                        description={
                          preferences.masterEnabled
                            ? 'Toggle off to silence all alerts — useful when processing large batches of applicants.'
                            : 'Notifications are OFF. No alerts will be shown or fetched.'
                        }
                        checked={preferences.masterEnabled}
                        onChange={(val) => updatePreference('masterEnabled', val)}
                        saving={prefsSaving}
                      />
                    </div>

                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-1 pb-0.5">
                      Notify me about
                    </p>

                    <Toggle
                      label="Screening completed"
                      description="When AI finishes evaluating all applicants for a job."
                      checked={preferences.screeningCompleted}
                      onChange={(val) => updatePreference('screeningCompleted', val)}
                      disabled={!preferences.masterEnabled}
                      saving={prefsSaving}
                    />
                    <Toggle
                      label="New applicants"
                      description="When candidates are uploaded or imported to a job."
                      checked={preferences.newApplicants}
                      onChange={(val) => updatePreference('newApplicants', val)}
                      disabled={!preferences.masterEnabled}
                      saving={prefsSaving}
                    />
                    <Toggle
                      label="Assessment submitted"
                      description="When a candidate completes and submits a technical assessment."
                      checked={preferences.assessmentSubmitted}
                      onChange={(val) => updatePreference('assessmentSubmitted', val)}
                      disabled={!preferences.masterEnabled}
                      saving={prefsSaving}
                    />
                    <Toggle
                      label="Job status changes"
                      description="When a job moves from draft → active → closed."
                      checked={preferences.jobStatusChanged}
                      onChange={(val) => updatePreference('jobStatusChanged', val)}
                      disabled={!preferences.masterEnabled}
                      saving={prefsSaving}
                    />
                    <Toggle
                      label="System alerts"
                      description="Important platform updates and error notifications."
                      checked={preferences.systemAlerts}
                      onChange={(val) => updatePreference('systemAlerts', val)}
                      disabled={!preferences.masterEnabled}
                      saving={prefsSaving}
                    />
                  </>
                )}
              </div>

              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Settings are saved to your account and sync across all devices.
                </p>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
};
