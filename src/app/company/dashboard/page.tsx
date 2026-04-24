'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CompanyLayout } from '@/components/layout/CompanyLayout';
import { Loader } from '@/components/common/Loader';
import { Button } from '@/components/common/Button';
import apiClient from '@/store/api/apiClient';
import { Job } from '@/types';
import {
  Briefcase,
  Users,
  CheckCircle,
  TrendingUp,
  Plus,
  Clock,
  ArrowRight,
  Brain,
  Upload,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';

interface DashboardData {
  totalJobs: number;
  activeJobs: number;
  draftJobs: number;
  closedJobs: number;
  totalApplicants: number;
  completedScreenings: number;
  inProgressScreenings: number;
  recentJobs: Job[];
  jobsChartData: { name: string; applicants: number; status: string }[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const STATUS_COLORS: Record<string, string> = {
  active: '#6366f1',
  draft: '#94a3b8',
  closed: '#ef4444',
};

const PIE_COLORS = ['#6366f1', '#94a3b8', '#ef4444'];

export default function CompanyDashboard() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/company/dashboard/stats');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array to prevent recreation

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]); // Include fetchDashboard in dependencies

  const pieData = data
    ? [
        { name: 'Active', value: data.activeJobs },
        { name: 'Draft', value: data.draftJobs },
        { name: 'Closed', value: data.closedJobs },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <ProtectedRoute requiredRole="company">
      <CompanyLayout>
        {loading || !data ? (
          <div className="flex justify-center py-24">
            <Loader size="lg" text="Loading dashboard..." />
          </div>
        ) : (
          <div className="space-y-7">
            {/* Page header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-gray-900">
                  Welcome back, {user?.profile?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Here's your recruitment overview for today
                </p>
              </div>
              <Button onClick={() => router.push('/jobs/new')} className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                <Plus size={18} /> Post New Job
              </Button>
            </div>

            {/* Primary stat cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
              {[
                {
                  label: 'Total Jobs',
                  value: data.totalJobs,
                  sub: `${data.activeJobs} active`,
                  icon: Briefcase,
                  color: 'text-indigo-600',
                  bg: 'bg-indigo-50',
                  ring: 'ring-indigo-100',
                  href: '/company/jobs',
                },
                {
                  label: 'Total Applicants',
                  value: data.totalApplicants,
                  sub: 'across all jobs',
                  icon: Users,
                  color: 'text-blue-600',
                  bg: 'bg-blue-50',
                  ring: 'ring-blue-100',
                  href: '/company/candidates',
                },
                {
                  label: 'Screenings Done',
                  value: data.completedScreenings,
                  sub: `${data.inProgressScreenings} in progress`,
                  icon: CheckCircle,
                  color: 'text-green-600',
                  bg: 'bg-green-50',
                  ring: 'ring-green-100',
                  href: '/company/screening',
                },
                {
                  label: 'Active Roles',
                  value: data.activeJobs,
                  sub: `${data.draftJobs} drafts`,
                  icon: TrendingUp,
                  color: 'text-purple-600',
                  bg: 'bg-purple-50',
                  ring: 'ring-purple-100',
                  href: '/company/jobs',
                },
              ].map(({ label, value, sub, icon: Icon, color, bg, ring, href }) => (
                <div
                  key={label}
                  onClick={() => router.push(href)}
                  className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm ring-1 ${ring} cursor-pointer hover:shadow-md hover:border-gray-200 transition-all group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                      <Icon className={`${color}`} size={22} strokeWidth={2.5} />
                    </div>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors mt-1" />
                  </div>
                  <p className={`text-3xl font-black ${color} mb-1`}>{value}</p>
                  <p className="text-xs font-bold text-gray-700">{label}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{sub}</p>
                </div>
              ))}
            </div>

            {/* Middle row: chart + pie + quick actions */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Bar chart: applicants per job */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-bold text-gray-900 text-base">Applicants Per Job</h2>
                    <p className="text-xs text-gray-500 mt-1">Top 8 job postings by applicant count</p>
                  </div>
                  <button
                    onClick={() => router.push('/company/jobs')}
                    className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                  >
                    All jobs <ArrowRight size={12} />
                  </button>
                </div>
                {data.jobsChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.jobsChartData} barSize={18}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 9, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="applicants" radius={[6, 6, 0, 0]}>
                        {data.jobsChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={STATUS_COLORS[entry.status] || '#6366f1'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                    <Briefcase size={32} className="text-gray-200" />
                    No jobs yet — create your first posting!
                  </div>
                )}
                <div className="flex gap-4 mt-4">
                  {Object.entries(STATUS_COLORS).map(([status, color]) => (
                    <div key={status} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                      <span className="capitalize">{status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie chart: job status breakdown */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="mb-5">
                  <h2 className="font-bold text-gray-900 text-base">Job Status</h2>
                  <p className="text-xs text-gray-500 mt-1">Distribution of all postings</p>
                </div>
                {pieData.length > 0 ? (
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((_, index) => (
                            <Cell key={`pie-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          formatter={(value) => (
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>{value}</span>
                          )}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '10px',
                            border: 'none',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                            fontSize: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">
                    No data yet
                  </div>
                )}
              </div>
            </div>

            {/* Bottom row: recent jobs + quick actions */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Jobs list */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <div>
                    <h2 className="font-bold text-gray-900 text-base">Recent Job Postings</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Your latest recruitment activities</p>
                  </div>
                  <button
                    onClick={() => router.push('/company/jobs')}
                    className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                  >
                    View all <ArrowRight size={12} />
                  </button>
                </div>

                {data.recentJobs.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Briefcase size={36} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-sm">No jobs posted yet</p>
                    <button
                      onClick={() => router.push('/jobs/new')}
                      className="mt-3 text-indigo-600 text-sm font-bold hover:underline"
                    >
                      Post your first job →
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {data.recentJobs.map((job) => (
                      <div
                        key={job._id}
                        onClick={() => router.push(`/jobs/${job._id}`)}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Briefcase size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                            {job.title}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wide ${
                                job.status === 'active'
                                  ? 'text-green-600'
                                  : job.status === 'draft'
                                  ? 'text-gray-400'
                                  : 'text-red-500'
                              }`}
                            >
                              {job.status}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {job.applicantCount} applicants
                            </span>
                            {job.screeningStatus === 'completed' && (
                              <span className="text-[10px] text-indigo-600 font-bold">
                                ✓ Screened
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 flex-shrink-0">
                          <Clock size={11} />
                          {timeAgo(job.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="px-6 py-4 border-t border-gray-100">
                  <button
                    onClick={() => router.push('/jobs/new')}
                    className="w-full py-2.5 border-2 border-dashed border-indigo-200 text-indigo-600 text-sm font-bold rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={15} /> Post a New Job
                  </button>
                </div>
              </div>

              {/* Quick Actions panel */}
              <div className="space-y-4">
                {/* CTA card */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md hover:shadow-lg transition-shadow">
                  <Brain size={32} className="mb-3 opacity-90" />
                  <h3 className="font-bold text-lg mb-2">AI Screening</h3>
                  <p className="text-indigo-100 text-xs mb-5 leading-relaxed">
                    Upload candidates and let Gemini AI rank and score them instantly.
                  </p>
                  <button
                    onClick={() => router.push('/company/candidates')}
                    className="w-full py-2.5 bg-white text-indigo-700 font-bold text-sm rounded-xl hover:bg-indigo-50 transition-colors shadow-sm"
                  >
                    Upload Candidates
                  </button>
                </div>

                {/* Quick nav tiles */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: 'Post Job',
                      icon: Plus,
                      href: '/jobs/new',
                      color: 'bg-green-50 text-green-700',
                    },
                    {
                      label: 'My Jobs',
                      icon: Briefcase,
                      href: '/company/jobs',
                      color: 'bg-indigo-50 text-indigo-700',
                    },
                    {
                      label: 'Upload',
                      icon: Upload,
                      href: '/company/candidates',
                      color: 'bg-orange-50 text-orange-700',
                    },
                    {
                      label: 'Results',
                      icon: FileText,
                      href: '/company/screening',
                      color: 'bg-purple-50 text-purple-700',
                    },
                  ].map(({ label, icon: Icon, href, color }) => (
                    <button
                      key={label}
                      onClick={() => router.push(href)}
                      className={`${color} rounded-xl p-3.5 text-left hover:opacity-90 transition-opacity`}
                    >
                      <Icon size={18} className="mb-2" />
                      <p className="text-xs font-bold">{label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CompanyLayout>
    </ProtectedRoute>
  );
}
