import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { EducationEntry } from '@/types';

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (education: EducationEntry) => void;
  initialData?: EducationEntry;
}

export const EducationModal: React.FC<EducationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<EducationEntry>({
    degree: '',
    institution: '',
    fieldOfStudy: '',
    startYear: undefined,
    endYear: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ 
        degree: '', 
        institution: '', 
        fieldOfStudy: '', 
        startYear: undefined, 
        endYear: undefined 
      });
    }
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.degree.trim()) newErrors.degree = 'Degree is required';
    if (!formData.institution.trim()) newErrors.institution = 'Institution is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit education" : "Add education"}
      subtitle="Details about your academic background."
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <div>
          <Input
            label="Degree"
            name="degree"
            value={formData.degree}
            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
            placeholder="e.g. Bachelor of Science in Computer Science"
            error={errors.degree}
            required
          />
        </div>

        <div>
          <Input
            label="Institution"
            name="institution"
            value={formData.institution}
            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            placeholder="e.g. University of Rwanda"
            error={errors.institution}
            required
          />
        </div>

        <div>
          <Input
            label="Field of Study"
            name="fieldOfStudy"
            value={formData.fieldOfStudy || ''}
            onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
            placeholder="e.g. Software Engineering"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Start Year"
              name="startYear"
              type="number"
              value={formData.startYear?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, startYear: parseInt(e.target.value) || undefined })}
              placeholder="e.g. 2018"
            />
          </div>
          <div>
            <Input
              label="End Year (or Expected)"
              name="endYear"
              type="number"
              value={formData.endYear?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, endYear: parseInt(e.target.value) || undefined })}
              placeholder="e.g. 2022"
            />
          </div>
        </div>

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
