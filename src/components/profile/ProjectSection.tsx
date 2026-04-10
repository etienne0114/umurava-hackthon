import React from 'react';
import { PlusCircle } from 'lucide-react';
import { ProjectEntry } from '@/types';
import { ProjectListItem } from './ProjectListItem';

interface ProjectSectionProps {
  projects: ProjectEntry[];
  onAdd: () => void;
  onEdit: (idx: number) => void;
  onDelete: (idx: number) => void;
}

export const ProjectSection: React.FC<ProjectSectionProps> = ({
  projects,
  onAdd,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm transition-all hover:shadow-emerald-100/50">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Projects</h3>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm shadow-emerald-100"
        >
          <PlusCircle size={18} />
          Add Project
        </button>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project, idx) => (
            <ProjectListItem
              key={idx}
              project={project}
              onEdit={() => onEdit(idx)}
              onDelete={() => onDelete(idx)}
              isLast={idx === projects.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-semibold mb-1">No projects listed yet.</p>
          <p className="text-xs text-gray-300">Showcase your portfolio and key achievements.</p>
        </div>
      )}
    </div>
  );
};
