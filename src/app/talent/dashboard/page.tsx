'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TalentLayout } from '@/components/layout/TalentLayout';
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip
} from 'recharts';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  MoreHorizontal, 
  Edit3, 
  MapPin, 
  Globe, 
  Heart,
  ExternalLink,
  Building2
} from 'lucide-react';
import clsx from 'clsx';
import apiClient from '@/store/api/apiClient';
import { useAppSelector } from '@/store';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { Job } from '@/types';
import toast from 'react-hot-toast';

/**
 * Compute relative time string from ISO date.
 */
function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/**
 * Capitalize employment type for display.
 */
function formatEmploymentType(type?: string): string {
  if (!type) return 'Full-time';
  return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
}

/**
 * Capitalize work mode for display.
 */
function formatWorkMode(mode?: string): string {
  if (!mode) return 'On-site';
  return mode.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
}

interface DashboardStats {
  submissions: number;
  pending: number;
  hired: number;
  declined: number;
}

interface EngagementData {
  totalViews: number;
  chartData: { name: string; views: number }[];
}

export default function TalentDashboard() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<DashboardStats>({ submissions: 0, pending: 0, hired: 0, declined: 0 });
  const [engagement, setEngagement] = useState<EngagementData>({ totalViews: 0, chartData: [] });
  const [recommendations, setRecommendations] = useState<Job[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const fetchRecommendations = useCallback(async (tabIndex: number) => {
    const tabTypes = ['best_match', 'open', 'recent', 'saved'];
    const type = tabTypes[tabIndex];
    try {
      setFetchingJobs(true);
      const res = await apiClient.get(`/talent/recommendations?type=${type}`);
      if (res.data.success) {
        setRecommendations(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setFetchingJobs(false);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, engagementRes, appsRes] = await Promise.all([
        apiClient.get('/talent/dashboard/stats'),
        apiClient.get('/talent/dashboard/engagement'),
        apiClient.get('/talent/applications'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (engagementRes.data.success) setEngagement(engagementRes.data.data);
      if (appsRes.data.success) setApplications(appsRes.data.data);
      
      // Initial fetch of recommendations
      await fetchRecommendations(activeTab);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, fetchRecommendations]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]); // Run only once on mount

  useEffect(() => {
    if (!loading) {
      fetchRecommendations(activeTab);
    }
  }, [activeTab, fetchRecommendations, loading]);

  const handleApply = async (jobId: string) => {
    try {
      setApplyingJobId(jobId);
      await apiClient.post(`/talent/apply/${jobId}`);
      toast.success('Application submitted successfully!');
      
      // Refresh stats and applications after applying
      const [statsRes, appsRes] = await Promise.all([
        apiClient.get('/talent/dashboard/stats'),
        apiClient.get('/talent/applications'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (appsRes.data.success) setApplications(appsRes.data.data);
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Failed to submit application';
      toast.error(message);
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleToggleSave = async (jobId: string, isSaved: boolean) => {
    try {
      if (isSaved) {
        await apiClient.delete(`/talent/saved/${jobId}`);
        toast.success('Job removed from saved');
      } else {
        await apiClient.post(`/talent/saved/${jobId}`);
        toast.success('Job saved successfully');
      }
      
      // Update local state
      setRecommendations(prev => prev.map(job => 
        job._id === jobId ? { ...job, isSaved: !isSaved } : job
      ));

      // If on saved tab, remove item
      if (activeTab === 3 && isSaved) {
        setRecommendations(prev => prev.filter(job => job._id !== jobId));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to update saved status');
    }
  };

  if (loading) {
    return (
      <TalentLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <Loader size="lg" text="Loading dashboard..." />
        </div>
      </TalentLayout>
    );
  }

  const profileCompletion = user?.profile?.profileCompletion ?? 0;
  const initials = user?.profile?.name
    ? user.profile.name.split(' ').map((n: string) => n[0]).join('')
    : 'U';

  return (
    <TalentLayout>
      <div className="space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Briefcase} label="Submissions" value={stats.submissions} color="text-gray-900" />
          <StatCard icon={Clock} label="Pending" value={stats.pending} color="text-blue-600" />
          <StatCard icon={CheckCircle} label="Hired" value={stats.hired} color="text-green-600" />
          <StatCard icon={XCircle} label="Declined" value={stats.declined} color="text-red-600" />
        </div>

        {/* Middle Row: Video, Engagement & Profile Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Card */}
          <div className="lg:col-span-1 bg-white rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer border border-gray-100 h-64">
            <img 
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800" 
              alt="Profile introduction video" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
          </div>

          {/* Engagement Chart Card */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-64 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Your Engagement</h3>
                <p className="text-2xl font-bold text-gray-900">{engagement.totalViews}</p>
                <p className="text-xs text-gray-500">Recruiter views on your profile</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 -mx-4 -mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagement.chartData}>
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={0.05} 
                    fill="#3b82f6" 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Profile Status Card */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 h-64 flex flex-col overflow-hidden">
            <div className="p-5 flex-1 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                  {initials}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{user?.profile?.name || 'Talent User'}</h3>
                  <p className="text-xs text-gray-500 font-medium">{user?.profile?.position || 'Software Engineer'}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed italic">
                {profileCompletion >= 80 
                  ? '"Your profile is strong. Keep it updated to stay ahead of other talents."'
                  : '"Complete your profile to attract more recruiters and get better matches."'
                }
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-gray-700">Profile Completion</span>
                  <span className="text-xs font-bold text-blue-600">{profileCompletion}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-1000 rounded-full" 
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={() => router.push('/talent/profile')}
              className="w-full py-4 bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Job Recommendations */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900">Job Recommendation</h2>
            <button 
              onClick={() => router.push('/jobs')}
              className="text-blue-600 text-sm font-bold hover:underline"
            >
              See All
            </button>
          </div>
           
          <div className="overflow-x-auto">
            <div className="flex space-x-8 px-6 border-b border-gray-100">
              {['Best Match', 'Open Jobs', 'Recent', 'Saved'].map((tab, i) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={clsx(
                    "py-4 text-sm font-bold transition-all relative whitespace-nowrap",
                    activeTab === i ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {tab}
                  {activeTab === i && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {recommendations.length > 0 ? (
              recommendations.map((job) => (
                <div key={job._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Building2 className="text-white w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h3 
                            className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer"
                            onClick={() => router.push(`/jobs/${job._id}`)}
                          >
                            {job.title}
                          </h3>
                          <span className={clsx(
                            "px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-tight",
                            job.matchScore > 80 ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                          )}>
                            {job.matchScore > 0 ? `${job.matchScore}% Match` : 'New Job'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">{job.company || 'Private Company'}</p>
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-2xl leading-relaxed">
                          {job.description}
                        </p>
                        <div className="flex flex-wrap gap-3 pt-1">
                          <Tag icon={MapPin} text={job.requirements?.location || 'Kigali, Rwanda'} />
                          <Tag icon={Clock} text={formatEmploymentType(job.employmentType)} />
                          <Tag icon={Globe} text={formatWorkMode(job.workMode)} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4">
                      <p className="text-[10px] text-gray-400 font-bold whitespace-nowrap uppercase">
                        {timeAgo(job.createdAt)}
                      </p>
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => handleToggleSave(job._id, job.isSaved)}
                          className={clsx(
                            "p-2.5 border rounded-xl transition-all",
                            job.isSaved 
                              ? "bg-red-50 border-red-100 text-red-500 hover:bg-red-100" 
                              : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-blue-600"
                          )}
                        >
                          <Heart className={clsx("w-5 h-5", job.isSaved && "fill-current")} />
                        </button>
                        <Button 
                          size="md" 
                          className="rounded-xl px-8 font-bold"
                          isLoading={applyingJobId === job._id}
                          disabled={applications.some(app => (typeof app.jobId === 'string' ? app.jobId : app.jobId?._id) === job._id)}
                          onClick={() => handleApply(job._id)}
                        >
                          {applications.some(app => (typeof app.jobId === 'string' ? app.jobId : app.jobId?._id) === job._id) 
                            ? 'Applied' 
                            : 'Apply'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : fetchingJobs ? (
              <div className="p-12 flex justify-center">
                <Loader text="Fetching jobs..." />
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="font-bold">No jobs found in this category.</p>
                <p className="text-sm mt-1">Try another filter or check back later!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TalentLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
      <div className="flex items-center space-x-4">
        <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 group-hover:scale-110 transition-transform", color)}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className={clsx("text-xl font-black", color)}>{value}</p>
        </div>
      </div>
      <button className="text-gray-300 group-hover:text-blue-600 transition-colors">
        <ExternalLink className="w-4 h-4" />
      </button>
    </div>
  );
}

function Tag({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center space-x-1.5 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
      <Icon className="w-3.5 h-3.5" />
      <span className="text-[11px] font-bold">{text}</span>
    </div>
  );
}
