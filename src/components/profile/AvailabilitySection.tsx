import React from 'react';
import { Clock, Calendar, Edit2 } from 'lucide-react';
import { Availability } from '@/types';
import clsx from 'clsx';

interface AvailabilitySectionProps {
  availability?: Availability;
  onEdit: () => void;
}

export const AvailabilitySection: React.FC<AvailabilitySectionProps> = ({
  availability,
  onEdit
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm transition-all hover:shadow-indigo-100/50">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Availability</h3>
        <button 
          onClick={onEdit}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm shadow-indigo-100"
        >
          <Edit2 size={16} />
          Edit Availability
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status */}
        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Status</p>
          <div className="flex items-center gap-3">
            <div className={clsx(
              "w-2.5 h-2.5 rounded-full ring-4 shadow-sm",
              availability?.status === 'Available' ? "bg-emerald-500 ring-emerald-100 shadow-emerald-200" :
              availability?.status === 'Open to Opportunities' ? "bg-amber-500 ring-amber-100 shadow-amber-200" :
              "bg-red-500 ring-red-100 shadow-red-200"
            )} />
            <span className="text-sm font-extrabold text-gray-900">{availability?.status || 'Not Set'}</span>
          </div>
        </div>

        {/* Type */}
        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Engagement Type</p>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-extrabold text-gray-900">{availability?.type || 'Full-time'}</span>
          </div>
        </div>

        {/* Start Date */}
        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Start Date</p>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-extrabold text-gray-900">{availability?.startDate || 'Immediately'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
