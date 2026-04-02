'use client';

import React from 'react';
import { JobCard } from './JobCard';
import { Loader } from '../common/Loader';
import { Job, JobStatus } from '@/types';
import { Search, Filter, Plus, Inbox } from 'lucide-react';
import clsx from 'clsx';

interface JobListProps {
  jobs: Job[];
  loading: boolean;
  onView: (jobId: string) => void;
  onEdit?: (jobId: string) => void;
  onDelete?: (jobId: string) => void;
  filterStatus?: JobStatus;
  onFilterChange?: (status: JobStatus | 'all') => void;
  isCompanyView?: boolean;
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  loading,
  onView,
  onEdit,
  onDelete,
  filterStatus,
  onFilterChange,
  isCompanyView = false,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm animate-pulse">
        <Loader size="lg" text="Fetching the latest opportunities..." />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
          <Inbox size={40} className="text-gray-300" />
        </div>
        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">No jobs found</h3>
        <p className="text-gray-400 font-medium max-w-xs text-center leading-relaxed">
          {isCompanyView 
            ? "You haven't posted any jobs yet. Create your first listing to start reaching top talent." 
            : "There are no open positions matching your criteria right now. Check back soon!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {onFilterChange && isCompanyView && (
        <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-gray-100/50 shadow-sm sticky top-20 z-20">
          <div className="flex p-1 gap-1">
            {(['all', 'active', 'draft', 'closed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => onFilterChange(s)}
                className={clsx(
                  "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200",
                  (s === 'all' ? !filterStatus : filterStatus === s)
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                )}
              >
                {s === 'all' ? 'All Postings' : s}
              </button>
            ))}
          </div>
          
          <div className="pr-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:block">
            {jobs.length} Results Found
          </div>
        </div>
      )}

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
