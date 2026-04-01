'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchJobs, deleteJob, updateJob } from '@/store/slices/jobSlice';
import { CompanyLayout } from '@/components/layout/CompanyLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Job, JobStatus } from '@/types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STATUS_LABELS: Record<JobStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  closed: 'Closed',
};

const STATUS_COLORS: Record<JobStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
};

const STATUS_ICONS: Record<JobStatus, React.ReactNode> = {
  draft: <Clock size={12} className="inline mr-1" />,
  active: <CheckCircle size={12} className="inline mr-1" />,
  closed: <XCircle size={12} className="inline mr-1" />,
};

function JobRow({
  job,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  job: Job;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: JobStatus) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Briefcase size={16} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">{job.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {job.employmentType || 'Full-time'} · {job.workMode || 'On-site'}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <div className="relative inline-block">
          <button
            onClick={() => setStatusOpen((v) => !v)}
            className={clsx(
              'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold gap-1 cursor-pointer',
              STATUS_COLORS[job.status]
            )}
          >
            {STATUS_ICONS[job.status]}
            {STATUS_LABELS[job.status]}
            <ChevronDown size={10} />
          </button>
          {statusOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-20 min-w-[110px]">
              {(['active', 'draft', 'closed'] as JobStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onStatusChange(job._id, s);
                    setStatusOpen(false);
                  }}
                  className={clsx(
                    'w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl',
                    job.status === s ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'
                  )}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Users size={14} className="text-gray-400" />
          <span className="font-medium">{job.applicantCount ?? 0}</span>
          <span className="text-gray-400">applicants</span>
        </div>
      </td>
      <td className="py-3.5 px-4 text-xs text-gray-400">
        {new Date(job.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </td>
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(job._id)}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onEdit(job._id)}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            title="Edit Posting"
          >
            <Edit2 size={16} />
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={clsx(
                "p-2 rounded-xl transition-all",
                menuOpen ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:bg-gray-50 search-hover:text-gray-600"
              )}
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setMenuOpen(false)} 
                />
                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl shadow-indigo-100 border border-gray-100 z-20 min-w-[140px] overflow-hidden py-1 animate-in fade-in slide-in-from-top-1">
                  <button
                    onClick={() => {
                      onDelete(job._id);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete Posting
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

function JobsPageContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { jobs, loading } = useAppSelector((state) => state.jobs);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<JobStatus | 'all'>('all');

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const handleDelete = async (jobId: string) => {
    if (!confirm('Delete this job posting? This cannot be undone.')) return;
    try {
      await dispatch(deleteJob(jobId)).unwrap();
      toast.success('Job deleted');
    } catch {
      toast.error('Failed to delete job');
    }
  };

  const handleStatusChange = async (jobId: string, status: JobStatus) => {
    try {
      await dispatch(updateJob({ jobId, updates: { status } })).unwrap();
      toast.success(`Job marked as ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = jobs.filter((j) => {
    const matchesSearch =
      !search || j.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || j.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: jobs.length,
    active: jobs.filter((j) => j.status === 'active').length,
    draft: jobs.filter((j) => j.status === 'draft').length,
    closed: jobs.filter((j) => j.status === 'closed').length,
  };

  return (
    <CompanyLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Job Postings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track all your job listings
            </p>
          </div>
          <button
            onClick={() => router.push('/jobs/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Post New Job
          </button>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'draft', 'closed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={clsx(
                'px-4 py-1.5 rounded-full text-sm font-semibold transition-colors',
                filterStatus === s
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
              )}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s]}{' '}
              <span
                className={clsx(
                  'ml-1 text-xs',
                  filterStatus === s ? 'text-indigo-200' : 'text-gray-400'
                )}
              >
                {counts[s]}
              </span>
            </button>
          ))}
        </div>

        {/* Search + Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search job title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-sm pl-9 pr-4 py-2 text-sm bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-300 outline-none transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-3 text-sm text-gray-500">Loading jobs...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase size={24} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No job postings found</p>
              <p className="text-xs text-gray-400 mt-1">
                {search ? 'Try a different search term' : 'Post your first job to get started'}
              </p>
              {!search && (
                <button
                  onClick={() => router.push('/jobs/new')}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Post New Job
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                    Job
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                    Applicants
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                    Posted
                  </th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => (
                  <JobRow
                    key={job._id}
                    job={job}
                    onView={(id) => router.push(`/jobs/${id}`)}
                    onEdit={(id) => router.push(`/jobs/${id}/edit`)}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </CompanyLayout>
  );
}

export default function CompanyJobsPage() {
  return (
    <ProtectedRoute requiredRole="company">
      <JobsPageContent />
    </ProtectedRoute>
  );
}
