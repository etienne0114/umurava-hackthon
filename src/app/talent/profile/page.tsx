'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  updateProfile,
  ParsedResumeProfile,
} from '@/store/slices/authSlice';
import { ExperienceEntry, EducationEntry } from '@/types';
import {
  SkillEntry,
  LanguageEntry,
  CertificationEntry,
  ProjectEntry,
  SkillLevel,
} from '@/types';
import { TalentLayout } from '@/components/layout/TalentLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
// Shared Components
import { CVUploadTrigger } from '@/components/profile/CVUploadTrigger';
import { ProfileOverviewCard } from '@/components/profile/ProfileOverviewCard';
import { BioCard, SkillsCard } from '@/components/profile/ProfileSections';
import { ExperienceSection } from '@/components/profile/ExperienceSection';
import { ExperienceModal } from '@/components/profile/ExperienceModal';
import { EducationSection } from '@/components/profile/EducationSection';
import { EducationModal } from '@/components/profile/EducationModal';
import { ProjectSection } from '@/components/profile/ProjectSection';
import { ProjectModal } from '@/components/profile/ProjectModal';
import { LanguageSection } from '@/components/profile/LanguageSection';
import { LanguageModal } from '@/components/profile/LanguageModal';
import { AvailabilitySection } from '@/components/profile/AvailabilitySection';
import { AvailabilityModal } from '@/components/profile/AvailabilityModal';
import { SocialLinksSection } from '@/components/profile/SocialLinksSection';
import { SocialLinksModal } from '@/components/profile/SocialLinksModal';
import { Modal } from '@/components/common/Modal';
import { TextArea } from '@/components/common/TextArea';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';

// ─── CV Upload Banner ─────────────────────────────────────────────────────────

