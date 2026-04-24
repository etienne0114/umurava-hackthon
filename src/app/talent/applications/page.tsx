'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TalentLayout } from '@/components/layout/TalentLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Loader } from '@/components/common/Loader';
import { Card } from '@/components/common/Card';
import { QuickTestsBoard } from '@/components/talent/QuickTestsBoard';
import apiClient from '@/store/api/apiClient';
import { Application, Job } from '@/types';
import { Briefcase, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

type PopulatedApplication = Omit<Application, 'jobId'> & { jobId: Job | null };

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    icon: Clock,
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    dot: 'bg-yellow-400',
  },
  reviewing: {
    label: 'Under Review',
    icon: Eye,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  hired: {
    label: 'Hired',
    icon: CheckCircle,
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  declined: {
    label: 'Declined',
    icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-400',
  },
} as const;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export default function TalentApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<PopulatedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/talent/applications');
        if (res.data.success) setApplications(res.data.data);
      } catch {
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered =
    filterStatus === 'all' ? applications : applications.filter((a) => a.status === filterStatus);

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    reviewing: applications.filter((a) => a.status === 'reviewing').length,
    hired: applications.filter((a) => a.status === 'hired').length,
    declined: applications.filter((a) => a.status === 'declined').length,
  };

  return (
    <ProtectedRoute requiredRole="talent">
      <TalentLayout>
        <div className="space-y-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
              <p className="text-sm text-gray-500 mt-1">Track all your job applications in one place</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { key: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-600' },
                { key: 'reviewing', label: 'Reviewing', icon: Eye, color: 'text-blue-600' },
                { key: 'hired', label: 'Hired', icon: CheckCircle, color: 'text-green-600' },
                { key: 'declined', label: 'Declined', icon: XCircle, color: 'text-red-500' },
              ].map(({ key, label, icon: Icon, color }) => (
                <Card key={key} className="text-center py-4">
                  <Icon className={`w-6 h-6 mx-auto mb-1 ${color}`} />
                  <p className={`text-2xl font-black ${color}`}>{counts[key as keyof typeof counts]}</p>
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                </Card>
              ))}
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-1">
              {(['all', 'pending', 'reviewing', 'hired', 'declined'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filterStatus === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  <span className="ml-1.5 text-xs opacity-70">({counts[s]})</span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader size="lg" text="Loading applications..." />
              </div>
            ) : filtered.length === 0 ? (
              <Card>
                <div className="text-center py-16">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No applications found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {filterStatus === 'all'
                      ? 'Apply to jobs to see them here'
                      : `No ${filterStatus} applications`}
                  </p>
                  <button
                    onClick={() => router.push('/jobs')}
                    className="mt-4 text-blue-600 text-sm font-semibold hover:underline"
                  >
                    Browse Jobs &rarr;
                  </button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {filtered.map((app) => {
                  const job = app.jobId;
                  const cfg = STATUS_CONFIG[app.status];

                  if (!job) return null;

                  return (
                    <div
                      key={app._id}
                      className={`bg-white rounded-2xl border ${cfg.border} p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3
                            className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer"
                            onClick={() => router.push(`/jobs/${job._id}`)}
                          >
                            {job.title}
                          </h3>
                          <p className="text-sm text-gray-500">{job.company || 'Platform'}</p>
                          <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-400">
                            <span className="capitalize">{job.employmentType?.replace('-', ' ')}</span>
                            <span>•</span>
                            <span className="capitalize">{job.workMode?.replace('-', ' ')}</span>
                            <span>•</span>
                            <span>Applied {timeAgo(app.appliedAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text} border ${cfg.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-2">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Quick Tests</h2>
              <p className="text-sm text-gray-500">Complete recruiter-assigned tests to move your applications forward.</p>
            </div>
            <QuickTestsBoard />
          </div>
        </div>
      </TalentLayout>
    </ProtectedRoute>
  );
}
