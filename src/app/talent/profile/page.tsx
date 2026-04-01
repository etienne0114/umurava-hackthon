'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateProfile, uploadResume, ParsedResumeProfile, ExperienceEntry, EducationEntry } from '@/store/slices/authSlice';
import { TalentLayout } from '@/components/layout/TalentLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Upload, FileText, CheckCircle2, Sparkles, X, Plus,
  Briefcase, GraduationCap, User, Phone, Mail, Loader2,
  ChevronDown, ChevronUp, MapPin, Building2, Calendar, Languages,
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { AvatarUpload } from '@/components/profile/AvatarUpload';

// ─── CV Upload Zone ────────────────────────────────────────────────────────────

interface CVUploadProps {
  onParsed: (extracted: ParsedResumeProfile) => void;
}

function CVUploadZone({ onParsed }: CVUploadProps) {
  const dispatch = useAppDispatch();
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const allowed = ['application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|txt|doc|docx)$/i)) {
      toast.error('Please upload a PDF, Word, or text file');
      return;
    }
    setFileName(file.name);
    setStatus('uploading');
    setErrorMsg('');
    try {
      const result = await dispatch(uploadResume(file)).unwrap();
      setStatus('done');
      const msg = (result as any).parsedBy === 'text-fallback'
        ? 'CV parsed! Profile auto-filled — review and save.'
        : 'CV parsed by AI! Profile auto-filled — review and save.';
      toast.success(msg);
      onParsed(result.extracted);
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : (err?.message || 'Failed to parse CV.');
      const isRateLimit = msg.toLowerCase().includes('rate-limit') || msg.toLowerCase().includes('quota');
      setStatus('error');
      setErrorMsg(isRateLimit ? 'AI is rate-limited. Please wait ~1 minute and try again.' : msg);
      toast.error(isRateLimit ? 'AI rate limited — try again in a minute' : msg);
    }
  }, [dispatch, onParsed]);

  return (
    <div
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => status !== 'uploading' && fileInputRef.current?.click()}
      className={clsx(
        'relative rounded-xl border-2 border-dashed transition-all cursor-pointer p-6 text-center',
        dragOver ? 'border-blue-400 bg-blue-50 scale-[1.01]' :
        status === 'done' ? 'border-green-400 bg-green-50 cursor-default' :
        status === 'error' ? 'border-red-300 bg-red-50' :
        'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
      )}
    >
      <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />

      {status === 'uploading' && (
        <div className="flex flex-col items-center gap-2 py-2">
          <Loader2 size={28} className="text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-blue-700">Parsing <strong>{fileName}</strong>…</p>
          <p className="text-xs text-gray-400">Extracting skills, experience, education…</p>
        </div>
      )}

      {status === 'done' && (
        <div className="flex flex-col items-center gap-2 py-2">
          <CheckCircle2 size={28} className="text-green-500" />
          <p className="text-sm font-bold text-green-700">CV parsed successfully!</p>
          <p className="text-xs text-gray-500">{fileName}</p>
          <button type="button" onClick={(e) => { e.stopPropagation(); setStatus('idle'); setFileName(''); }}
            className="mt-1 text-xs text-blue-500 hover:underline">Upload a different file</button>
        </div>
      )}

      {(status === 'idle' || status === 'error') && (
        <div className="py-2">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3 border border-blue-100">
            <Upload size={20} className="text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-gray-800">
            Drop your CV here, or <span className="text-blue-600 font-bold">click to browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF, Word (.docx), or plain text — up to 5 MB</p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Sparkles size={11} className="text-indigo-400" /> AI auto-fills your profile
            </span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <FileText size={11} /> Reads PDF & Word
            </span>
          </div>
          {status === 'error' && (
            <p className="mt-3 text-xs text-red-500 font-medium">
              {errorMsg || 'Parsing failed. Try a cleaner PDF or fill the form manually.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Profile Form ─────────────────────────────────────────────────────────────

function ProfileForm() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [showExp, setShowExp] = useState(true);
  const [showEdu, setShowEdu] = useState(true);

  type FormState = {
    name: string; phone: string; position: string; bio: string;
    skills: string[]; languages: string[]; experience: ExperienceEntry[]; education: EducationEntry[];
  };

  const [form, setForm] = useState<FormState>({
    name: user?.profile?.name || '',
    phone: user?.profile?.phone || '',
    position: user?.profile?.position || '',
    bio: user?.profile?.bio || '',
    skills: ((user?.profile as any)?.skills as string[]) || [],
    languages: ((user?.profile as any)?.languages as string[]) || [],
    experience: ((user?.profile as any)?.experience as ExperienceEntry[]) || [],
    education: ((user?.profile as any)?.education as EducationEntry[]) || [],
  });

  const handleCVParsed = useCallback((extracted: ParsedResumeProfile) => {
    setForm(prev => ({
      name: extracted.name || prev.name,
      phone: extracted.phone || prev.phone,
      position: extracted.position || prev.position,
      bio: extracted.bio || prev.bio,
      skills: extracted.skills.length > 0 ? extracted.skills : prev.skills,
      languages: extracted.languages?.length > 0 ? extracted.languages : prev.languages,
      experience: extracted.experience.length > 0 ? extracted.experience : prev.experience,
      education: extracted.education.length > 0 ? extracted.education : prev.education,
    }));
  }, []);

  const [langInput, setLangInput] = useState('');

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) setForm({ ...form, skills: [...form.skills, s] });
    setSkillInput('');
  };

  const addLang = () => {
    const s = langInput.trim();
    if (s && !form.languages.includes(s)) setForm({ ...form, languages: [...form.languages, s] });
    setLangInput('');
  };

  const updateExp = (idx: number, field: keyof ExperienceEntry, value: string) => {
    const updated = [...form.experience];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, experience: updated });
  };

  const updateEdu = (idx: number, field: keyof EducationEntry, value: string) => {
    const updated = [...form.education];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, education: updated });
  };

  const calcCompletion = () => {
    const checks = [form.name, form.phone, form.position, form.bio,
      form.skills.length > 0 ? 'y' : '',
      form.experience.length > 0 ? 'y' : '',
      form.education.length > 0 ? 'y' : ''];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch(updateProfile({
        name: form.name, phone: form.phone, position: form.position, bio: form.bio,
        skills: form.skills, languages: form.languages,
        experience: form.experience, education: form.education,
        profileCompletion: calcCompletion(),
      } as any)).unwrap();
      toast.success('Profile saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const completion = calcCompletion();
  const initials = form.name
    ? form.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'T';

  const inputCls = 'w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none transition-all';
  const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5';

  return (
    <form onSubmit={handleSave} className="space-y-5">

      {/* ── Profile header card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-5 mb-5">
          {/* Avatar */}
          <AvatarUpload
            currentAvatar={user?.profile?.avatar}
            name={form.name}
            size="md"
          />
          {/* Name + completion */}
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-gray-900 truncate">{form.name || 'Your Name'}</p>
            <p className="text-sm text-gray-500 truncate">{form.position || 'Add your current position'}</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-all duration-700',
                    completion === 100 ? 'bg-green-500' : completion >= 70 ? 'bg-blue-500' : 'bg-amber-400')}
                  style={{ width: `${completion}%` }}
                />
              </div>
              <span className={clsx('text-xs font-bold tabular-nums flex-shrink-0',
                completion === 100 ? 'text-green-600' : 'text-blue-600')}>
                {completion}%
              </span>
            </div>
          </div>
        </div>
        {/* CV Upload */}
        <CVUploadZone onParsed={handleCVParsed} />
      </div>

      {/* ── Two-column layout for main content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── Left column: Personal info + Bio ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Personal Info</h3>

            <div className="space-y-3">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls} placeholder="e.g. Jane Doe" />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input value={user?.email || ''} disabled
                    className="w-full bg-gray-50 border border-transparent rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={clsx(inputCls, 'pl-9')} placeholder="+250 700 000 000" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Current Position</label>
                <div className="relative">
                  <Briefcase size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className={clsx(inputCls, 'pl-9')} placeholder="e.g. Software Engineer" />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Professional Summary</h3>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={5} maxLength={500}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none transition-all resize-none leading-relaxed"
              placeholder="Describe your expertise, achievements, and career goals…" />
            <p className="text-[11px] text-gray-400 text-right mt-1">{form.bio.length}/500</p>
          </div>
        </div>

        {/* ── Right column: Skills + Experience + Education ── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Skills */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800">Skills</h3>
              <span className="text-xs text-gray-400">{form.skills.length} added</span>
            </div>

            <div className="flex gap-2 mb-3">
              <input type="text" value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                placeholder="Type a skill and press Enter"
                className={clsx(inputCls, 'flex-1')} />
              <button type="button" onClick={addSkill}
                className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <Plus size={14} /> Add
              </button>
            </div>

            {form.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {form.skills.map((skill: string) => (
                  <span key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100 hover:border-blue-300 transition-colors">
                    {skill}
                    <button type="button" onClick={() => setForm({ ...form, skills: form.skills.filter((s: string) => s !== skill) })}
                      className="text-blue-300 hover:text-red-500 transition-colors ml-0.5">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                No skills yet — upload your CV to auto-extract them
              </p>
            )}
          </div>

          {/* Languages */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800">Languages</h3>
              <span className="text-xs text-gray-400">{form.languages.length} added</span>
            </div>

            <div className="flex gap-2 mb-3">
              <input type="text" value={langInput}
                onChange={(e) => setLangInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLang(); } }}
                placeholder="e.g. English, French, Kinyarwanda"
                className={clsx(inputCls, 'flex-1')} />
              <button type="button" onClick={addLang}
                className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <Plus size={14} /> Add
              </button>
            </div>

            {form.languages.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {form.languages.map((lang: string) => (
                  <span key={lang}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100 hover:border-indigo-300 transition-colors">
                    {lang}
                    <button type="button" onClick={() => setForm({ ...form, languages: form.languages.filter((l: string) => l !== lang) })}
                      className="text-indigo-300 hover:text-red-500 transition-colors ml-0.5">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                No languages yet — upload your CV or add manually
              </p>
            )}
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-bold text-gray-800">Work Experience</h3>
              <div className="ml-auto flex items-center gap-2">
                <button type="button"
                  onClick={() => setForm({ ...form, experience: [{ title: '', company: '', duration: '', description: '' }, ...form.experience] })}
                  className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">
                  <Plus size={12} /> Add
                </button>
                <button type="button" onClick={() => setShowExp(!showExp)} className="text-gray-400 hover:text-gray-600 p-1">
                  {showExp ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>
            </div>

            {showExp && (
              form.experience.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded-lg">
                  No experience added — upload your CV to auto-extract it
                </p>
              ) : (
                <div className="space-y-4">
                  {form.experience.map((exp: ExperienceEntry, idx: number) => (
                    <div key={idx} className="group relative border border-gray-200 rounded-xl overflow-hidden hover:border-blue-200 transition-colors">
                      {/* Card header */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <Building2 size={14} className="text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {exp.title || exp.company || 'New Position'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {[exp.company, exp.duration].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <button type="button"
                          onClick={() => setForm({ ...form, experience: form.experience.filter((_: any, i: number) => i !== idx) })}
                          className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
                          <X size={14} />
                        </button>
                      </div>

                      {/* Card fields */}
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>Job Title</label>
                            <input value={exp.title} onChange={(e) => updateExp(idx, 'title', e.target.value)}
                              className={inputCls} placeholder="e.g. Software Engineer" />
                          </div>
                          <div>
                            <label className={labelCls}>Company</label>
                            <input value={exp.company} onChange={(e) => updateExp(idx, 'company', e.target.value)}
                              className={inputCls} placeholder="e.g. Google" />
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>Duration</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                              <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                              <input
                                type="month"
                                value={exp.duration?.split(/\s*[–\-to]+\s*/i)[0]?.trim().replace(/^(\w+)\s+(\d{4})$/, (_, m, y) => `${y}-${String(['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(m.toLowerCase().slice(0,3))+1).padStart(2,'0')}`) || ''}
                                onChange={(e) => {
                                  const [y, m] = e.target.value.split('-');
                                  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                                  const from = e.target.value ? `${months[parseInt(m)-1]} ${y}` : '';
                                  const to = exp.duration?.split(/\s*[–\-to]+\s*/i)[1]?.trim() || 'Present';
                                  updateExp(idx, 'duration', from ? `${from} – ${to}` : '');
                                }}
                                className={clsx(inputCls, 'pl-8')} />
                            </div>
                            <div className="relative">
                              <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                              <input
                                type="month"
                                placeholder="Present"
                                value={(() => {
                                  const to = exp.duration?.split(/\s*[–\-to]+\s*/i)[1]?.trim() || '';
                                  if (!to || /present|current|now/i.test(to)) return '';
                                  const match = to.match(/^(\w+)\s+(\d{4})$/);
                                  if (!match) return '';
                                  const mIdx = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(match[1].toLowerCase().slice(0,3));
                                  return mIdx >= 0 ? `${match[2]}-${String(mIdx+1).padStart(2,'0')}` : '';
                                })()}
                                onChange={(e) => {
                                  const from = exp.duration?.split(/\s*[–\-to]+\s*/i)[0]?.trim() || '';
                                  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                                  const [y, m] = e.target.value.split('-');
                                  const to = e.target.value ? `${months[parseInt(m)-1]} ${y}` : 'Present';
                                  updateExp(idx, 'duration', from ? `${from} – ${to}` : '');
                                }}
                                className={clsx(inputCls, 'pl-8')} />
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">
                            {exp.duration || 'Select start and end month (leave end blank for Present)'}
                          </p>
                        </div>
                        <div>
                          <label className={labelCls}>Description</label>
                          <textarea value={exp.description || ''} onChange={(e) => updateExp(idx, 'description', e.target.value)}
                            rows={3}
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none transition-all resize-none leading-relaxed"
                            placeholder="Key responsibilities and achievements…" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-bold text-gray-800">Education</h3>
              <div className="ml-auto flex items-center gap-2">
                <button type="button"
                  onClick={() => setForm({ ...form, education: [{ degree: '', institution: '', year: '' }, ...form.education] })}
                  className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">
                  <Plus size={12} /> Add
                </button>
                <button type="button" onClick={() => setShowEdu(!showEdu)} className="text-gray-400 hover:text-gray-600 p-1">
                  {showEdu ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>
            </div>

            {showEdu && (
              form.education.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded-lg">
                  No education added — upload your CV to auto-extract it
                </p>
              ) : (
                <div className="space-y-3">
                  {form.education.map((edu: EducationEntry, idx: number) => (
                    <div key={idx} className="group relative bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors">
                      <button type="button"
                        onClick={() => setForm({ ...form, education: form.education.filter((_: any, i: number) => i !== idx) })}
                        className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <X size={14} />
                      </button>

                      {edu.degree && (
                        <div className="flex items-start gap-2 mb-3 pr-6">
                          <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <GraduationCap size={14} className="text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{edu.degree}</p>
                            <p className="text-xs text-gray-500">{edu.institution} {edu.year && `· ${edu.year}`}</p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Degree & Field</label>
                          <input value={edu.degree} onChange={(e) => updateEdu(idx, 'degree', e.target.value)}
                            className={inputCls} placeholder="e.g. B.Sc. Computer Science" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Year</label>
                          <input value={edu.year} onChange={(e) => updateEdu(idx, 'year', e.target.value)}
                            className={inputCls} placeholder="2022" />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Institution</label>
                          <div className="relative">
                            <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input value={edu.institution} onChange={(e) => updateEdu(idx, 'institution', e.target.value)}
                              className={clsx(inputCls, 'pl-8')} placeholder="e.g. University of Rwanda" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
        <p className="text-sm text-gray-500">
          {completion < 100
            ? `${7 - Math.round((completion / 100) * 7)} section${7 - Math.round((completion / 100) * 7) !== 1 ? 's' : ''} remaining`
            : 'All sections complete ✓'}
        </p>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-7 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm shadow-blue-200">
          {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><CheckCircle2 size={15} /> Save Profile</>}
        </button>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ProfilePageContent() {
  return (
    <TalentLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload your CV for instant auto-fill, or edit manually below
          </p>
        </div>
        <ProfileForm />
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
