'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchJobs } from '@/store/slices/jobSlice';
import {
  fetchScreeningResults,
  startScreening,
  regenerateScreening,
  fetchScreeningStatus,
} from '@/store/slices/screeningSlice';
import { CompanyLayout } from '@/components/layout/CompanyLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ScreeningResult, Recommendation } from '@/types';
import {
  Brain,
  Play,
  RefreshCw,
  ChevronDown,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Zap,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const RECOMMENDATION_CONFIG: Record<
  Recommendation,
  { label: string; color: string; icon: React.ReactNode }
> = {
  highly_recommended: {
    label: 'Highly Recommended',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 size={13} className="inline mr-1" />,
  },
  recommended: {
    label: 'Recommended',
    color: 'bg-blue-100 text-blue-700',
    icon: <Star size={13} className="inline mr-1" />,
  },
  consider: {
    label: 'Consider',
    color: 'bg-yellow-100 text-yellow-700',
    icon: <AlertTriangle size={13} className="inline mr-1" />,
  },
  not_recommended: {
    label: 'Not Recommended',
    color: 'bg-red-100 text-red-600',
    icon: <XCircle size={13} className="inline mr-1" />,
  },
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500 font-medium">{label}</span>
        <span className="font-bold text-gray-700">{value}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-700',
            value >= 75 ? 'bg-green-500' : value >= 50 ? 'bg-blue-500' : 'bg-yellow-400'
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ResultCard({
  result,
  rank,
}: {
  result: ScreeningResult;
  rank: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = RECOMMENDATION_CONFIG[result.evaluation.recommendation];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Rank badge */}
        <div
          className={clsx(
            'w-9 h-9 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0',
            rank === 1
              ? 'bg-yellow-100 text-yellow-600'
              : rank === 2
              ? 'bg-gray-100 text-gray-600'
              : rank === 3
              ? 'bg-orange-100 text-orange-600'
              : 'bg-indigo-50 text-indigo-600'
          )}
        >
          #{rank}
        </div>

        {/* Applicant info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-gray-900">Candidate #{result.applicantId.slice(-6)}</p>
            <span className={clsx('px-2 py-0.5 rounded-full text-[11px] font-semibold', cfg.color)}>
              {cfg.icon}
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{result.evaluation.reasoning}</p>
        </div>

        {/* Score ring */}
        <div className="flex-shrink-0 text-right">
          <div
            className={clsx(
              'text-2xl font-black leading-none',
              result.matchScore >= 75
                ? 'text-green-600'
                : result.matchScore >= 50
                ? 'text-blue-600'
                : 'text-yellow-600'
            )}
          >
            {result.matchScore}
          </div>
          <div className="text-[10px] text-gray-400 font-medium">/100</div>
        </div>

        <ChevronDown
          size={16}
          className={clsx(
            'text-gray-400 flex-shrink-0 transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-4">
          {/* Score breakdown */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Score Breakdown
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <ScoreBar label="Skills Match" value={result.scoreBreakdown.skills} />
              <ScoreBar label="Experience" value={result.scoreBreakdown.experience} />
              <ScoreBar label="Education" value={result.scoreBreakdown.education} />
              <ScoreBar label="Relevance" value={result.scoreBreakdown.relevance} />
            </div>
          </div>

          {/* Strengths */}
          {result.evaluation.strengths.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">
                Strengths
              </p>
              <ul className="space-y-1">
                {result.evaluation.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-green-500 mt-0.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gaps */}
          {result.evaluation.gaps.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wider mb-2">
                Gaps
              </p>
              <ul className="space-y-1">
                {result.evaluation.gaps.map((g, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <AlertTriangle size={13} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {result.evaluation.risks.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">
                Risks
              </p>
              <ul className="space-y-1">
                {result.evaluation.risks.map((r, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <XCircle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScreeningContent() {
  const dispatch = useAppDispatch();
  const { jobs } = useAppSelector((state) => state.jobs);
  const { results, session, loading } = useAppSelector((state) => state.screening);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [topN, setTopN] = useState(10);
  const [minScore, setMinScore] = useState(0);
  const [starting, setStarting] = useState(false);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  // Poll session status when in_progress
  useEffect(() => {
    if (!session || session.status !== 'processing') return;
    setPolling(true);
    const interval = setInterval(async () => {
      const updated = await dispatch(fetchScreeningStatus(session._id)).unwrap();
      if (updated.status === 'completed') {
        clearInterval(interval);
        setPolling(false);
        dispatch(fetchScreeningResults({ jobId: updated.jobId }));
        toast.success('AI screening complete!');
      } else if (updated.status === 'failed') {
        clearInterval(interval);
        setPolling(false);
        toast.error('Screening failed: ' + (updated.error || 'Unknown error'));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [session, dispatch]);

  useEffect(() => {
    if (selectedJobId) {
      dispatch(fetchScreeningResults({ jobId: selectedJobId }));
    }
  }, [dispatch, selectedJobId]);

  const handleStartScreening = async () => {
    if (!selectedJobId) {
      toast.error('Select a job first');
      return;
    }
    setStarting(true);
    try {
      await dispatch(
        startScreening({
          jobId: selectedJobId,
          options: { topN, minScore },
        })
      ).unwrap();
      toast.success('AI screening started');
    } catch (err: any) {
      toast.error(err.message || 'Failed to start screening');
    } finally {
      setStarting(false);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedJobId) return;
    try {
      await dispatch(regenerateScreening({ jobId: selectedJobId })).unwrap();
      toast.success('Re-screening started');
    } catch (err: any) {
      toast.error(err.message || 'Failed to regenerate screening');
    }
  };

  const selectedJob = jobs.find((j) => j._id === selectedJobId);
  const isProcessing = session?.status === 'processing' || polling;

  const summaryStats = {
    highly_recommended: results.filter(
      (r) => r.evaluation.recommendation === 'highly_recommended'
    ).length,
    recommended: results.filter((r) => r.evaluation.recommendation === 'recommended').length,
    consider: results.filter((r) => r.evaluation.recommendation === 'consider').length,
    not_recommended: results.filter(
      (r) => r.evaluation.recommendation === 'not_recommended'
    ).length,
    avgScore:
      results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.matchScore, 0) / results.length)
        : 0,
  };

  return (
    <CompanyLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Screening</h1>
          <p className="text-sm text-gray-500 mt-1">
            Let Gemini AI rank and evaluate your candidates automatically
          </p>
        </div>

        {/* Config Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Brain size={16} className="text-indigo-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Screening Configuration</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Job Select */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Job Posting
              </label>
              <div className="relative">
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-700 focus:bg-white focus:border-indigo-300 outline-none transition-all"
                >
                  <option value="">— Select a job —</option>
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

            {/* Top N */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Top N Candidates
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-indigo-300 outline-none transition-all"
              />
            </div>

            {/* Min Score */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Min Score (0–100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-indigo-300 outline-none transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex items-end gap-2">
              <button
                onClick={handleStartScreening}
                disabled={!selectedJobId || starting || isProcessing}
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
              {results.length > 0 && (
                <button
                  onClick={handleRegenerate}
                  disabled={loading || isProcessing}
                  className="px-3 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60"
                  title="Re-run screening"
                >
                  <RefreshCw size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Session status banner */}
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
                  `Screening complete — ${session.processedApplicants} candidates evaluated`}
                {session.status === 'failed' && `Screening failed: ${session.error}`}
                {session.status === 'pending' && 'Screening queued, starting shortly...'}
              </span>
            </div>
          )}
        </div>

        {/* Summary stats (only when results exist) */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(
              [
                {
                  label: 'Avg Score',
                  value: summaryStats.avgScore,
                  color: 'text-indigo-600',
                  bg: 'bg-indigo-50',
                  icon: <BarChart3 size={16} className="text-indigo-500" />,
                },
                {
                  label: 'Highly Rec.',
                  value: summaryStats.highly_recommended,
                  color: 'text-green-600',
                  bg: 'bg-green-50',
                  icon: <CheckCircle2 size={16} className="text-green-500" />,
                },
                {
                  label: 'Recommended',
                  value: summaryStats.recommended,
                  color: 'text-blue-600',
                  bg: 'bg-blue-50',
                  icon: <Star size={16} className="text-blue-500" />,
                },
                {
                  label: 'Consider',
                  value: summaryStats.consider,
                  color: 'text-yellow-600',
                  bg: 'bg-yellow-50',
                  icon: <AlertTriangle size={16} className="text-yellow-500" />,
                },
                {
                  label: 'Not Rec.',
                  value: summaryStats.not_recommended,
                  color: 'text-red-600',
                  bg: 'bg-red-50',
                  icon: <XCircle size={16} className="text-red-400" />,
                },
              ] as const
            ).map((stat) => (
              <div
                key={stat.label}
                className={clsx(
                  'rounded-2xl p-4 flex flex-col items-start gap-1',
                  stat.bg
                )}
              >
                {stat.icon}
                <p className={clsx('text-2xl font-black leading-tight', stat.color)}>
                  {stat.value}
                  {stat.label === 'Avg Score' && <span className="text-sm font-medium">/100</span>}
                </p>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Results List */}
        {selectedJobId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-indigo-500" />
                <h2 className="text-base font-semibold text-gray-900">
                  Ranked Results
                  {selectedJob && (
                    <span className="text-gray-400 font-normal ml-1">— {selectedJob.title}</span>
                  )}
                </h2>
                {results.length > 0 && (
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                    {results.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <TrendingUp size={12} />
                Sorted by AI score
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="mt-3 text-sm text-gray-500">Loading results...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="py-16 bg-white rounded-2xl border border-gray-100 text-center">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain size={24} className="text-indigo-400" />
                </div>
                <p className="text-sm font-semibold text-gray-700">No screening results yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Make sure candidates are uploaded, then click Run AI
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...results]
                  .sort((a, b) => a.rank - b.rank)
                  .map((result) => (
                    <ResultCard key={result._id} result={result} rank={result.rank} />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </CompanyLayout>
  );
}

export default function CompanyScreeningPage() {
  return (
    <ProtectedRoute requiredRole="company">
      <ScreeningContent />
    </ProtectedRoute>
  );
}
