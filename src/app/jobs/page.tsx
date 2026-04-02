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

import { Search, Plus, Filter } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-12">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
            {isCompany ? 'My Job Postings' : 'Available Jobs'}
          </h1>
          {!isCompany && (
            <p className="text-sm font-bold text-gray-400 mt-2">Explore elite opportunities in the Umurava network</p>
          )}
        </div>
        {isCompany && (
          <button 
            onClick={() => router.push('/jobs/new')}
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Post New Opportunity
          </button>
        )}
      </div>

      <Suspense
        fallback={
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
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
