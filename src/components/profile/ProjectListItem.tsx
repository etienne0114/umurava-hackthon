import React from 'react';
import { ProjectEntry } from '@/types';
import { ExternalLink, Trash2, Edit2, Code2 } from 'lucide-react';

interface ProjectListItemProps {
  project: ProjectEntry;
  onEdit?: () => void;
  onDelete?: () => void;
  isLast?: boolean;
}

export const ProjectListItem: React.FC<ProjectListItemProps> = ({
  project,
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
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/50 shadow-sm flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
          <Code2 className="w-6 h-6 text-emerald-500" />
        </div>
      </div>

      <div className="flex-1 pb-10">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 tracking-tight leading-none group-hover:text-emerald-600 transition-colors">
              {project.name}
            </h3>
            <p className="text-sm font-semibold text-emerald-600 mt-2 flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-[10px] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/50">
                {project.role}
              </span>
              {(project.startDate || project.endDate) && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-400 text-[11px] font-bold">
                    {project.startDate} - {project.endDate || 'Present'}
                  </span>
                </>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                title="View Project"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                title="Edit Project"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-3 font-medium leading-relaxed">
          {project.description}
        </p>

        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {project.technologies.map((tech, i) => (
              <span 
                key={i}
                className="px-3 py-1 bg-gray-50 text-gray-500 text-[11px] font-bold rounded-full border border-gray-100"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
