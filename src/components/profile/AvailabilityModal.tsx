import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Select } from '../common/Select';
import { Input } from '../common/Input';
import { Availability } from '@/types';

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (availability: Availability) => void;
  initialData?: Availability;
}

const STATUS_OPTIONS = [
  { value: 'Available', label: 'Available' },
  { value: 'Open to Opportunities', label: 'Open to Opportunities' },
  { value: 'Not Available', label: 'Not Available' },
];

const TYPE_OPTIONS = [
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
];

export const AvailabilityModal: React.FC<AvailabilityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Availability>({
    status: 'Open to Opportunities',
    type: 'Full-time',
    startDate: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ 
        status: 'Open to Opportunities', 
        type: 'Full-time', 
        startDate: '' 
      });
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit availability"
      subtitle="Help companies understand when and how you can start."
      maxWidth="sm"
    >
      <div className="space-y-6">
        <div>
          <Select
            label="Current Status"
            name="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            options={STATUS_OPTIONS}
          />
        </div>

        <div>
          <Select
            label="Preferred Type"
            name="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            options={TYPE_OPTIONS}
          />
        </div>

        <div>
          <Input
            label="Earliest Start Date"
            name="startDate"
            value={formData.startDate || ''}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            placeholder="e.g. Immediately, 2 weeks notice"
          />
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
