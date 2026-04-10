import React from 'react';
import { EducationEntry } from '@/types';
import { GraduationCap, Trash2, Edit2 } from 'lucide-react';

interface EducationListItemProps {
  education: EducationEntry;
  onEdit?: () => void;
  onDelete?: () => void;
  isLast?: boolean;
}

export const EducationListItem: React.FC<EducationListItemProps> = ({
  education,
  onEdit,
  onDelete,
  isLast
}) => {
  return (
    <div className="relative flex gap-6 group">
      {!isLast && (
        <div className="absolute left-6 top-14 bottom-0 w-px bg-gray-100" />
      )}

      <div className="flex-shrink-0 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100/50 shadow-sm flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
          <GraduationCap className="w-6 h-6 text-indigo-500" />
        </div>
      </div>

      <div className="flex-1 pb-10">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
              {education.degree}
            </h3>
            <p className="text-sm font-semibold text-gray-400 mt-2 flex items-center gap-2">
              <span className="text-gray-900">{education.institution}</span>
              {education.fieldOfStudy && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-600">{education.fieldOfStudy}</span>
                </>
              )}
              {(education.startYear || education.endYear) && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-indigo-500 font-bold uppercase tracking-wider text-[10px] bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/50">
                    {education.startYear} - {education.endYear || 'Present'}
                  </span>
                </>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="Edit Education"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Delete Education"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
