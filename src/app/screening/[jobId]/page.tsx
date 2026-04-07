'use client';

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchScreeningResults, fetchScreeningStatus } from '@/store/slices/screeningSlice';
import { fetchJobById } from '@/store/slices/jobSlice';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { CardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/common/Skeleton';
import toast from 'react-hot-toast';

// Lazy load heavy components
const ShortlistTable = lazy(() => 
  import('@/components/screening/ShortlistTable').then(mod => ({ default: mod.ShortlistTable }))
);
const CandidateCard = lazy(() => 
  import('@/components/screening/CandidateCard').then(mod => ({ default: mod.CandidateCard }))
);
const ScoreDistributionChart = lazy(() => 
  import('@/components/screening/ScoreDistributionChart').then(mod => ({ default: mod.ScoreDistributionChart }))
);

export default function ScreeningResultsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const dispatch = useAppDispatch();

  const { currentJob } = useAppSelector((state) => state.jobs);
  const { results, session, loading } = useAppSelector((state) => state.screening);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'analytics'>('table');

  useEffect(() => {
    if (jobId) {
      dispatch(fetchJobById(jobId));
      dispatch(fetchScreeningResults({ jobId, limit: 20 }));
    }
  }, [dispatch, jobId]);

  useEffect(() => {
    if (session && session.status === 'processing') {
      const interval = setInterval(() => {
        dispatch(fetchScreeningStatus(session._id));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [session, dispatch]);

  const handleSelectCandidate = (applicantId: string) => {
    setSelectedApplicantId(applicantId);
    setViewMode('cards');
  };

  const handleExportCSV = async () => {
    if (currentJob && results.length > 0) {
      const { exportToCSV } = await import('@/utils/exportUtils');
      exportToCSV(results, currentJob.title);
      toast.success('CSV exported successfully');
    }
  };

  const handleExportPDF = async () => {
    if (currentJob && results.length > 0) {
      const { exportToPDF } = await import('@/utils/exportUtils');
      exportToPDF(results, currentJob);
      toast.success('PDF report generated successfully');
    }
  };

  const selectedResult = results.find((r) => {
    const id = typeof r.applicantId === 'string' ? r.applicantId : r.applicantId._id;
    return id === selectedApplicantId;
  });

  if (loading && results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" text="Loading screening results..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Button variant="secondary" onClick={() => router.back()} className="mb-4 sm:mb-6">
          ← Back to Job
        </Button>

        <Card className="mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Screening Results</h1>
              {currentJob && <p className="text-sm sm:text-base text-gray-600 truncate">{currentJob.title}</p>}
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'table' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="flex-1 sm:flex-none"
                >
                  Table
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="flex-1 sm:flex-none"
                >
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'analytics' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setViewMode('analytics')}
                  className="flex-1 sm:flex-none"
                >
                  Analytics
                </Button>
              </div>
              {results.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={handleExportCSV} className="flex-1 sm:flex-none">
                    <span className="hidden sm:inline">Export CSV</span>
                    <span className="sm:hidden">CSV</span>
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleExportPDF} className="flex-1 sm:flex-none">
                    <span className="hidden sm:inline">Export PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {session && (
            <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800">
                Status: <span className="font-semibold capitalize">{session.status}</span>
              </p>
              {session.status === 'processing' && (
                <p className="text-xs sm:text-sm text-blue-800 mt-1">
                  Progress: {session.processedApplicants} / {session.totalApplicants} applicants
                </p>
              )}
            </div>
          )}
        </Card>

        {results.length === 0 ? (
          <Card>
            <div className="text-center py-8 sm:py-12">
              <p className="text-base sm:text-lg text-gray-500">No screening results yet</p>
              <p className="text-sm text-gray-400 mt-2">Start screening to see results</p>
            </div>
          </Card>
        ) : viewMode === 'table' ? (
          <Card>
            <Suspense fallback={<TableSkeleton rows={10} />}>
              <ShortlistTable
                results={results}
                onSelectCandidate={handleSelectCandidate}
                sortBy="rank"
              />
            </Suspense>
          </Card>
        ) : viewMode === 'analytics' ? (
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Score Distribution</h2>
              <Suspense fallback={<ChartSkeleton />}>
                <ScoreDistributionChart results={results} />
              </Suspense>
            </Card>
            <Card>
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Summary Statistics</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{results.length}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Total Candidates</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {(results.reduce((sum, r) => sum + r.matchScore, 0) / results.length).toFixed(1)}%
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Average Score</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">
                    {results.filter((r) => r.evaluation.recommendation === 'highly_recommended').length}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Highly Recommended</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-orange-600">
                    {results.filter((r) => r.matchScore >= 80).length}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Score ≥ 80%</p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <Suspense fallback={
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            }>
              {results.map((result) => {
                const applicant = typeof result.applicantId === 'string' 
                  ? null // Should not happen if populated, but fallback
                  : result.applicantId;
                const applicantId = typeof result.applicantId === 'string' 
                  ? result.applicantId 
                  : result.applicantId._id;

                return (
                  <CandidateCard
                    key={result._id}
                    applicant={applicant as any}
                    result={result}
                    expanded={selectedApplicantId === applicantId}
                    onToggle={() =>
                      setSelectedApplicantId(
                        selectedApplicantId === applicantId ? null : applicantId
                      )
                    }
                  />
                );
              })}
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
