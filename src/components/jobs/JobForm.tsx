'use client';

import React, { useState, useCallback, memo } from 'react';
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
  AlertCircle,
  Plus
} from 'lucide-react';
import clsx from 'clsx';

interface JobFormProps {
  initialData?: Partial<Job>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const JobFormComponent: React.FC<JobFormProps> = ({ initialData, onSubmit, onCancel }) => {
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.skills || formData.skills.trim().length === 0 || formData.skills === '<p></p>') {
      newErrors.skills = 'Skills requirements are required';
    }

    const weightSum = Number(formData.skillsWeight) + Number(formData.experienceWeight) + 
                      Number(formData.educationWeight) + Number(formData.relevanceWeight);
    if (Math.abs(weightSum - 1.0) > 0.01) {
      newErrors.weights = `Weights must sum to 1.0 (current: ${weightSum.toFixed(2)})`;
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
• Proficient in TypeScript and React
• Experience with Node.js and MongoDB
• Knowledge of AWS Cloud services..."
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
            {errors.weights ? (
              <div className="flex items-center gap-2 text-red-600 animate-pulse bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{errors.weights}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Weights Balanced (1.0)</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Core Skills', key: 'skillsWeight', value: formData.skillsWeight },
              { label: 'Work Experience', key: 'experienceWeight', value: formData.experienceWeight },
              { label: 'Education Match', key: 'educationWeight', value: formData.educationWeight },
              { label: 'Profile Relevance', key: 'relevanceWeight', value: formData.relevanceWeight },
            ].map((weight) => (
              <div key={weight.key} className="p-4 rounded-2xl bg-gray-50 border border-gray-100/50 hover:border-indigo-200 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700">{weight.label}</span>
                  <span className="text-indigo-600 text-lg font-bold">{(Number(weight.value) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  name={weight.key}
                  min="0"
                  max="1"
                  step="0.05"
                  value={weight.value}
                  onChange={handleChange}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
                />
              </div>
            ))}
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
