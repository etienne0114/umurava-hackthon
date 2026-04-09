'use client';

import React, { useState, useCallback, memo, useMemo, useEffect } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { RichTextEditor } from '../common/RichTextEditor';
import { TagInput } from '../common/TagInput';
import { Modal } from '../common/Modal';
import { Card } from '../common/Card';
import { Job } from '@/types';
import { 
  Briefcase, 
  MapPin, 
  GraduationCap, 
  Clock, 
  Target, 
  Settings2,
  CheckCircle2,
  Plus,
  Sparkles,
  Star
} from 'lucide-react';
import clsx from 'clsx';

interface JobFormProps {
  initialData?: Partial<Job>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const JobFormComponent: React.FC<JobFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const weightKeys = useMemo(() => ([
    { key: 'skillsWeight', label: 'Core Skills', color: 'bg-indigo-500' },
    { key: 'experienceWeight', label: 'Work Experience', color: 'bg-emerald-500' },
    { key: 'educationWeight', label: 'Education Match', color: 'bg-amber-500' },
    { key: 'relevanceWeight', label: 'Profile Relevance', color: 'bg-rose-500' },
  ] as const), []);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    skills: initialData?.requirements?.skills || '',
    minYears: initialData?.requirements?.experience?.minYears || 0,
    maxYears: initialData?.requirements?.experience?.maxYears || undefined,
    education: initialData?.requirements?.education || [],
    location: initialData?.requirements?.location || '',
    skillsWeight: initialData?.weights?.skills || 0.4,
    experienceWeight: initialData?.weights?.experience || 0.3,
    educationWeight: initialData?.weights?.education || 0.2,
    relevanceWeight: initialData?.weights?.relevance || 0.1,
    status: initialData?.status || 'draft',
  });

  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [weightMode, setWeightMode] = useState<'sliders' | 'importance'>('sliders');
  const [importanceRatings, setImportanceRatings] = useState<Record<string, number>>({
    skillsWeight: Math.max(1, Math.min(5, Math.round((initialData?.weights?.skills || 0.4) * 5))),
    experienceWeight: Math.max(1, Math.min(5, Math.round((initialData?.weights?.experience || 0.3) * 5))),
    educationWeight: Math.max(1, Math.min(5, Math.round((initialData?.weights?.education || 0.2) * 5))),
    relevanceWeight: Math.max(1, Math.min(5, Math.round((initialData?.weights?.relevance || 0.1) * 5))),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const normalizeWeights = useCallback(
    (weights: Record<string, number>, focusKey: string) => {
      const keys = weightKeys.map((k) => k.key);
      const clamp = (val: number) => Math.min(1, Math.max(0, val));

      const focusValue = clamp(weights[focusKey] || 0);
      const normalized: Record<string, number> = { [focusKey]: focusValue };

      const remaining = Math.max(0, 1 - focusValue);
      const otherKeys = keys.filter((key) => key !== focusKey);
      if (otherKeys.length === 0) return normalized;

      const existingSum = otherKeys.reduce((acc, key) => acc + (weights[key] || 0), 0);
      if (existingSum <= 0) {
        const even = remaining / otherKeys.length;
        otherKeys.forEach((key) => {
          normalized[key] = even;
        });
        return normalized;
      }

      otherKeys.forEach((key) => {
        const ratio = (weights[key] || 0) / existingSum;
        normalized[key] = ratio * remaining;
      });

      return normalized;
    },
    [weightKeys]
  );

  const handleWeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = Math.min(100, Math.max(0, Number(value)));
    const decimalValue = numericValue / 100;

    setFormData((prev) => {
      const nextWeights = {
        skillsWeight: Number(prev.skillsWeight),
        experienceWeight: Number(prev.experienceWeight),
        educationWeight: Number(prev.educationWeight),
        relevanceWeight: Number(prev.relevanceWeight),
      };

      nextWeights[name as keyof typeof nextWeights] = decimalValue;
      const normalized = normalizeWeights(nextWeights, name);

      return {
        ...prev,
        ...normalized,
      };
    });
  }, [normalizeWeights]);


  const applyImportanceRatings = useCallback((ratings: Record<string, number>) => {
    const keys = weightKeys.map((k) => k.key);
    const total = keys.reduce((acc, key) => acc + (ratings[key] || 0), 0);
    const safeTotal = total > 0 ? total : keys.length;
    const normalized: Record<string, number> = {};
    keys.forEach((key) => {
      const value = ratings[key] || 1;
      normalized[key] = value / safeTotal;
    });

    setFormData((prev) => ({
      ...prev,
      ...normalized,
    }));
  }, [weightKeys]);

  const handleRatingChange = useCallback((key: string, rating: number) => {
    setImportanceRatings((prev) => {
      const updated = { ...prev, [key]: rating };
      applyImportanceRatings(updated);
      return updated;
    });
  }, [applyImportanceRatings]);

  useEffect(() => {
    if (weightMode !== 'importance') return;
    applyImportanceRatings(importanceRatings);
  }, [weightMode, importanceRatings, applyImportanceRatings]);

  useEffect(() => {
    if (weightMode !== 'sliders') return;
    const current = {
      skillsWeight: Number(formData.skillsWeight),
      experienceWeight: Number(formData.experienceWeight),
      educationWeight: Number(formData.educationWeight),
      relevanceWeight: Number(formData.relevanceWeight),
    };
    const normalized = normalizeWeights(current, 'skillsWeight');
    setFormData((prev) => ({ ...prev, ...normalized }));
  }, [weightMode, normalizeWeights, formData.skillsWeight, formData.experienceWeight, formData.educationWeight, formData.relevanceWeight]);

  const strategyPreview = useMemo(() => {
    const weights = [
      { key: 'skillsWeight', label: 'Skills', value: Number(formData.skillsWeight) },
      { key: 'experienceWeight', label: 'Experience', value: Number(formData.experienceWeight) },
      { key: 'educationWeight', label: 'Education', value: Number(formData.educationWeight) },
      { key: 'relevanceWeight', label: 'Relevance', value: Number(formData.relevanceWeight) },
    ].sort((a, b) => b.value - a.value);

    const top = weights[0];
    const runnerUp = weights[1];
    if (!top) return 'Balanced screening strategy.';

    if (top.value >= 0.6) {
      if (top.key === 'skillsWeight') {
        return 'Current Strategy: High-intensity skill matching. The AI will prioritize technical depth, tool mastery, and portfolio signals.';
      }
      if (top.key === 'experienceWeight') {
        return 'Current Strategy: Experience-first screening. The AI will prioritize tenure, role relevance, and seniority over other factors.';
      }
      if (top.key === 'educationWeight') {
        return 'Current Strategy: Credential-focused screening. The AI will weigh education pedigree and formal qualifications heavily.';
      }
      return 'Current Strategy: Context and fit focused. The AI will prioritize overall relevance and holistic profile signals.';
    }

    if (runnerUp && Math.abs(top.value - runnerUp.value) < 0.1) {
      return `Current Strategy: Dual-focus on ${top.label.toLowerCase()} and ${runnerUp.label.toLowerCase()} for balanced screening.`;
    }

    return `Current Strategy: ${top.label}-led screening with supportive weighting from other factors.`;
  }, [formData]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.skills || formData.skills.trim().length === 0 || formData.skills === '<p></p>') {
      newErrors.skills = 'Skills requirements are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: formData.title,
        description: formData.description,
        requirements: {
          skills: formData.skills,
          experience: {
            minYears: Number(formData.minYears),
            maxYears: formData.maxYears ? Number(formData.maxYears) : undefined,
          },
          education: formData.education,
          location: formData.location || undefined,
        },
        weights: {
          skills: Number(formData.skillsWeight),
          experience: Number(formData.experienceWeight),
          education: Number(formData.educationWeight),
          relevance: Number(formData.relevanceWeight),
        },
        status: formData.status,
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit, validateForm]);

  return (
    <div className="bg-white">
      <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
        {/* Section 1: Job Essentials */}
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Briefcase className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Job Essentials</h2>
              <p className="text-sm text-gray-500">Provide the core details for this posting</p>
            </div>
          </div>

          <div className="space-y-6">
            <Input
              label="Job Title"
              name="title"
              placeholder="e.g. Senior Full Stack Engineer"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
            />

            <RichTextEditor
              label="Job Description"
              value={formData.description}
              onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
              placeholder="Describe the role, impact, and daily responsibilities..."
              error={errors.description}
              required
            />
          </div>
        </div>

        {/* Section 2: Requirements Grid */}
        <div className="p-8 bg-gray-50/50 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Requirements & Logistics</h2>
              <p className="text-sm text-gray-500">Define the ideal candidate profile</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="col-span-full">
              <label className="text-sm font-bold text-gray-700 block mb-2">
                Required Skills <span className="text-red-500">*</span>
              </label>
              
              <div className={clsx(
                "relative group cursor-pointer rounded-2xl border transition-all overflow-hidden bg-gray-50/50 hover:bg-white",
                errors.skills 
                  ? "border-red-300 ring-4 ring-red-50" 
                  : "border-gray-200 hover:border-indigo-300 shadow-sm"
              )}>
                <div className={clsx(
                  "p-4 transition-all duration-300",
                  formData.skills && formData.skills !== '<p></p>' ? "min-h-[60px]" : "py-3"
                )}>
                  {formData.skills && formData.skills !== '<p></p>' ? (
                    <div 
                      className="prose prose-sm max-w-none text-gray-600 line-clamp-4"
                      dangerouslySetInnerHTML={{ __html: formData.skills }}
                    />
                  ) : (
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <Plus className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-500">Define technical requirements</p>
                        <p className="text-xs">Assessment basis for AI screening</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-between">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                    Rich Text Assessment Basis
                  </p>
                  <Button
                    type="button"
                    variant="primary"
                    className="!py-1.5 !px-3 !text-xs !bg-indigo-50 !text-indigo-600 hover:!bg-indigo-100 border-none shadow-none flex items-center gap-1.5 font-bold"
                    onClick={() => setIsSkillsModalOpen(true)}
                  >
                    <Plus size={12} strokeWidth={3} />
                    {formData.skills && formData.skills !== '<p></p>' ? 'Update Skills' : 'Add Skills'}
                  </Button>
                </div>
                
                {/* Clickable Overlay */}
                <div 
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => setIsSkillsModalOpen(true)}
                />
              </div>

              {errors.skills && (
                <p className="mt-1.5 text-xs font-semibold text-red-500 ml-1">
                  {errors.skills}
                </p>
              )}

              {/* Skills Editor Modal */}
              <Modal
                isOpen={isSkillsModalOpen}
                onClose={() => setIsSkillsModalOpen(false)}
                title="Define Technical Requirements"
                subtitle="List the core skills, tools, and expertise needed for this role. Use bullets for clarity."
              >
                <div className="space-y-6">
                  <RichTextEditor
                    value={formData.skills}
                    onChange={(content) => setFormData(prev => ({ ...prev, skills: content }))}
                    placeholder="e.g. 
- Proficient in TypeScript and React
- Experience with Node.js and MongoDB
- Knowledge of AWS Cloud services..."
                  />
                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => setIsSkillsModalOpen(false)}
                      className="px-8"
                    >
                      Save Requirements
                    </Button>
                  </div>
                </div>
              </Modal>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  label="Min Experience"
                  name="minYears"
                  type="number"
                  value={formData.minYears}
                  onChange={handleChange}
                  min={0}
                  required
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Max Experience"
                  name="maxYears"
                  type="number"
                  value={formData.maxYears || ''}
                  onChange={handleChange}
                  min={0}
                  placeholder="Optional"
                />
              </div>
            </div>

            <Input
              label="Location / Work Mode"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Remote, Kigali, Kigali (Hybrid)"
            />

            <div className="col-span-full">
              <TagInput
                label="Education Requirements"
                tags={formData.education}
                onChange={(tags) => setFormData(prev => ({ ...prev, education: tags }))}
                placeholder="Type requirement and hit Enter (e.g. Bachelor's in CS, Master's, CPA)"
              />
            </div>
          </div>
        </div>

        {/* Section 3: AI Scoring weights */}
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <Settings2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">AI Scoring Strategy</h2>
                <p className="text-sm text-gray-500">Assign importance weights for automated screening</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Weights Auto-balanced</span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <Sparkles size={14} className="text-indigo-500" />
                Visual Weight Map
              </div>
              <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1 text-xs font-semibold text-gray-600">
                <button
                  type="button"
                  onClick={() => setWeightMode('sliders')}
                  className={clsx(
                    "px-3 py-1 rounded-full transition-all",
                    weightMode === 'sliders' ? "bg-white shadow text-indigo-600" : "text-gray-500"
                  )}
                >
                  Sliders
                </button>
                <button
                  type="button"
                  onClick={() => setWeightMode('importance')}
                  className={clsx(
                    "px-3 py-1 rounded-full transition-all",
                    weightMode === 'importance' ? "bg-white shadow text-indigo-600" : "text-gray-500"
                  )}
                >
                  Importance
                </button>
              </div>
            </div>

            <div className="mt-4 h-4 w-full rounded-full overflow-hidden flex">
              {weightKeys.map((weight) => (
                <div
                  key={weight.key}
                  className={clsx("h-full transition-all", weight.color)}
                  style={{ width: `${Number(formData[weight.key as keyof typeof formData]) * 100}%` }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {weightKeys.map((weight) => (
              <div key={weight.key} className="p-4 rounded-2xl bg-gray-50 border border-gray-100/50 hover:border-indigo-200 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">{weight.label}</span>
                  </div>
                  <span className="text-indigo-600 text-lg font-bold">{(Number(formData[weight.key as keyof typeof formData]) * 100).toFixed(0)}%</span>
                </div>

                {weightMode === 'sliders' ? (
                  <input
                    type="range"
                    name={weight.key}
                    min="0"
                    max="100"
                    step="1"
                    value={Math.round(Number(formData[weight.key as keyof typeof formData]) * 100)}
                    onChange={handleWeightChange}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
                  />
                ) : (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starValue) => (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => handleRatingChange(weight.key, starValue)}
                        className={clsx(
                          "p-1 rounded-full transition-colors",
                          (importanceRatings[weight.key] || 1) >= starValue ? "text-yellow-500" : "text-gray-300"
                        )}
                        title={`Set ${weight.label} to ${starValue} stars`}
                      >
                        <Star size={16} fill={(importanceRatings[weight.key] || 1) >= starValue ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 text-sm text-indigo-700 flex items-start gap-3">
            <Sparkles size={16} className="mt-0.5" />
            <div>
              <p className="text-xs uppercase font-bold tracking-widest text-indigo-500 mb-1">AI Logic Preview</p>
              <p className="text-sm font-medium text-indigo-800">{strategyPreview}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-gray-50/80 flex items-center justify-between border-t border-gray-100">
          <p className="text-xs text-gray-400 max-w-xs italic">
            * Once posted, our AI will begin ranking incoming applicants based on these criteria.
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="px-8 py-3 !text-base bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200"
            >
              {initialData ? 'Update Job Posting' : 'Publish Job Posting'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Memoize the form component to prevent unnecessary re-renders
export const JobForm = memo(JobFormComponent);


