'use client';

import React, { useState, useCallback, memo } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { Card } from '../common/Card';
import { Job } from '@/types';

interface JobFormProps {
  initialData?: Partial<Job>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const JobFormComponent: React.FC<JobFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    skills: initialData?.requirements?.skills?.join(', ') || '',
    minYears: initialData?.requirements?.experience?.minYears || 0,
    maxYears: initialData?.requirements?.experience?.maxYears || undefined,
    education: initialData?.requirements?.education?.join(', ') || '',
    location: initialData?.requirements?.location || '',
    skillsWeight: initialData?.weights?.skills || 0.4,
    experienceWeight: initialData?.weights?.experience || 0.3,
    educationWeight: initialData?.weights?.education || 0.2,
    relevanceWeight: initialData?.weights?.relevance || 0.1,
    status: initialData?.status || 'draft',
  });

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
    if (!formData.skills.trim()) newErrors.skills = 'At least one skill is required';

    const weightSum = formData.skillsWeight + formData.experienceWeight + 
                      formData.educationWeight + formData.relevanceWeight;
    if (Math.abs(weightSum - 1.0) > 0.01) {
      newErrors.weights = 'Weights must sum to 1.0';
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
          skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
          experience: {
            minYears: Number(formData.minYears),
            maxYears: formData.maxYears ? Number(formData.maxYears) : undefined,
          },
          education: formData.education.split(',').map((e) => e.trim()).filter(Boolean),
          location: formData.location || undefined,
        },
        weights: {
          skills: formData.skillsWeight,
          experience: formData.experienceWeight,
          education: formData.educationWeight,
          relevance: formData.relevanceWeight,
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
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {initialData ? 'Edit Job' : 'Create New Job'}
        </h2>

        <Input
          label="Job Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
        />

        <TextArea
          label="Job Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          rows={6}
          required
        />

        <Input
          label="Required Skills (comma-separated)"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          error={errors.skills}
          placeholder="TypeScript, React, Node.js"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Minimum Years of Experience"
            name="minYears"
            type="number"
            value={formData.minYears}
            onChange={handleChange}
            min={0}
            required
          />
          <Input
            label="Maximum Years of Experience"
            name="maxYears"
            type="number"
            value={formData.maxYears || ''}
            onChange={handleChange}
            min={0}
          />
        </div>

        <Input
          label="Education Requirements (comma-separated)"
          name="education"
          value={formData.education}
          onChange={handleChange}
          placeholder="Bachelor's Degree, Computer Science"
        />

        <Input
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Remote, Kigali, etc."
        />

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Scoring Weights</h3>
          {errors.weights && <p className="text-red-600 text-sm mb-2">{errors.weights}</p>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills Weight: {formData.skillsWeight.toFixed(2)}
              </label>
              <input
                type="range"
                name="skillsWeight"
                min="0"
                max="1"
                step="0.05"
                value={formData.skillsWeight}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Weight: {formData.experienceWeight.toFixed(2)}
              </label>
              <input
                type="range"
                name="experienceWeight"
                min="0"
                max="1"
                step="0.05"
                value={formData.experienceWeight}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education Weight: {formData.educationWeight.toFixed(2)}
              </label>
              <input
                type="range"
                name="educationWeight"
                min="0"
                max="1"
                step="0.05"
                value={formData.educationWeight}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relevance Weight: {formData.relevanceWeight.toFixed(2)}
              </label>
              <input
                type="range"
                name="relevanceWeight"
                min="0"
                max="1"
                step="0.05"
                value={formData.relevanceWeight}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full sm:w-auto">
            {initialData ? 'Update Job' : 'Create Job'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

// Memoize the form component to prevent unnecessary re-renders
export const JobForm = memo(JobFormComponent);
