import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { RichTextEditor } from '../common/RichTextEditor';
import { ExperienceEntry } from '@/types';
import { Calendar } from 'lucide-react';
import clsx from 'clsx';

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (experience: ExperienceEntry) => void;
  initialData?: ExperienceEntry;
}

const EMPLOYMENT_TYPES = [
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Internship', label: 'Internship' },
];

export const ExperienceModal: React.FC<ExperienceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<ExperienceEntry>({
    role: '',
    company: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    technologies: [],
  });


  const [employmentType, setEmploymentType] = useState('Full-time');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        role: initialData.role || '',
        company: initialData.company || '',
        description: initialData.description || '',
        technologies: initialData.technologies || [],
        isCurrent: initialData.isCurrent || false,
        startDate: initialData.startDate ? formatDateForInputFromStandard(initialData.startDate) : '',
        endDate: initialData.endDate ? formatDateForInputFromStandard(initialData.endDate) : '',
      });
    } else {
      setFormData({ 
        role: '', 
        company: '', 
        startDate: '', 
        endDate: '', 
        isCurrent: false, 
        description: '',
        technologies: [],
      });
    }
  }, [initialData, isOpen]);

  const formatDateForInputFromStandard = (dateStr: string) => {
    // Expects YYYY-MM
    return dateStr;
  };



  const formatDateForDisplay = (inputDate: string) => {
    if (!inputDate) return '';
    const [y, m] = inputDate.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m)-1]} ${y}`;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!(formData.role || '').trim()) newErrors.role = 'Job role is required';
    if (!(formData.company || '').trim()) newErrors.company = 'Company name is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.isCurrent && !formData.endDate) newErrors.endDate = 'End date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const startStr = formatDateForDisplay(formData.startDate!);
    const endStr = formData.isCurrent ? 'Present' : formatDateForDisplay(formData.endDate!);
    
    onSave({
      ...formData,
      duration: `${startStr} – ${endStr}`
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit experience" : "Add experience"}
      subtitle="Share your professional background to help us match you with the right roles."
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <div>
          <Input
            label="Job role"
            name="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="e.g. Senior Flutter Developer"
            error={errors.role}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company name"
            name="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="e.g. Vibeon"
            error={errors.company}
            required
          />
          <Select
            label="Employment type"
            name="employmentType"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            options={EMPLOYMENT_TYPES}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="month"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={clsx(
                  "w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm outline-none transition-all",
                  errors.startDate ? "border-red-300 ring-4 ring-red-50" : "border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                )}
              />
            </div>
            {errors.startDate && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.startDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">End date</label>
            <div className="relative">
              <Calendar className={clsx(
                "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors",
                formData.isCurrent ? "text-indigo-400" : "text-gray-400"
              )} />
              {formData.isCurrent ? (
                <div className="w-full pl-10 pr-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center min-h-[46px]">
                  <span className="text-sm font-bold text-indigo-600">Present</span>
                </div>
              ) : (
                <input
                  type="month"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={clsx(
                    "w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm outline-none transition-all min-h-[46px]",
                    errors.endDate ? "border-red-300 ring-4 ring-red-50" : "border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  )}
                />
              )}
            </div>
            {!formData.isCurrent && errors.endDate && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.endDate}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isCurrent"
            type="checkbox"
            checked={formData.isCurrent}
            onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked, endDate: e.target.checked ? '' : formData.endDate })}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="isCurrent" className="text-sm font-medium text-gray-600">
            I am currently working here
          </label>
        </div>

        <RichTextEditor
          label="Job Description"
          value={formData.description || ''}
          onChange={(val) => setFormData({ ...formData, description: val })}
          placeholder="Describe your role and responsibilities..."
          required
        />

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};
