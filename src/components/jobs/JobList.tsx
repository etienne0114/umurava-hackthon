'use client';

import React from 'react';
import { JobCard } from './JobCard';
import { Loader } from '../common/Loader';
import { Job, JobStatus } from '@/types';

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
      <div className="flex justify-center py-12">
        <Loader size="lg" text="Loading jobs..." />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No jobs found</p>
        <p className="text-gray-400 mt-2">
          {isCompanyView ? 'Create your first job to get started' : 'Check back later for new openings'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {onFilterChange && isCompanyView && (
        <div className="mb-6 flex flex-wrap gap-2">
          {(['all', 'active', 'draft', 'closed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onFilterChange(s)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm capitalize ${
                (s === 'all' ? !filterStatus : filterStatus === s)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
