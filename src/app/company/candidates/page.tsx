'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchJobs } from '@/store/slices/jobSlice';
import { fetchApplicants, uploadApplicants, deleteApplicant } from '@/store/slices/applicantSlice';
import { startScreening, fetchScreeningStatus } from '@/store/slices/screeningSlice';
import { CompanyLayout } from '@/components/layout/CompanyLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import type { Applicant } from '@/types';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Upload,
  Users,
  Search,
  Trash2,
  FileText,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  ChevronLeft,
  Brain,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

function ApplicantCard({
  applicant,
  onDelete,
}: {
  applicant: Applicant;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {applicant.profile.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{applicant.profile.name}</p>
            <p className="text-xs text-gray-500 truncate">{applicant.profile.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <span
            className={clsx(
              'px-2 py-0.5 rounded-full text-[11px] font-semibold',
              applicant.source === 'upload'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-purple-100 text-purple-600'
            )}
          >
            {applicant.source === 'upload' ? 'CSV Upload' : 'Umurava'}
          </span>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => onDelete(applicant._id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Skills */}
      {(applicant.profile.skills?.length ?? 0) > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {applicant.profile.skills!.slice(0, 5).map((skill) => (
            <span
              key={`${skill.name}-${skill.level}-${skill.yearsOfExperience || 0}`}
              className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-md"
            >
              {skill.name}
            </span>
          ))}
          {applicant.profile.skills!.length > 5 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] font-medium rounded-md">
              +{applicant.profile.skills!.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-gray-50">
          {applicant.profile.bio && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Summary</p>
              <p className="text-sm text-gray-700">{applicant.profile.bio}</p>
            </div>
          )}
          {(applicant.profile.experience?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Experience</p>
              <div className="space-y-2">
                {applicant.profile.experience!.map((exp, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{exp.role}</p>
                      <p className="text-xs text-gray-500">
                        {exp.company}{exp.duration ? ` · ${exp.duration}` : exp.startDate ? ` · ${exp.startDate}${exp.endDate ? ` – ${exp.endDate}` : ''}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(applicant.profile.education?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Education</p>
              <div className="space-y-1">
                {applicant.profile.education!.map((edu, i) => (
                  <p key={i} className="text-sm text-gray-700">
                    {edu.degree} — {edu.institution}{edu.endYear ? `, ${edu.endYear}` : ''}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CandidatesContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedJobId = searchParams.get('jobId') || '';
  const { jobs } = useAppSelector((state) => state.jobs);
  const { applicants, loading, uploadProgress, uploadMeta } = useAppSelector((state) => state.applicants);
  const { session, loading: screeningLoading } = useAppSelector((state) => state.screening);
  const [selectedJobId, setSelectedJobId] = useState<string>(preselectedJobId);
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [screeningInProgress, setScreeningInProgress] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; candidateId: string; candidateName: string }>({
    isOpen: false,
    candidateId: '',
    candidateName: '',
  });
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  // Auto-select job from URL param once jobs are loaded
  useEffect(() => {
    if (preselectedJobId && jobs.length > 0) {
      setSelectedJobId(preselectedJobId);
    }
  }, [preselectedJobId, jobs]);

  useEffect(() => {
    if (selectedJobId) {
      dispatch(fetchApplicants({ jobId: selectedJobId }));
    }
  }, [dispatch, selectedJobId]);

  const handleFileUpload = async (file: File) => {
    if (!selectedJobId) {
      toast.error('Please select a job first');
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls', 'pdf'].includes(ext || '')) {
      toast.error('Please upload a CSV, Excel (.xlsx/.xls), or PDF file');
      return;
    }
    setUploading(true);
    try {
      const result = await dispatch(uploadApplicants({ jobId: selectedJobId, file })).unwrap();
      const createdCount = Array.isArray(result?.applicants) ? result.applicants.length : 0;
      const parsedCount = result?.meta?.parsed ?? createdCount;
      const duplicates = result?.meta?.duplicates ?? 0;
      toast.success(`Uploaded ${createdCount} candidates (${parsedCount} rows parsed, ${duplicates} duplicates)`);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDelete = async (id: string) => {
    const candidate = applicants.find(a => a._id === id);
    if (!candidate) return;
    
    setDeleteModal({
      isOpen: true,
      candidateId: id,
      candidateName: candidate.profile.name,
    });
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await dispatch(deleteApplicant(deleteModal.candidateId)).unwrap();
      toast.success('Candidate removed successfully');
      setDeleteModal({ isOpen: false, candidateId: '', candidateName: '' });
    } catch {
      toast.error('Failed to remove candidate');
    } finally {
      setDeleting(false);
    }
  };

  const handleStartScreening = async () => {
    if (!selectedJobId) {
      toast.error('Please select a job first');
      return;
    }

    if (applicants.length === 0) {
      toast.error('No candidates to screen. Please upload candidates first.');
      return;
    }

    try {
      setScreeningInProgress(true);
      const screeningSession = await dispatch(startScreening({ 
        jobId: selectedJobId,
        options: {
          topN: Math.min(applicants.length, 20), // Screen up to 20 candidates
          minScore: 0
        }
      })).unwrap();

      toast.success('AI screening started! This may take a few minutes...');

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const updatedSession = await dispatch(fetchScreeningStatus(screeningSession._id)).unwrap();
          
          if (updatedSession.status === 'completed') {
            clearInterval(pollInterval);
            setScreeningInProgress(false);
            toast.success('AI screening completed! Redirecting to results...');
            router.push(`/company/screening?jobId=${selectedJobId}`);
          } else if (updatedSession.status === 'failed') {
            clearInterval(pollInterval);
            setScreeningInProgress(false);
            toast.error('Screening failed: ' + (updatedSession.error || 'Unknown error'));
          }
          // Session data is automatically updated in Redux store by fetchScreeningStatus
        } catch (error) {
          console.error('Error polling screening status:', error);
        }
      }, 3000);

      // Cleanup interval after 10 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (screeningInProgress) {
          setScreeningInProgress(false);
          toast.error('Screening timeout. Please check the screening page for results.');
        }
      }, 600000);

    } catch (error: any) {
      setScreeningInProgress(false);
      toast.error(error.message || 'Failed to start screening');
    }
  };

  const filtered = applicants.filter(
    (a) =>
      !search ||
      a.profile.name.toLowerCase().includes(search.toLowerCase()) ||
      a.profile.email.toLowerCase().includes(search.toLowerCase()) ||
      (a.profile.skills ?? []).some((skill) => skill.name.toLowerCase().includes(search.toLowerCase()))
  );

  const activeJobs = jobs.filter((j) => j.status === 'active' || j.status === 'draft');
  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  return (
    <CompanyLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            {preselectedJobId && (
              <button
                onClick={() => router.push(`/jobs/${preselectedJobId}`)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors mb-3"
              >
                <ChevronLeft size={16} />
                Back to Job
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
            <p className="text-sm text-gray-500 mt-1">
              Upload and manage candidates for your job postings
            </p>
          </div>
        </div>

        {/* Job Selector */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Job Posting
          </label>
          <div className="relative max-w-sm">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-700 focus:bg-white focus:border-blue-500 outline-none transition-all"
            >
              <option value="">— Choose a job —</option>
              {activeJobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          {activeJobs.length === 0 && (
            <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle size={12} />
              No active jobs yet. Post a job first to add candidates.
            </p>
          )}
        </div>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            'bg-white rounded-2xl border-2 border-dashed transition-colors cursor-pointer p-10 text-center',
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          {uploading ? (
            <div>
              <div className="inline-block w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-semibold text-blue-700">Uploading candidates...</p>
              {uploadProgress > 0 && (
                <div className="mt-3 max-w-xs mx-auto">
                  <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : uploadMeta ? (
            <div className="space-y-2">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={22} className="text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-emerald-700">
                Upload summary: {uploadMeta.created} created, {uploadMeta.parsed} parsed, {uploadMeta.duplicates} duplicates
              </p>
              <p className="text-xs text-gray-400">Candidates are now available for AI screening.</p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload size={22} className="text-blue-500" />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                Drag & drop your file here, or{' '}
                <span className="text-blue-600">click to browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">Supports CSV, Excel (.xlsx/.xls), and PDF</p>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <FileText size={12} />
                  CSV / Excel / PDF
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle size={12} className="text-green-500" />
                  Auto-parsed profiles
                </span>
              </div>
            </>
          )}
        </div>

        {/* Candidates List */}
        {selectedJobId && (
          <div className="space-y-4">
            {/* Screening Progress Card */}
            {screeningInProgress && session && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      AI Screening in Progress
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Our AI is analyzing {applicants.length} candidate{applicants.length !== 1 ? 's' : ''} and matching them against job requirements. 
                      This typically takes 2-5 minutes.
                    </p>
                    
                    {/* Progress Bar */}
                    {session.totalApplicants && session.processedApplicants !== undefined && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Progress: {session.processedApplicants} / {session.totalApplicants}</span>
                          <span>{Math.round((session.processedApplicants / session.totalApplicants) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${(session.processedApplicants / session.totalApplicants) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* AI Provider Status */}
                    {session.aiProviderStatus && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                          <span className="text-blue-600">
                            Using {session.aiProviderStatus.currentProvider === 'gemini' ? 'Gemini AI' : 'DeepSeek (OpenRouter)'}
                          </span>
                        </div>
                        
                        {/* Show fallback information */}
                        {session.aiProviderStatus.fallbackCount > 0 && (
                          <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                            {session.aiProviderStatus.geminiQuotaExhausted 
                              ? '⚠️ Gemini quota reached, switched to DeepSeek for continued processing'
                              : `⚠️ Switched to backup AI provider (${session.aiProviderStatus.fallbackCount} times)`
                            }
                          </div>
                        )}
                        
                        {/* Show OpenRouter errors */}
                        {session.aiProviderStatus.openrouterErrors > 0 && (
                          <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-md">
                            ⚠️ Backup AI provider encountered {session.aiProviderStatus.openrouterErrors} error{session.aiProviderStatus.openrouterErrors !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {screeningInProgress && !session && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      AI Screening in Progress
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Our AI is analyzing {applicants.length} candidate{applicants.length !== 1 ? 's' : ''} and matching them against job requirements. 
                      This typically takes 2-5 minutes.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                      <span>Processing profiles and generating match scores...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-500" />
                <h2 className="text-base font-semibold text-gray-900">
                  Candidates
                  {selectedJob && (
                    <span className="text-gray-400 font-normal ml-1">— {selectedJob.title}</span>
                  )}
                </h2>
                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                  {applicants.length}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* AI Screening Button */}
                {applicants.length > 0 && (
                  <button
                    onClick={handleStartScreening}
                    disabled={screeningInProgress || screeningLoading}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200',
                      screeningInProgress || screeningLoading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:scale-105'
                    )}
                  >
                    {screeningInProgress || screeningLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        <span>Screening...</span>
                      </>
                    ) : (
                      <>
                        <Brain size={16} />
                        <span>AI Screen</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                )}
                
                {/* Search Input */}
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search name, email, skills..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-all"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="mt-3 text-sm text-gray-500">Loading candidates...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 bg-white rounded-2xl border border-gray-100 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {search ? 'No candidates match your search' : 'No candidates yet'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {!search && 'Upload a CSV file above to add candidates'}
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filtered.map((applicant) => (
                  <ApplicantCard
                    key={applicant._id}
                    applicant={applicant}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, candidateId: '', candidateName: '' })}
        onConfirm={confirmDelete}
        title="Remove Candidate"
        message={`Are you sure you want to remove ${deleteModal.candidateName} from this job? This action cannot be undone.`}
        confirmText="Remove Candidate"
        cancelText="Keep Candidate"
        type="danger"
        loading={deleting}
      />
    </CompanyLayout>
  );
}

export default function CompanyCandidatesPage() {
  return (
    <ProtectedRoute requiredRole="company">
      <Suspense fallback={null}>
        <CandidatesContent />
      </Suspense>
    </ProtectedRoute>
  );
}
