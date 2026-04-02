'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchJobById, updateJob } from '@/store/slices/jobSlice';
import { JobForm } from '@/components/jobs/JobForm';
import { CompanyLayout } from '@/components/layout/CompanyLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Loader } from '@/components/common/Loader';
import toast from 'react-hot-toast';

function EditJobContent() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const dispatch = useAppDispatch();
  const { currentJob, loading } = useAppSelector((state) => state.jobs);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (jobId) dispatch(fetchJobById(jobId));
  }, [dispatch, jobId]);

  useEffect(() => {
    if (currentJob && user) {
      const creatorId = typeof currentJob.createdBy === 'object' 
        ? (currentJob.createdBy as any)._id || (currentJob.createdBy as any).id
        : currentJob.createdBy;
      
      if (creatorId && creatorId !== user.id) {
        toast.error('You do not have permission to edit this job');
        router.push('/company/jobs');
      }
    }
  }, [currentJob, user, router]);

  const handleSubmit = async (data: any) => {
    try {
      await dispatch(updateJob({ jobId, updates: data })).unwrap();
      toast.success('Job updated successfully!');
      router.push(`/jobs/${jobId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update job');
      throw error;
    }
  };

  if (loading) {
    return (
      <CompanyLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <Loader size="lg" text="Loading job..." />
        </div>
      </CompanyLayout>
    );
  }

  if (!currentJob) {
    return (
      <CompanyLayout>
        <div className="h-[60vh] flex items-center justify-center text-gray-500">
          Job not found
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors mb-4 flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
          <p className="text-sm text-gray-500 mt-1">Update the details for this job posting</p>
        </div>
        <JobForm
          initialData={currentJob}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </CompanyLayout>
  );
}

export default function EditJobPage() {
  return (
    <ProtectedRoute requiredRole="company">
      <EditJobContent />
    </ProtectedRoute>
  );
}
