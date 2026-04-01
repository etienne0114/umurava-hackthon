'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store';
import { createJob } from '@/store/slices/jobSlice';
import { JobForm } from '@/components/jobs/JobForm';
import { CompanyLayout } from '@/components/layout/CompanyLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';

function CreateJobContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSubmit = async (data: any) => {
    try {
      await dispatch(createJob(data)).unwrap();
      toast.success('Job created successfully');
      router.push('/company/jobs');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create job');
      throw error;
    }
  };

  return (
    <CompanyLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Post New Job</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the details to create a new job posting</p>
        </div>
        <JobForm onSubmit={handleSubmit} onCancel={() => router.push('/company/jobs')} />
      </div>
    </CompanyLayout>
  );
}

export default function CreateJobPage() {
  return (
    <ProtectedRoute requiredRole="company">
      <CreateJobContent />
    </ProtectedRoute>
  );
}
