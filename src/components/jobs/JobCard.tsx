'use client';

import React, { memo } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Job } from '@/types';

interface JobCardProps {
  job: Job;
  onView: (jobId: string) => void;
  onEdit?: (jobId: string) => void;
  onDelete?: (jobId: string) => void;
}

const JobCardComponent: React.FC<JobCardProps> = ({ job, onView, onEdit, onDelete }) => {
  const statusColors = {
    draft: 'bg-gray-200 text-gray-800',
    active: 'bg-green-200 text-green-800',
    closed: 'bg-red-200 text-red-800',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow" role="article" aria-labelledby={`job-title-${job._id}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
        <div className="flex-1">
          <h3 id={`job-title-${job._id}`} className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            {job.title}
          </h3>
          <p className="text-sm sm:text-base text-gray-700 line-clamp-2">{job.description}</p>
        </div>
        <span 
          className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start ${statusColors[job.status]}`}
          role="status"
          aria-label={`Job status: ${job.status}`}
        >
          {job.status}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-600 mb-4 gap-2">
        <span aria-label={`${job.applicantCount} applicants`}>
          📋 {job.applicantCount} applicants
        </span>
        {job.screeningStatus && (
          <span className="capitalize" aria-label={`Screening status: ${job.screeningStatus.replace('_', ' ')}`}>
            🔍 {job.screeningStatus.replace('_', ' ')}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2" role="group" aria-label="Job actions">
        <Button
          size="sm"
          variant="primary"
          onClick={() => onView(job._id)}
          className="w-full sm:w-auto"
          aria-label={`View details for ${job.title}`}
        >
          View
        </Button>
        {onEdit && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit(job._id)}
            className="w-full sm:w-auto"
            aria-label={`Edit ${job.title}`}
          >
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(job._id)}
            className="w-full sm:w-auto"
            aria-label={`Delete ${job.title}`}
          >
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
};

// Memoize JobCard to prevent unnecessary re-renders
export const JobCard = memo(JobCardComponent);
