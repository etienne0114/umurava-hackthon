import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { RichTextEditor } from '../common/RichTextEditor';
import { ExperienceEntry } from '@/store/slices/authSlice';
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
    title: '',
    company: '',
    duration: '',
    description: '',
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      const [start, end] = initialData.duration.split(/ – | - | to /i);
      setStartDate(formatDateForInput(start));
      if (end && /present|current|now/i.test(end)) {
        setIsCurrent(true);
        setEndDate('');
      } else {
        setIsCurrent(false);
        setEndDate(formatDateForInput(end));
      }
    } else {
      setFormData({ title: '', company: '', duration: '', description: '' });
      setStartDate('');
      setEndDate('');
      setIsCurrent(false);
    }
  }, [initialData, isOpen]);

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const match = dateStr.match(/^(\w+)\s+(\d{4})$/);
    if (!match) return '';
    const mIdx = months.indexOf(match[1]);
    return mIdx >= 0 ? `${match[2]}-${String(mIdx+1).padStart(2, '0')}` : '';
  };

  const formatDateForDisplay = (inputDate: string) => {
    if (!inputDate) return '';
    const [y, m] = inputDate.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m)-1]} ${y}`;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!isCurrent && !endDate) newErrors.endDate = 'End date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const start = formatDateForDisplay(startDate);
    const end = isCurrent ? 'Present' : formatDateForDisplay(endDate);
    
    onSave({
      ...formData,
      duration: `${start} – ${end}`
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
            label="Job title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Senior Flutter Developer"
            error={errors.title}
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
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
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
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="month"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isCurrent}
                className={clsx(
                  "w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm outline-none transition-all",
                  isCurrent ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed" : 
                  errors.endDate ? "border-red-300 ring-4 ring-red-50" : 
                  "border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                )}
              />
            </div>
            {!isCurrent && errors.endDate && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.endDate}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isCurrent"
            type="checkbox"
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.target.checked)}
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
