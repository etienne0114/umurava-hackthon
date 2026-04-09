'use client';

import React, { useEffect, useRef, useState } from 'react';
import apiClient from '@/store/api/apiClient';
import { Assessment, Job } from '@/types';
import { ClipboardCheck, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Loader } from '@/components/common/Loader';
import { Card } from '@/components/common/Card';

function getAssessmentJob(assessment: Assessment): Job | null {
  return typeof assessment.jobId === 'object' ? (assessment.jobId as Job) : null;
}

export function QuickTestsBoard() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [draftSelections, setDraftSelections] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const autoSubmittedRef = useRef(false);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/assessments/my');
      if (res.data.success) {
        setAssessments(res.data.data || []);
      }
    } catch {
      toast.error('Failed to load quick tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  const openAssessment = async (assessment: Assessment) => {
    const initialSelections = assessment.questions.map((q) => {
      const existing = assessment.candidateAnswers?.find((a) => a.question === q.question);
      if (typeof existing?.selectedOptionIndex === 'number') return existing.selectedOptionIndex;
      if (existing?.answer && Array.isArray(q.options)) {
        return q.options.findIndex((opt) => opt === existing.answer);
      }
      return -1;
    });

    setSelectedAssessment(assessment);
    setDraftSelections(initialSelections);
    setStartedAt(assessment.startedAt || null);
    setTimeLeft(null);
    autoSubmittedRef.current = false;

    if (assessment.status !== 'completed') {
      try {
        setStarting(true);
        const res = await apiClient.post(`/assessments/my/${assessment._id}/start`);
        const data = res.data?.data || {};
        const started = data.startedAt || assessment.startedAt || new Date().toISOString();
        setStartedAt(started);
        const totalSeconds =
          data.timeLimitSeconds ||
          assessment.timeLimitSeconds ||
          assessment.questions.length * (assessment.timePerQuestionSeconds || 60);
        setTimeLeft(totalSeconds);
      } catch {
        toast.error('Failed to start the quick test timer');
      } finally {
        setStarting(false);
      }
    }
  };

  const submitAssessment = async (autoSubmit: boolean = false) => {
    if (!selectedAssessment) return;

    if (!autoSubmit) {
      const hasEmpty = draftSelections.some((idx) => idx === -1 || idx === undefined);
      if (hasEmpty) {
        toast.error('Please answer all questions before submitting');
        return;
      }
    }

    try {
      setSubmitting(true);
      await apiClient.post(`/assessments/my/${selectedAssessment._id}/submit`, {
        answers: selectedAssessment.questions.map((q, idx) => ({
          question: q.question,
          answer: Array.isArray(q.options) && draftSelections[idx] >= 0 ? q.options[draftSelections[idx]] : '',
          selectedOptionIndex: draftSelections[idx] >= 0 ? draftSelections[idx] : undefined,
        })),
        autoSubmit,
      });
      toast.success(autoSubmit ? 'Time is up. Quick test submitted.' : 'Quick test submitted successfully');
      setSelectedAssessment(null);
      setStartedAt(null);
      setTimeLeft(null);
      await loadAssessments();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit quick test');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!selectedAssessment || selectedAssessment.status === 'completed' || !startedAt) return;
    const totalSeconds =
      selectedAssessment.timeLimitSeconds ||
      selectedAssessment.questions.length * (selectedAssessment.timePerQuestionSeconds || 60);
    const startTime = new Date(startedAt).getTime();

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        submitAssessment(true);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [selectedAssessment, startedAt]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null || Number.isNaN(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const pending = assessments.filter((a) => a.status === 'pending');
  const completed = assessments.filter((a) => a.status === 'completed');

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader size="lg" text="Loading quick tests..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <Card className="text-center py-4">
          <Clock className="w-6 h-6 mx-auto mb-1 text-amber-600" />
          <p className="text-2xl font-black text-amber-600">{pending.length}</p>
          <p className="text-xs text-gray-500 font-medium">Pending</p>
        </Card>
        <Card className="text-center py-4">
          <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-green-600" />
          <p className="text-2xl font-black text-green-600">{completed.length}</p>
          <p className="text-xs text-gray-500 font-medium">Completed</p>
        </Card>
      </div>

      {assessments.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">No quick tests yet</p>
            <p className="text-sm text-gray-400 mt-1">When recruiters send tests, they'll appear here.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment) => {
            const job = getAssessmentJob(assessment);
            const isCompleted = assessment.status === 'completed';
            return (
              <div key={assessment._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{job?.title || 'Quick Test'}</h3>
                    <p className="text-sm text-gray-500">{job?.company || 'Recruiter Assessment'}</p>
                    <p className="text-xs text-gray-400 mt-2">{assessment.questions.length} questions</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        isCompleted ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {isCompleted ? 'Completed' : 'Pending'}
                    </span>
                    <button
                      onClick={() => openAssessment(assessment)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        isCompleted
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isCompleted ? 'View Test' : 'Take Test'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Quick Test</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedAssessment.status === 'completed'
                    ? 'Submitted answers'
                    : 'Answer all questions and submit'}
                </p>
                {selectedAssessment.status !== 'completed' && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
                    <Clock size={12} />
                    Time left: {formatTime(timeLeft)}
                  </div>
                )}
                {selectedAssessment.dueAt && (
                  <p className="mt-2 text-[11px] text-gray-400">
                    Due by {new Date(selectedAssessment.dueAt).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedAssessment(null)}
                className="text-sm text-gray-500 hover:text-gray-700 font-semibold"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {selectedAssessment.questions.map((q, idx) => (
                <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    {idx + 1}. {q.question}
                  </p>
                  {q.options && q.options.length > 0 ? (
                    <div className="space-y-2">
                      {q.options.map((option, optIdx) => (
                        <label
                          key={optIdx}
                          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 cursor-pointer hover:border-indigo-200"
                        >
                          <input
                            type="radio"
                            name={`q-${idx}`}
                            checked={draftSelections[idx] === optIdx}
                            onChange={() => {
                              const updated = [...draftSelections];
                              updated[idx] = optIdx;
                              setDraftSelections(updated);
                            }}
                            disabled={selectedAssessment.status === 'completed' || starting || submitting}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                      Options are unavailable for this question. Ask the recruiter to resend the test.
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedAssessment.status !== 'completed' && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button
                  onClick={() => submitAssessment(false)}
                  disabled={submitting || starting}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : starting ? 'Starting...' : 'Submit Quick Test'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
