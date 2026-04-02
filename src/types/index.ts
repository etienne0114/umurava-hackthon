export interface WeightConfig {
  skills: number;
  experience: number;
  education: number;
  relevance: number;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  duration: string;
  description?: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
}

export interface JobRequirements {
  skills: string[];
  experience: {
    minYears: number;
    maxYears?: number;
  };
  education: string[];
  location?: string;
}

export type JobStatus = 'draft' | 'active' | 'closed';
export type ScreeningStatus = 'not_started' | 'in_progress' | 'completed';
export type ApplicantSource = 'umurava' | 'upload';
export type Recommendation = 'highly_recommended' | 'recommended' | 'consider' | 'not_recommended';
export type SessionStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type UserRole = 'talent' | 'company';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile: {
    name: string;
    phone?: string;
    company?: string;
    position?: string;
    bio?: string;
    avatar?: string;
  };
  isVerified: boolean;
}

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type WorkMode = 'remote' | 'on-site' | 'hybrid';
export type ApplicationStatus = 'pending' | 'reviewing' | 'hired' | 'declined';

export interface Job {
  _id: string;
  title: string;
  description: string;
  company?: string;
  employmentType?: EmploymentType;
  workMode?: WorkMode;
  requirements: JobRequirements;
  weights: WeightConfig;
  status: JobStatus;
  applicantCount: number;
  screeningStatus?: ScreeningStatus;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  _id: string;
  userId: string;
  jobId: string | Job;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Applicant {
  _id: string;
  jobId: string;
  source: ApplicantSource;
  sourceId?: string;
  profile: {
    name: string;
    email: string;
    phone?: string;
    skills: string[];
    experience: ExperienceEntry[];
    education: EducationEntry[];
    summary?: string;
    resumeUrl?: string;
  };
  metadata?: {
    fileName?: string;
    uploadedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ScreeningResult {
  _id: string;
  applicantId: string | Applicant;
  jobId: string;
  sessionId: string;
  rank: number;
  matchScore: number;
  evaluation: {
    strengths: string[];
    gaps: string[];
    risks: string[];
    recommendation: Recommendation;
    reasoning: string;
  };
  scoreBreakdown: {
    skills: number;
    experience: number;
    education: number;
    relevance: number;
  };
  createdAt: string;
}

export interface ScreeningSession {
  _id: string;
  jobId: string;
  status: SessionStatus;
  totalApplicants: number;
  processedApplicants: number;
  options: {
    topN: number;
    minScore: number;
    weights: WeightConfig;
  };
  error?: string;
  startedAt: string;
  completedAt?: string;
}
