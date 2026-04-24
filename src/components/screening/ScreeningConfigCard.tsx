'use client';

import React from 'react';
import clsx from 'clsx';
import { Brain, ChevronDown, Play, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Job, ScreeningSession } from '@/types';
import { AIProviderStatus } from './AIProviderStatus';

interface ScreeningConfigCardProps {
  jobs: Job[];
  selectedJobId: string;
  onJobChange: (jobId: string) => void;
  topN: number;
  onTopNChange: (value: number) => void;
  minScore: number;
  onMinScoreChange: (value: number) => void;
  onStart: () => void;
  onRegenerate: () => void;
  starting: boolean;
  loading: boolean;
  isProcessing: boolean;
  resultsCount: number;
  session?: ScreeningSession | null;
  assessmentStatus?: {
    total: number;
    completed: number;
    pending: number;
    allCompleted: boolean;
    latestDueAt?: string | Date | null;
    dueDateReached?: boolean;
    canScreen?: boolean;
  } | null;
  assessmentStatusLoading?: boolean;
}

export function ScreeningConfigCard({
  jobs,
  selectedJobId,
  onJobChange,
  topN,
  onTopNChange,
  minScore,
  onMinScoreChange,
  onStart,
  onRegenerate,
  starting,
  loading,
  isProcessing,
  resultsCount,
  session,
  assessmentStatus,
  assessmentStatusLoading,
}: ScreeningConfigCardProps) {
  const batchSize = session?.options?.batchSize || 5;
  const showBatchBadge = Boolean(session?.options?.batchMode || resultsCount >= batchSize);
  const hasPendingAssessments = Boolean(assessmentStatus && assessmentStatus.total > 0 && assessmentStatus.pending > 0);
  const canScreen = assessmentStatus?.canScreen ?? !hasPendingAssessments;
  const dueAt = assessmentStatus?.latestDueAt ? new Date(assessmentStatus.latestDueAt) : null;
  const dueCountdown =
    dueAt && !assessmentStatus?.dueDateReached
      ? Math.max(0, Math.ceil((dueAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Brain size={16} className="text-indigo-600" />
        </div>
        <h2 className="text-base font-bold text-gray-900">Screening Configuration</h2>
        {showBatchBadge && (
          <div className="ml-auto relative group">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-600 border border-indigo-100">
              Batch mode active
            </span>
            <div className="absolute right-0 top-8 z-20 w-56 rounded-lg border border-indigo-100 bg-white p-2 text-[10px] text-gray-600 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
              {`Batch screening runs ${batchSize} candidates per AI request for faster, consistent scoring.`}
            </div>
          </div>
        )}
      </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Job Posting
            </label>
            <div className="relative">
              <select
                value={selectedJobId}
                onChange={(e) => onJobChange(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-700 focus:bg-white focus:border-indigo-300 outline-none transition-all"
              >
                <option value="">- Select a job -</option>
                {jobs
                  .filter((j) => j.status !== 'draft')
                  .map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title} ({job.applicantCount ?? 0} applicants)
                    </option>
                  ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Top N Candidates
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={topN}
              onChange={(e) => onTopNChange(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-indigo-300 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Min Score (0-100)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => onMinScoreChange(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-indigo-300 outline-none transition-all"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={onStart}
              disabled={!selectedJobId || starting || isProcessing || !canScreen}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {starting || isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isProcessing ? 'Processing...' : 'Starting...'}
                </>
              ) : (
                <>
                  <Play size={15} />
                  Run AI
                </>
              )}
            </button>
            {resultsCount > 0 && (
              <button
                onClick={onRegenerate}
                disabled={loading || isProcessing || !canScreen}
                className="px-3 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60"
                title="Re-run screening"
              >
                <RefreshCw size={15} />
              </button>
            )}
          </div>
        </div>

        {assessmentStatusLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            Checking quick test completion status...
          </div>
        )}

        {assessmentStatus && assessmentStatus.total > 0 && (
          <div
            className={clsx(
              'flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold',
              !canScreen ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
            )}
          >
            {!canScreen
              ? `Quick tests in progress: ${assessmentStatus.pending} pending. Screening unlocks when the due date is reached${dueCountdown ? ` (${dueCountdown}d remaining)` : ''}.`
              : assessmentStatus?.pending
              ? 'Quick test due date reached. You can run AI screening with submitted results.'
              : 'All quick tests completed. You can now run AI screening.'}
          </div>
        )}

        {/* AI Provider Status */}
        <div className="mt-4">
          <AIProviderStatus compact={true} />
        </div>

        {session && (
          <div
            className={clsx(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm',
              session.status === 'completed'
                ? 'bg-green-50 text-green-700'
                : session.status === 'processing'
                ? 'bg-blue-50 text-blue-700'
                : session.status === 'failed'
                ? 'bg-red-50 text-red-600'
                : 'bg-gray-50 text-gray-600'
            )}
          >
            {session.status === 'processing' && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {session.status === 'completed' && <CheckCircle2 size={16} />}
            {session.status === 'failed' && <XCircle size={16} />}
            {session.status === 'pending' && <Clock size={16} />}
            <span className="font-medium">
              {session.status === 'processing' &&
                `Processing ${session.processedApplicants} / ${session.totalApplicants} candidates...`}
              {session.status === 'completed' &&
                `Screening complete - ${session.processedApplicants} candidates evaluated`}
              {session.status === 'failed' && `Screening failed: ${session.error}`}
              {session.status === 'pending' && 'Screening queued, starting shortly...'}
            </span>
          </div>
        )}
    </div>
  );
}


