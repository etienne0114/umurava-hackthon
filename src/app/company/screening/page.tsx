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

function ResultRow({
  result,
  rank,
  jobTitle,
}: {
  result: ScreeningResult;
  rank: number;
  jobTitle?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = RECOMMENDATION_CONFIG[result.evaluation.recommendation];
  const applicant = typeof result.applicantId === 'object' ? result.applicantId : null;

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    const email = applicant?.profile?.email;
    if (email) {
      window.location.href = `mailto:${email}?subject=Job Application: ${jobTitle || 'Opportunity'} at Umurava`;
      toast.success(`Opening mail client for ${applicant?.profile?.name || 'candidate'}...`);
    } else {
      toast.error('Candidate email contact not found');
    }
  };

  return (
    <>
      <tr 
        className={clsx(
          "group cursor-pointer transition-all hover:bg-gray-50",
          expanded ? "bg-gray-50/80" : "bg-white"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Rank */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={clsx(
            "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm",
            rank === 1 ? "bg-yellow-100 text-yellow-700 shadow-yellow-100/50" :
            rank === 2 ? "bg-slate-100 text-slate-700" :
            rank === 3 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-400"
          )}>
            #{rank}
          </div>
        </td>

        {/* Candidate */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {applicant?.profile?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">
                {applicant?.profile?.name || `Candidate #${result._id.slice(-6)}`}
              </p>
              <p className="text-[11px] text-gray-400 font-medium mt-1 uppercase tracking-tighter">
                {applicant?.source === 'umurava' ? 'Platform Talent' : 'Manual Upload'}
              </p>
            </div>
          </div>
        </td>

        {/* Match Score */}
        <td className="px-6 py-4 whitespace-nowrap w-48">
          <div className="space-y-1.5">
            <div className="flex justify-between items-end">
              <span className={clsx(
                "text-sm font-black",
                result.matchScore >= 75 ? "text-emerald-600" :
                result.matchScore >= 50 ? "text-blue-600" : "text-amber-600"
              )}>
                {result.matchScore}%
              </span>
              <span className="text-[10px] text-gray-300 font-bold uppercase">Similarity</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={clsx(
                  "h-full rounded-full transition-all duration-1000 ease-out",
                  result.matchScore >= 75 ? "bg-emerald-500" :
                  result.matchScore >= 50 ? "bg-blue-500" : "bg-amber-500"
                )}
                style={{ width: `${result.matchScore}%` }}
              />
            </div>
          </div>
        </td>

        {/* Recommendation */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={clsx(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm whitespace-nowrap",
            cfg.color
          )}>
            {cfg.icon}
            {cfg.label}
          </span>
        </td>

        {/* Action */}
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <button className="p-2 rounded-xl text-gray-400 hover:bg-white hover:text-indigo-600 transition-all shadow-none hover:shadow-sm">
            <ChevronDown 
              size={18} 
              className={clsx("transition-transform duration-300", expanded && "rotate-180")} 
            />
          </button>
        </td>
      </tr>

      {/* Expanded Details Panel */}
      {expanded && (
        <tr>
          <td colSpan={5} className="px-6 py-8 bg-white border-t border-gray-100 shadow-inner">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column: AI Reasoning */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <Brain size={14} className="text-indigo-500" />
                    AI Match Reasoning
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-6 rounded-2xl border border-gray-100 transition-all group-hover:bg-white">
                    {result.evaluation.reasoning}
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle2 size={12} />
                      Key Strengths
                    </h5>
                    <ul className="space-y-2">
                      {result.evaluation.strengths.slice(0, 4).map((s, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                      <AlertTriangle size={12} />
                      Potential Gaps
                    </h5>
                    <ul className="space-y-2">
                      {result.evaluation.gaps.slice(0, 4).map((g, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
                      <XCircle size={12} />
                      Risk Factors
                    </h5>
                    <ul className="space-y-2">
                      {result.evaluation.risks.slice(0, 4).map((r, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Column: Score Metrics */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <BarChart3 size={14} className="text-indigo-500" />
                  Performance Metrics
                </h4>
                <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 space-y-5 transition-all group-hover:bg-white">
                  <ScoreBar label="Skills Match" value={result.scoreBreakdown.skills} />
                  <ScoreBar label="Professional Experience" value={result.scoreBreakdown.experience} />
                  <ScoreBar label="Education Background" value={result.scoreBreakdown.education} />
                  <ScoreBar label="Market Relevance" value={result.scoreBreakdown.relevance} />
                </div>
                
                <button 
                  onClick={handleContact}
                  className="w-full py-3 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 active:scale-95"
                >
                  Contact Candidate
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function ScreeningContent() {
  const dispatch = useAppDispatch();
  const { jobs } = useAppSelector((state) => state.jobs);
  const { results, session, loading } = useAppSelector((state) => state.screening);
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialJobId = searchParams?.get('jobId') || '';

  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [topN, setTopN] = useState(10);
  const [minScore, setMinScore] = useState(0);
  const [starting, setStarting] = useState(false);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  // Update selection if URL changes
  useEffect(() => {
    if (initialJobId && initialJobId !== selectedJobId) {
      setSelectedJobId(initialJobId);
    }
  }, [initialJobId]);

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
      <div className="max-w-7xl mx-auto space-y-8 px-4 pb-12">
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {(
              [
                {
                  label: 'Average Match',
                  value: `${summaryStats.avgScore}%`,
                  color: 'text-gray-900',
                  icon: <BarChart3 size={18} className="text-indigo-500" />,
                },
                {
                  label: 'Highly Rec.',
                  value: summaryStats.highly_recommended,
                  color: 'text-gray-900',
                  icon: <CheckCircle2 size={18} className="text-emerald-500" />,
                },
                {
                  label: 'Recommended',
                  value: summaryStats.recommended,
                  color: 'text-gray-900',
                  icon: <Star size={18} className="text-blue-500" />,
                },
                {
                  label: 'Consider',
                  value: summaryStats.consider,
                  color: 'text-gray-900',
                  icon: <AlertTriangle size={18} className="text-amber-500" />,
                },
                {
                  label: 'Not Rec.',
                  value: summaryStats.not_recommended,
                  color: 'text-gray-900',
                  icon: <XCircle size={18} className="text-rose-400" />,
                },
              ] as const
            ).map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-indigo-100 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-indigo-50 transition-colors">
                    {stat.icon}
                  </div>
                  <TrendingUp size={14} className="text-gray-200" />
                </div>
                <p className={clsx('text-2xl font-black tracking-tight', stat.color)}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                  {stat.label}
                </p>
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
              <div className="py-24 text-center">
                <div className="inline-block w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-lg" />
                <p className="mt-4 text-sm font-bold text-slate-800 tracking-tight">AI is ranking candidates...</p>
                <p className="text-xs text-gray-400 mt-1">This takes about 10-15 seconds per 5 candidates</p>
              </div>
            ) : results.length === 0 ? (
              <div className="py-24 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Brain size={32} className="text-indigo-400" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Start Your First AI Screening</h3>
                <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                  Automatically rank your candidates based on real job requirements using Gemini 1.5 Pro.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ring-1 ring-gray-200/50">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase text-[10px] font-black tracking-[0.2em]">
                        <th className="px-6 py-5">Rank</th>
                        <th className="px-6 py-5">Candidate</th>
                        <th className="px-6 py-5">AI Match</th>
                        <th className="px-6 py-5">Recommendation</th>
                        <th className="px-6 py-4 text-right">Options</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 italic-none">
                      {results
                        .slice()
                        .sort((a, b) => a.rank - b.rank)
                        .map((result) => (
                          <ResultRow 
                            key={result._id} 
                            result={result} 
                            rank={result.rank} 
                            jobTitle={selectedJob?.title}
                          />
                        ))}
                    </tbody>
                  </table>
                </div>
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
