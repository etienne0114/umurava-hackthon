'use client';

import React, { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileUploader } from '@/components/applicants/FileUploader';
import { UmuravaImporter } from '@/components/applicants/UmuravaImporter';
import { QuickLogin } from '@/components/auth/QuickLogin';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { Applicant } from '@/types';
import toast from 'react-hot-toast';

function UploadApplicantsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!jobId) {
      toast.error('Job ID is required');
      router.push('/jobs');
    }
  }, [jobId, router]);

  const handleLoginSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleUploadComplete = (applicants: Applicant[]) => {
    toast.success(`Successfully imported ${applicants.length} applicants`);
    router.push(`/jobs/${jobId}`);
  };

  const handleImportComplete = (applicants: Applicant[]) => {
    toast.success(`Successfully imported ${applicants.length} profiles from Platform`);
    router.push(`/jobs/${jobId}`);
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  if (!jobId) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Button variant="secondary" onClick={() => router.back()} className="mb-4 sm:mb-6">
          ← Back to Job
        </Button>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Upload Applicants</h1>

        {/* Quick Login for Testing */}
        <QuickLogin onLoginSuccess={handleLoginSuccess} />

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 max-w-6xl">
        <FileUploader
          key={refreshKey}
          jobId={jobId}
          maxSize={10 * 1024 * 1024}
          onUploadComplete={handleUploadComplete}
          onError={handleError}
        />

          <UmuravaImporter
            jobId={jobId}
            onImportComplete={handleImportComplete}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  );
}

export default function UploadApplicantsPage() {
  return (
    <Suspense fallback={<Loader size="lg" text="Loading..." />}>
      <UploadApplicantsContent />
    </Suspense>
  );
}
