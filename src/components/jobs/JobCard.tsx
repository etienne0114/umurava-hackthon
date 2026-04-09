'use client';

import React, { memo } from 'react';
import { Job } from '@/types';
import { 
  MapPin, 
  Clock, 
  Briefcase, 
  Users, 
  ChevronRight,
  MoreVertical,
  Globe,
  Trash2
} from 'lucide-react';
import clsx from 'clsx';

interface JobCardProps {
  job: Job;
  onView: (jobId: string) => void;
  onEdit?: (jobId: string) => void;
  onDelete?: (jobId: string) => void;
}

const JobCardComponent: React.FC<JobCardProps> = ({ job, onView, onEdit, onDelete }) => {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    closed: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  const faviconUrl = job.company 
    ? `https://www.google.com/s2/favicons?domain=${job.company.toLowerCase().replace(/\s+/g, '')}.com&sz=128`
    : null;

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all group relative flex flex-col h-full">
      {/* Header Area */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
            {faviconUrl ? (
              <img src={faviconUrl} alt={job.company} className="w-8 h-8 object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
            ) : (
              <Briefcase className="text-gray-300" size={24} />
            )}
          </div>
          <div>
            <span className={clsx(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mb-2 inline-block",
              statusColors[job.status] || statusColors.active
            )}>
              {job.status}
            </span>
            <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
              {job.title}
            </h3>
            <p className="text-xs font-bold text-gray-400 mt-0.5">{job.company || 'Umurava Partner'}</p>
          </div>
        </div>
        
        {onEdit && (
          <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
            <MoreVertical size={20} />
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-8 flex-1">
        {job.description}
      </p>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="flex items-center gap-2.5 text-gray-400">
          <div className="p-1.5 bg-gray-50 rounded-lg">
            <Globe size={14} className="text-gray-400" />
          </div>
          <span className="text-xs font-bold">{job.workMode || 'Remote'}</span>
        </div>
        <div className="flex items-center gap-2.5 text-gray-400">
          <div className="p-1.5 bg-gray-50 rounded-lg">
            <Clock size={14} className="text-gray-400" />
          </div>
          <span className="text-xs font-bold capitalize">{job.employmentType || 'Full-time'}</span>
        </div>
        <div className="flex items-center gap-2.5 text-gray-400">
          <div className="p-1.5 bg-gray-50 rounded-lg">
            <MapPin size={14} className="text-gray-400" />
          </div>
          <span className="text-xs font-bold truncate">{job.requirements.location || 'Rwanda'}</span>
        </div>
        <div className="flex items-center gap-2.5 text-gray-400 font-bold">
          <div className="p-1.5 bg-indigo-50 rounded-lg">
            <Users size={14} className="text-indigo-600" />
          </div>
          <span className="text-xs text-indigo-600">{job.applicantCount} Applicants</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
        <button
          onClick={() => onView(job._id)}
          className="flex-1 px-6 py-3 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 group/btn"
        >
          View Details
          <ChevronRight size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
        
        {onEdit && (
          <button
            onClick={() => onEdit(job._id)}
            className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-gray-100"
            title="Edit Posting"
          >
            <Briefcase size={18} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(job._id)}
            className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-gray-100"
            title="Delete Posting"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export const JobCard = memo(JobCardComponent);