function CVUploadBanner({ onParsed }: { onParsed: (extracted: ParsedResumeProfile) => void }) {
  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 relative overflow-hidden mb-8 shadow-sm group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform">
        <Sparkles size={120} className="text-indigo-600" />
      </div>
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
             <div className="w-1.5 h-7 bg-indigo-600 rounded-full" />
             <h2 className="text-2xl font-black text-gray-900 tracking-tight">Quick Profile Setup</h2>
          </div>
          <p className="text-gray-500 text-sm font-medium max-w-xl leading-relaxed">
            Ready to jumpstart your career? Upload your resume and our AI will automatically populate your skills, experience, and profile details in seconds.
          </p>
        </div>
        <div className="flex-shrink-0">
          <CVUploadTrigger onParsed={onParsed} variant="button" className="!px-10 !py-3.5 !text-base !rounded-2xl shadow-xl shadow-indigo-100/50" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Content ────────────────────────────────────────────────────────

function ProfilePageContent() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  
  // Modals state
  const [activeModal, setActiveModal] = useState<'experience' | 'education' | 'project' | 'language' | 'availability' | 'socialLinks' | 'skills' | 'bio' | 'general' | null>(null);
  const [editingExpIdx, setEditingExpIdx] = useState<number | null>(null);
  const [editingEduIdx, setEditingEduIdx] = useState<number | null>(null);
  const [editingProjectIdx, setEditingProjectIdx] = useState<number | null>(null);
  const [editingLangIdx, setEditingLangIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('Intermediate');

  // Local Form State (initialized from Redux)
  const [form, setForm] = useState({
    name: user?.profile?.name || '',
    phone: user?.profile?.phone || '',
    position: user?.profile?.position || '',
    headline: user?.profile?.headline || '',
    location: user?.profile?.location || '',
    bio: user?.profile?.bio || '',
    skills: user?.profile?.skills || ([] as SkillEntry[]),
    languages: user?.profile?.languages || ([] as LanguageEntry[]),
    experience: user?.profile?.experience || [],
    education: user?.profile?.education || [],
    certifications: user?.profile?.certifications || ([] as CertificationEntry[]),
    projects: user?.profile?.projects || ([] as ProjectEntry[]),
    availability: user?.profile?.availability || undefined,
    socialLinks: user?.profile?.socialLinks || undefined,
  });

  // Keep local state in sync with Redux if user changes
  useEffect(() => {
    if (user) {
      setForm({
        name: user.profile.name || '',
        phone: user.profile.phone || '',
        position: user.profile.position || '',
        headline: user.profile.headline || '',
        location: user.profile.location || '',
        bio: user.profile.bio || '',
        skills: user.profile.skills || ([] as SkillEntry[]),
        languages: user.profile.languages || ([] as LanguageEntry[]),
        experience: user.profile.experience || [],
        education: user.profile.education || [],
        certifications: user.profile.certifications || ([] as CertificationEntry[]),
        projects: user.profile.projects || ([] as ProjectEntry[]),
        availability: user.profile.availability || undefined,
        socialLinks: user.profile.socialLinks || undefined,
      });
    }
  }, [user]);

  // Called after CV upload completes — Redux state already has the updated user from the
  // server response, so the useEffect above will re-sync the form automatically.
  const handleCVParsed = useCallback((_extracted: ParsedResumeProfile) => {
    // no-op: the useEffect([user]) handles re-syncing the form
  }, []);

  const saveToBackend = async (updates: any) => {
    setSaving(true);
    try {
      // Calculate completion based on Talent Profile Schema Specification components
      const checks = [
        updates.name || form.name,
        updates.phone || form.phone,
        updates.headline || form.headline,
        updates.location || form.location,
        updates.bio || form.bio,
        (updates.skills || form.skills)?.length > 0,
        (updates.experience || form.experience)?.length > 0,
        (updates.education || form.education)?.length > 0,
        (updates.projects || form.projects)?.length > 0,
        (updates.languages || form.languages)?.length > 0,
        !!(updates.availability || form.availability),
      ];
      const completion = Math.round((checks.filter(Boolean).length / checks.length) * 100);

      await dispatch(updateProfile({ ...updates, profileCompletion: completion })).unwrap();
      toast.success('Profile updated successfully');
      setActiveModal(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddExperience = (newExp: ExperienceEntry) => {
    const updated = [newExp, ...form.experience];
    saveToBackend({ experience: updated });
  };

  const handleEditExperience = (updatedExp: ExperienceEntry) => {
    if (editingExpIdx === null) return;
    const updated = [...form.experience];
    updated[editingExpIdx] = updatedExp;
    saveToBackend({ experience: updated });
    setEditingExpIdx(null);
  };

  const handleDeleteExperience = (idx: number) => {
    const updated = form.experience.filter((_, i) => i !== idx);
    saveToBackend({ experience: updated });
  };

  const handleAddEducation = (newEdu: EducationEntry) => {
    const updated = [newEdu, ...form.education];
    saveToBackend({ education: updated });
  };

  const handleEditEducation = (updatedEdu: EducationEntry) => {
    if (editingEduIdx === null) return;
    const updated = [...form.education];
    updated[editingEduIdx] = updatedEdu;
    saveToBackend({ education: updated });
    setEditingEduIdx(null);
  };

  const handleDeleteEducation = (idx: number) => {
    const updated = form.education.filter((_, i) => i !== idx);
    saveToBackend({ education: updated });
  };

  const handleAddProject = (newProject: ProjectEntry) => {
    const updated = [newProject, ...form.projects];
    saveToBackend({ projects: updated });
  };

  const handleEditProject = (updatedProject: ProjectEntry) => {
    if (editingProjectIdx === null) return;
    const updated = [...form.projects];
    updated[editingProjectIdx] = updatedProject;
    saveToBackend({ projects: updated });
    setEditingProjectIdx(null);
  };

  const handleDeleteProject = (idx: number) => {
    const updated = form.projects.filter((_, i) => i !== idx);
    saveToBackend({ projects: updated });
  };

  const handleAddLanguage = (newLang: LanguageEntry) => {
    const updated = [newLang, ...form.languages];
    saveToBackend({ languages: updated });
  };

  const handleEditLanguage = (updatedLang: LanguageEntry) => {
    if (editingLangIdx === null) return;
    const updated = [...form.languages];
    updated[editingLangIdx] = updatedLang;
    saveToBackend({ languages: updated });
    setEditingLangIdx(null);
  };

  const handleDeleteLanguage = (idx: number) => {
    const updated = form.languages.filter((_, i) => i !== idx);
    saveToBackend({ languages: updated });
  };

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (form.skills.some((entry) => entry.name.toLowerCase() === trimmed.toLowerCase())) return;

    const updated = [
      { name: trimmed, level: newSkillLevel },
      ...form.skills,
    ];
    saveToBackend({ skills: updated });
  };

  const handleRemoveSkill = (skill: SkillEntry) => {
    saveToBackend({
      skills: form.skills.filter(
        (entry) => entry.name !== skill.name || entry.level !== skill.level
      ),
    });
  };

  return (
    <TalentLayout>
      <div className="max-w-6xl mx-auto pb-20">
        {/* CV Upload Prompt (Smart Banner) */}
        <CVUploadBanner onParsed={handleCVParsed} />

        <div className="space-y-8">
          {/* Top Section: Profile Header & Rating */}
          <ProfileOverviewCard 
            user={user} 
            onEdit={() => setActiveModal('general')}
            onViewPublic={() => router.push('/talent/profile/preview')}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left/Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio Section */}
              <BioCard 
                bio={form.bio} 
                onEdit={() => setActiveModal('bio')} 
              />

              {/* Experience Section */}
              <ExperienceSection 
                experiences={form.experience}
                onAdd={() => { setEditingExpIdx(null); setActiveModal('experience'); }}
                onEdit={(idx) => { setEditingExpIdx(idx); setActiveModal('experience'); }}
                onDelete={handleDeleteExperience}
              />

              {/* Education Section */}
              <EducationSection 
                education={form.education}
                onAdd={() => { setEditingEduIdx(null); setActiveModal('education'); }}
                onEdit={(idx) => { setEditingEduIdx(idx); setActiveModal('education'); }}
                onDelete={handleDeleteEducation}
              />

              {/* Projects Section */}
              <ProjectSection 
                projects={form.projects}
                onAdd={() => { setEditingProjectIdx(null); setActiveModal('project'); }}
                onEdit={(idx) => { setEditingProjectIdx(idx); setActiveModal('project'); }}
                onDelete={handleDeleteProject}
              />

              {/* Languages Section */}
              <LanguageSection 
                languages={form.languages}
                onAdd={() => { setEditingLangIdx(null); setActiveModal('language'); }}
                onEdit={(idx) => { setEditingLangIdx(idx); setActiveModal('language'); }}
                onDelete={handleDeleteLanguage}
              />

              {/* Availability Section */}
              <AvailabilitySection 
                availability={form.availability}
                onEdit={() => setActiveModal('availability')}
              />

              {/* Social Links Section */}
              <SocialLinksSection 
                socialLinks={form.socialLinks}
                onEdit={() => setActiveModal('socialLinks')}
              />
            </div>

            {/* Right Sidebar Column */}
            <div className="space-y-8">
              {/* Skills Section */}
              <SkillsCard 
                skills={form.skills} 
                onAdd={() => setActiveModal('skills')}
                onRemove={handleRemoveSkill}
              />
              
              {/* Quick Info / Tip Card */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 text-gray-900 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform">
                  <Sparkles size={64} className="text-indigo-600" />
                </div>
                <h4 className="font-black text-lg mb-2 text-indigo-600 flex items-center gap-2">
                   Pro Tip 🚀
                </h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Talents with detailed work descriptions and at least 5 technical skills are 3x more likely to be contacted by top recruiters.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Modals ── */}

        {/* Experience Modal */}
        <ExperienceModal 
          isOpen={activeModal === 'experience'}
          onClose={() => setActiveModal(null)}
          onSave={editingExpIdx !== null ? handleEditExperience : handleAddExperience}
          initialData={editingExpIdx !== null ? form.experience[editingExpIdx] : undefined}
        />

        {/* Education Modal */}
        <EducationModal 
          isOpen={activeModal === 'education'}
          onClose={() => setActiveModal(null)}
          onSave={editingEduIdx !== null ? handleEditEducation : handleAddEducation}
          initialData={editingEduIdx !== null ? form.education[editingEduIdx] : undefined}
        />

        {/* Project Modal */}
        <ProjectModal 
          isOpen={activeModal === 'project'}
          onClose={() => setActiveModal(null)}
          onSave={editingProjectIdx !== null ? handleEditProject : handleAddProject}
          initialData={editingProjectIdx !== null ? form.projects[editingProjectIdx] : undefined}
        />

        {/* Language Modal */}
        <LanguageModal 
          isOpen={activeModal === 'language'}
          onClose={() => setActiveModal(null)}
          onSave={editingLangIdx !== null ? handleEditLanguage : handleAddLanguage}
          initialData={editingLangIdx !== null ? form.languages[editingLangIdx] : undefined}
        />

        {/* Availability Modal */}
        <AvailabilityModal 
          isOpen={activeModal === 'availability'}
          onClose={() => setActiveModal(null)}
          onSave={(data) => saveToBackend({ availability: data })}
          initialData={form.availability}
        />

        {/* Social Links Modal */}
        <SocialLinksModal 
          isOpen={activeModal === 'socialLinks'}
          onClose={() => setActiveModal(null)}
          onSave={(data) => saveToBackend({ socialLinks: data })}
          initialData={form.socialLinks}
        />

        {/* Bio Modal */}
        <Modal
          isOpen={activeModal === 'bio'}
          onClose={() => setActiveModal(null)}
          title="Update Bio"
          subtitle="Describe your professional career and value proposition."
        >
          <div className="space-y-4">
            <TextArea
              label="Professional Summary"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={8}
              placeholder="e.g. Passionate Software Engineer with 5+ years of experience..."
            />
            <button
              onClick={() => saveToBackend({ bio: form.bio })}
              disabled={saving}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </Modal>

        {/* Skills Modal */}
        <Modal
          isOpen={activeModal === 'skills'}
          onClose={() => setActiveModal(null)}
          title="Technical Skills"
          subtitle="Add relevant technologies, frameworks, and methodologies."
        >
          <div className="space-y-4">
             <div className="flex gap-2">
                <Input 
                  placeholder="e.g. Next.js, Docker, AI/ML..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSkill((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <div className="w-40">
                  <Select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
                    options={[
                      { value: 'Beginner', label: 'Beginner' },
                      { value: 'Intermediate', label: 'Intermediate' },
                      { value: 'Advanced', label: 'Advanced' },
                      { value: 'Expert', label: 'Expert' },
                    ]}
                  />
                </div>
             </div>
             <p className="text-[10px] text-gray-400 font-medium">Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border">Enter</kbd> to add multiple skills</p>
             <div className="flex flex-wrap gap-2 pt-2">
               {form.skills.map((skill) => (
                 <span
                   key={`${skill.name}-${skill.level}-${skill.yearsOfExperience || 0}`}
                   className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100 flex items-center gap-2"
                 >
                   <span>{skill.name}</span>
                   <span className="text-[9px] text-gray-400 uppercase tracking-wider">
                     {skill.level}
                     {skill.yearsOfExperience ? ` · ${skill.yearsOfExperience} yrs` : ''}
                   </span>
                   <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-500">
                     <X size={12} />
                   </button>
                 </span>
               ))}
             </div>
             <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-4 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              Done
            </button>
          </div>
        </Modal>

        {/* General Info Modal */}
        <Modal
          isOpen={activeModal === 'general'}
          onClose={() => setActiveModal(null)}
          title="Account Information"
          subtitle="Update your basic contact and professional details."
        >
          <div className="space-y-4">
            <Input 
               label="Full Name"
               value={form.name}
               onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input 
               label="Professional Position"
               value={form.position}
               onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
            <Input 
               label="Phone Number"
               value={form.phone}
               onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input 
               label="Headline"
               value={form.headline}
               onChange={(e) => setForm({ ...form, headline: e.target.value })}
            />
            <Input 
               label="Location"
               value={form.location}
               onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <button
              onClick={() => saveToBackend({
                name: form.name,
                position: form.position,
                phone: form.phone,
                headline: form.headline,
                location: form.location,
              })}
              disabled={saving}
              className="w-full mt-4 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save Updates
            </button>
          </div>
        </Modal>
      </div>
    </TalentLayout>
  );
}

export default function TalentProfilePage() {
  return (
    <ProtectedRoute requiredRole="talent">
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
