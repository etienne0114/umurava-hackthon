import React from 'react';
import { PlusCircle } from 'lucide-react';
import { EducationEntry } from '@/types';
import { EducationListItem } from './EducationListItem';

interface EducationSectionProps {
  education: EducationEntry[];
  onAdd: () => void;
  onEdit: (idx: number) => void;
  onDelete: (idx: number) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  education,
  onAdd,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm transition-all hover:shadow-indigo-100/50">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Education</h3>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm shadow-indigo-100"
        >
          <PlusCircle size={18} />
          Add Education
        </button>
      </div>

      {education.length > 0 ? (
        <div className="space-y-4">
          {education.map((edu, idx) => (
            <EducationListItem
              key={idx}
              education={edu}
              onEdit={() => onEdit(idx)}
              onDelete={() => onDelete(idx)}
              isLast={idx === education.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-semibold mb-1">No education listed yet.</p>
          <p className="text-xs text-gray-300">Add your academic background to complete your profile.</p>
        </div>
      )}
    </div>
  );
};
