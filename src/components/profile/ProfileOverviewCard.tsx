import React from 'react';
import { User } from '@/store/slices/authSlice';
import { AvatarUpload } from '../profile/AvatarUpload';
import { MapPin, Phone, Mail, Share2, Edit3, Eye, Upload } from 'lucide-react';
import clsx from 'clsx';
import { ProfileRatingGauge } from './ProfileRatingGauge';
import { CVUploadTrigger } from './CVUploadTrigger';
import { ParsedResumeProfile } from '@/store/slices/authSlice';

interface ProfileOverviewCardProps {
  user: User | null;
  onEdit?: () => void;
  onViewPublic?: () => void;
  onParsed?: (extracted: ParsedResumeProfile) => void;
}

export const ProfileOverviewCard: React.FC<ProfileOverviewCardProps> = ({
  user,
  onEdit,
  onViewPublic,
  onParsed
}) => {
  const completion = user?.profile?.profileCompletion || 0;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      {/* Bio / Info Card */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8 shadow-sm">
        <AvatarUpload 
          currentAvatar={user?.profile?.avatar} 
          name={user?.profile?.name || ''} 
          size="lg"
          className="w-32 h-32 rounded-full border-4 border-white shadow-xl shadow-indigo-100 flex-shrink-0"
        />
        
        <div className="flex-1 text-center sm:text-left space-y-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
              {user?.profile?.name || 'Anonymous User'}
            </h2>
            <p className="text-lg font-bold text-gray-500 flex items-center justify-center sm:justify-start gap-2">
               <span className="flex items-center gap-1.5"><Eye size={16} className="text-indigo-400" /> {user?.profile?.position || 'Professional'}</span>
            </p>
          </div>

          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm font-semibold text-gray-400">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                <MapPin size={14} className="text-gray-400" />
              </div>
              <span>Rwanda</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                <Phone size={14} className="text-gray-400" />
              </div>
              <span className="tabular-nums">{user?.profile?.phone || 'No phone'}</span>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
             <span className="px-4 py-1.5 bg-blue-600 text-white text-[11px] font-black rounded-full shadow-lg shadow-blue-100 uppercase tracking-widest">
               Junior (1-3 Years)
             </span>
          </div>
        </div>

        <div className="absolute top-6 right-8 flex items-center gap-2">
          <CVUploadTrigger 
            onParsed={onParsed} 
            variant="button" 
            className="!px-4 !py-2 !text-xs !bg-indigo-50 !text-indigo-600 !border-indigo-100 !shadow-none hover:!bg-indigo-600 hover:!text-white transition-all" 
          />
          <button 
            onClick={onViewPublic}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            See public view
          </button>
          <button 
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-gray-100"
            title="Edit Profile"
          >
            <Edit3 size={16} />
          </button>
          <button 
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-gray-100"
            title="Share Profile"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Completion Gauge Card */}
      <ProfileRatingGauge percentage={completion} />
    </div>
  );
};
