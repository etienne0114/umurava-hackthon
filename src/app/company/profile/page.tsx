'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateProfile } from '@/store/slices/authSlice';
import { CompanyLayout } from '@/components/layout/CompanyLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { 
  User, Building2, Mail, Phone, Briefcase, 
  Edit3, Save, X, Loader2, CheckCircle2, 
  MapPin, Globe, ShieldCheck, Camera
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { AvatarUpload } from '@/components/profile/AvatarUpload';

export default function CompanyProfilePage() {
  return (
    <ProtectedRoute requiredRole="company">
      <CompanyLayout>
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Recruiter Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your personal and company information</p>
          </div>
          
          <ProfileContent />
        </div>
      </CompanyLayout>
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: user?.profile?.name || '',
    company: user?.profile?.company || '',
    position: user?.profile?.position || '',
    phone: user?.profile?.phone || '',
    bio: user?.profile?.bio || '',
  });

  // Sync form with user state when it changes (e.g., after initial fetch)
  useEffect(() => {
    if (user?.profile) {
      setForm({
        name: user.profile.name || '',
        company: user.profile.company || '',
        position: user.profile.position || '',
        phone: user.profile.phone || '',
        bio: user.profile.bio || '',
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(updateProfile(form)).unwrap();
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initials = form.name
    ? form.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'C';

  return (
    <div className="space-y-6">
      {/* ─── Profile Header Card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />
        
        <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
          <AvatarUpload
            currentAvatar={user?.profile?.avatar}
            name={form.name}
            size="xl"
          />
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-gray-900">{form.name || 'Recruiter Name'}</h2>
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
                Authorized Recruiter
              </span>
            </div>
            <p className="text-gray-500 font-medium flex items-center gap-2">
              <Building2 size={16} className="text-gray-400" />
              {form.company || 'Add company name'}
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <ShieldCheck size={14} className="text-green-500" />
                Identity Verified
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Globe size={14} />
                Global Access
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={clsx(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm",
              isEditing 
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200"
            )}
          >
            {isEditing ? (
              <><X size={16} /> Cancel</>
            ) : (
              <><Edit3 size={16} /> Edit Profile</>
            )}
          </button>
        </div>
      </div>

      {/* ─── Profile Details Form/View ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Mail size={14} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Email Address</p>
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Phone size={14} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900">{form.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100/50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-base font-black text-indigo-950 relative z-10">Recruiter Insights</h3>
            <p className="text-indigo-700/80 text-[11px] font-medium mt-3 relative z-10 leading-relaxed">
              Companies with complete profiles get 40% more application engagement from top-tier talent.
            </p>
          </div>
        </div>

        {/* Main Form Area */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider px-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      disabled={!isEditing}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full bg-white border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider px-1">Job Position</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      disabled={!isEditing}
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                      placeholder="e.g. HR Manager"
                      className="w-full bg-white border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider px-1">Company Name</label>
                  <div className="relative group">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      disabled={!isEditing}
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="e.g. Acme Inc."
                      className="w-full bg-white border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider px-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      disabled={!isEditing}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+250 788 000 000"
                      className="w-full bg-white border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-50 pt-6 mt-2">
                <div className="flex items-center gap-2 mb-1 px-1">
                  <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">About the Company / Professional Bio</label>
                </div>
                <textarea
                  disabled={!isEditing}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Describe your company or professional achievements..."
                  rows={6}
                  className="w-full bg-white border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 rounded-2xl px-4 py-3 text-sm font-medium transition-all outline-none resize-none disabled:opacity-70 disabled:cursor-not-allowed leading-relaxed shadow-sm"
                />
              </div>
            </div>

            {isEditing && (
              <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-[10px] text-gray-400 italic">Unsaved changes will be lost if you leave.</p>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                  Save Changes
                </button>
              </div>
            )}
          </form>
          
          <div className="mt-8 flex items-center justify-between p-7 bg-emerald-50/50 rounded-3xl border border-emerald-100/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Profile Complete</p>
                <p className="text-[10px] font-medium text-emerald-600/70">Your recruiter status is public and visible to all talent candidates.</p>
              </div>
            </div>
            <div className="hidden sm:block">
               <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-full">Fully Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
