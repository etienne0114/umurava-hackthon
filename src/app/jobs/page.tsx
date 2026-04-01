'use client';

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchJobs, deleteJob } from '@/store/slices/jobSlice';
import { Button } from '@/components/common/Button';
import { CardSkeleton } from '@/components/common/Skeleton';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { TalentLayout } from '@/components/layout/TalentLayout';
import { CompanyLayout } from '@/components/layout/CompanyLayout';
import { JobStatus } from '@/types';
import toast from 'react-hot-toast';

const JobList = lazy(() =>
  import('@/components/jobs/JobList').then(mod => ({ default: mod.JobList }))
);

function JobsContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { jobs, loading, error } = useAppSelector((state) => state.jobs);
  const { user } = useAppSelector((state) => state.auth);
  const isCompany = user?.role === 'company';
  const [filterStatus, setFilterStatus] = useState<JobStatus | undefined>();

  useEffect(() => {
    dispatch(fetchJobs({ status: filterStatus }));
  }, [dispatch, filterStatus]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleView = (jobId: string) => router.push(`/jobs/${jobId}`);
  const handleEdit = (jobId: string) => router.push(`/jobs/${jobId}/edit`);

  const handleDelete = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await dispatch(deleteJob(jobId)).unwrap();
        toast.success('Job deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete job');
      }
    }
  };

  const handleFilterChange = (status: JobStatus | 'all') => {
    setFilterStatus(status === 'all' ? undefined : status);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isCompany ? 'My Job Postings' : 'Available Jobs'}
          </h1>
          {!isCompany && (
            <p className="text-sm text-gray-500 mt-1">Browse and apply to open positions</p>
          )}
        </div>
        {isCompany && (
          <Button onClick={() => router.push('/jobs/new')} className="w-full sm:w-auto">
            + Create New Job
          </Button>
        )}
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        }
      >
        <JobList
          jobs={jobs}
          loading={loading}
          onView={handleView}
          onEdit={isCompany ? handleEdit : undefined}
          onDelete={isCompany ? handleDelete : undefined}
          filterStatus={filterStatus}
          onFilterChange={handleFilterChange}
          isCompanyView={isCompany}
        />
      </Suspense>
    </div>
  );
}

function JobsWithLayout() {
  const { user } = useAppSelector((state) => state.auth);

  if (user?.role === 'company') {
    return (
      <CompanyLayout>
        <JobsContent />
      </CompanyLayout>
    );
  }

  // Default: talent layout (sidebar stays persistent)
  return (
    <TalentLayout>
      <JobsContent />
    </TalentLayout>
  );
}

export default function JobsPage() {
  return (
    <ProtectedRoute>
      <JobsWithLayout />
    </ProtectedRoute>
  );
}
