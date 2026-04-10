'use client';

import React from 'react';
import { useAppSelector } from '@/store';
import { TalentLayout } from '@/components/layout/TalentLayout';
import { MapPin, Phone, Eye, ArrowLeft, Mail, Globe, Briefcase, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PublicProfilePreview() {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  if (!user || user.role !== 'talent') {
    return (
      <TalentLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-gray-500">Loading profile data...</p>
        </div>
      </TalentLayout>
    );
  }

  const profile = user.profile || {};

  return (
    <TalentLayout>
      <div className="max-w-6xl mx-auto pb-20 space-y-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all font-semibold shadow-sm w-fit"
        >
          <ArrowLeft size={16} /> Back to Edit Mode
        </button>

        {/* Public Profile Header */}
        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
          <div className="h-32 bg-slate-800"></div>
          <div className="px-8 sm:px-12 pb-10 flex flex-col sm:flex-row items-center sm:items-end gap-8 relative">
            <div className="-mt-16 w-32 h-32 rounded-full border-4 border-white shadow-xl bg-indigo-50 flex items-center justify-center text-indigo-500 text-5xl font-black shrink-0 relative overflow-hidden z-10">
               {profile.avatar ? (
                 <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
               ) : (
                 profile.name?.charAt(0) || 'U'
               )}
            </div>
            
            <div className="flex-1 mt-4 sm:mt-0 sm:min-w-0 sm:pb-2 text-center sm:text-left">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight break-words">{profile.name}</h2>
              <p className="text-xl font-bold text-gray-500 flex items-center justify-center sm:justify-start gap-2 mt-2 break-words">
                <Eye size={20} className="text-indigo-400 shrink-0" /> {profile.headline || 'Professional Talent'}
              </p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-5 mt-5 text-sm font-bold text-gray-500">
                {profile.location && (
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <MapPin size={16} className="text-gray-400" /> <span>{profile.location}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Phone size={16} className="text-gray-400" /> <span>{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                   <Mail size={16} className="text-gray-400" /> <span>{user.email || 'Email Private'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Bio Section */}
            {profile.bio && (
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 sm:p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Globe size={120} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-6">About</h3>
                <p className="text-gray-700 text-lg leading-relaxed break-words whitespace-pre-wrap font-medium relative z-10">{profile.bio}</p>
              </div>
            )}

            {/* Experience */}
            {profile.experience && profile.experience.length > 0 && (
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 sm:p-10 shadow-sm">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl"><Briefcase size={24} className="text-indigo-600" /></div>
                  Professional Experience
                </h3>
                <div className="space-y-6">
                  {profile.experience.map((exp, i) => (
                    <div key={i} className="flex gap-6 p-6 rounded-[1.5rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all relative overflow-hidden group">
                      <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Briefcase className="text-indigo-400" size={32} />
                      </div>
                      <div className="flex-1">
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                           <h4 className="text-xl font-black text-gray-900 break-words group-hover:text-indigo-700 transition-colors">{exp.role}</h4>
                           <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full whitespace-nowrap w-fit border border-indigo-100">
                             {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate || exp.duration}
                           </span>
                         </div>
                         <p className="text-base font-bold text-gray-500 break-words flex items-center gap-2">
                            {exp.company}
                         </p>
                         {exp.description && (
                           <p className="text-sm font-medium text-gray-600 mt-4 whitespace-pre-wrap break-words leading-relaxed">{exp.description}</p>
                         )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 sm:p-10 shadow-sm">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl"><GraduationCap size={24} className="text-blue-600" /></div>
                  Education & Accolades
                </h3>
                <div className="space-y-6">
                  {profile.education.map((edu, i) => (
                    <div key={i} className="flex gap-6 p-6 rounded-[1.5rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                      <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center shrink-0">
                        <GraduationCap className="text-gray-400" size={32} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-black text-gray-900 break-words">{edu.degree}</h4>
                        <p className="text-base font-bold text-gray-500 break-words mt-1">{edu.institution} {edu.endYear ? `· Class of ${edu.endYear}` : ''}</p>
                        {edu.description && (
                          <p className="text-sm font-medium text-gray-600 mt-3 leading-relaxed">{edu.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6">Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-xl border border-indigo-100"
                    >
                      {skill.name} <span className="opacity-50 font-medium ml-1">· {skill.level}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6">Languages</h3>
                <div className="space-y-4">
                  {profile.languages.map((lang, i) => (
                    <div key={i} className="flex justify-between items-center text-sm p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="font-black text-gray-800">{lang.name}</span>
                      <span className="text-gray-500 font-bold bg-white px-3 py-1 rounded-lg border border-gray-200">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
             {/* Note */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2rem] p-8 text-center border-2 border-indigo-100/50 shadow-inner">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-indigo-50">
                 <Eye size={28} className="text-indigo-400" />
              </div>
              <h4 className="text-lg font-black text-indigo-900 mb-2">Employer View</h4>
              <p className="text-sm font-medium text-indigo-700/80 leading-relaxed">This strictly represents how recruiters and partner companies view your application layout.</p>
            </div>
          </div>
        </div>
      </div>
    </TalentLayout>
  );
}
