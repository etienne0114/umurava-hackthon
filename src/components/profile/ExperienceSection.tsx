import React from 'react';
import { PlusCircle } from 'lucide-react';
import { ExperienceEntry } from '@/types';
import { ExperienceListItem } from './ExperienceListItem';

interface ExperienceSectionProps {
  experiences: ExperienceEntry[];
  onAdd: () => void;
  onEdit: (idx: number) => void;
  onDelete: (idx: number) => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experiences,
  onAdd,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm transition-all hover:shadow-indigo-100/50">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Experience</h3>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm shadow-indigo-100"
        >
          <PlusCircle size={18} />
          Add Experience
        </button>
      </div>

      {experiences.length > 0 ? (
        <div className="space-y-4">
          {experiences.map((exp, idx) => (
            <ExperienceListItem
              key={idx}
              experience={exp}
              onEdit={() => onEdit(idx)}
              onDelete={() => onDelete(idx)}
              isLast={idx === experiences.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-semibold mb-1">No work experience yet.</p>
          <p className="text-xs text-gray-300">Add your professional history to help recruiters find you.</p>
        </div>
      )}
    </div>
  );
};
