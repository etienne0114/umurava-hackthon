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
      <div className="max-w-5xl mx-auto pb-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Post New Job</h1>
            <p className="text-sm text-gray-500 mt-1">Configure your ideal candidate profile and scoring strategy</p>
          </div>
          <button 
            onClick={() => router.push('/company/jobs')}
            className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
          >
            &larr; Back to Listings
          </button>
        </div>
        
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
          <JobForm onSubmit={handleSubmit} onCancel={() => router.push('/company/jobs')} />
        </div>
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
