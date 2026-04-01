'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchJobById } from '@/store/slices/jobSlice';
import { fetchApplicants } from '@/store/slices/applicantSlice';
import { startScreening } from '@/store/slices/screeningSlice';
import { TalentLayout } from '@/components/layout/TalentLayout';
import { CompanyLayout } from '@/components/layout/CompanyLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Loader } from '@/components/common/Loader';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import apiClient from '@/store/api/apiClient';
import toast from 'react-hot-toast';
import {
  MapPin,
  Clock,
  Globe,
  Briefcase,
  ChevronLeft,
  Zap,
  Upload,
  BarChart2,
  CheckCircle,
} from 'lucide-react';

function Tag({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
      <Icon size={13} className="text-gray-400" />
      {text}
    </div>
  );
}

function JobDetailContent() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const dispatch = useAppDispatch();

  const { currentJob, loading: jobLoading } = useAppSelector((state) => state.jobs);
  const { applicants, loading: applicantsLoading } = useAppSelector((state) => state.applicants);
  const { session, loading: screeningLoading } = useAppSelector((state) => state.screening);
  const { user } = useAppSelector((state) => state.auth);
  const isCompany = user?.role === 'company';

  useEffect(() => {
    if (jobId) {
      dispatch(fetchJobById(jobId));
      if (isCompany) dispatch(fetchApplicants({ jobId }));
    }
  }, [dispatch, jobId, isCompany]);

  const handleApply = async () => {
    try {
      await apiClient.post(`/talent/apply/${jobId}`);
      toast.success('Application submitted!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to apply');
    }
  };

  const handleStartScreening = async () => {
    try {
      await dispatch(startScreening({ jobId, options: { topN: 20, minScore: 0 } })).unwrap();
      toast.success('AI Screening started!');
      router.push(`/company/screening`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to start screening');
    }
  };

  if (jobLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader size="lg" text="Loading job..." />
      </div>
    );
  }

  if (!currentJob) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      {/* Job header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
              <Briefcase size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{currentJob.title}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{currentJob.company || 'Umurava'}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Tag icon={Clock} text={currentJob.employmentType?.replace('-', ' ') || 'Full-time'} />
                <Tag icon={Globe} text={currentJob.workMode?.replace('-', ' ') || 'On-site'} />
                {currentJob.requirements?.location && (
                  <Tag icon={MapPin} text={currentJob.requirements.location} />
                )}
              </div>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
              currentJob.status === 'active'
                ? 'bg-green-100 text-green-700'
                : currentJob.status === 'draft'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {currentJob.status.charAt(0).toUpperCase() + currentJob.status.slice(1)}
          </span>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-5">{currentJob.description}</p>

        {/* Skills */}
        {currentJob.requirements?.skills?.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {currentJob.requirements.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        <div className="mb-5">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Experience</h3>
          <p className="text-sm text-gray-700">
            {currentJob.requirements?.experience?.minYears}
            {currentJob.requirements?.experience?.maxYears
              ? `–${currentJob.requirements.experience.maxYears}`
              : '+'}
            {' '}years
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
          {isCompany ? (
            <>
              <button
                onClick={() => router.push(`/company/candidates`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Upload size={15} />
                Upload Candidates
              </button>
              <button
                onClick={handleStartScreening}
                disabled={currentJob.applicantCount === 0 || screeningLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap size={15} />
                {screeningLoading ? 'Starting...' : 'Run AI Screening'}
              </button>
              {currentJob.screeningStatus === 'completed' && (
                <button
                  onClick={() => router.push(`/company/screening`)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
                >
                  <BarChart2 size={15} />
                  View Results
                </button>
              )}
              <button
                onClick={() => router.push(`/jobs/${jobId}/edit`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Edit Job
              </button>
            </>
          ) : (
            <button
              onClick={handleApply}
              disabled={currentJob.status !== 'active'}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <CheckCircle size={15} />
              {currentJob.status === 'active' ? 'Apply Now' : 'Applications Closed'}
            </button>
          )}
        </div>
      </div>

      {/* Applicants list (company only) */}
      {isCompany && (
        <Card>
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Applicants
            <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
              {currentJob.applicantCount ?? 0}
            </span>
          </h2>

          {applicantsLoading ? (
            <div className="py-8 flex justify-center">
              <Loader text="Loading applicants..." />
            </div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Briefcase size={32} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm font-medium">No applicants yet</p>
              <button
                onClick={() => router.push('/company/candidates')}
                className="mt-3 text-indigo-600 text-sm font-semibold hover:underline"
              >
                Upload candidates →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {applicants.map((a) => (
                <div
                  key={a._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                    {a.profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{a.profile.name}</p>
                    <p className="text-xs text-gray-400 truncate">{a.profile.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 hidden sm:flex">
                    {a.profile.skills.slice(0, 3).map(s => (
                      <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-semibold rounded-md">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function JobDetailWithLayout() {
  const { user } = useAppSelector((state) => state.auth);

  if (user?.role === 'company') {
    return (
      <CompanyLayout>
        <JobDetailContent />
      </CompanyLayout>
    );
  }

  return (
    <TalentLayout>
      <JobDetailContent />
    </TalentLayout>
  );
}

export default function JobDetailsPage() {
  return (
    <ProtectedRoute>
      <JobDetailWithLayout />
    </ProtectedRoute>
  );
}
