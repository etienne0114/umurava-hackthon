export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type LanguageProficiency = 'Basic' | 'Conversational' | 'Fluent' | 'Native';

export interface SkillEntry {
  name: string;
  level: SkillLevel;
  yearsOfExperience?: number;
}

export interface LanguageEntry {
  name: string;
  proficiency: LanguageProficiency;
}

export interface ExperienceEntry {
  role: string;
  company: string;
  duration?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  technologies?: string[];
  isCurrent?: boolean;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  description?: string;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  issueDate?: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  role: string;
  technologies: string[];
  link?: string;
  startDate?: string;
  endDate?: string;
}

export interface Availability {
  status: 'Available' | 'Open to Opportunities' | 'Not Available';
  type: 'Full-time' | 'Part-time' | 'Contract';
  startDate?: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
  website?: string;
}

export interface WeightConfig {
  skills: number;
  experience: number;
  education: number;
  relevance: number;
}

export interface JobRequirements {
  skills: string;
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

export interface UserProfile {
  name: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  location?: string;
  phone?: string;
  company?: string;
  position?: string;
  bio?: string;
  avatar?: string;
  profileCompletion?: number;
  videoUrl?: string;
  skills?: SkillEntry[];
  languages?: LanguageEntry[];
  experience?: ExperienceEntry[];
  education?: EducationEntry[];
  certifications?: CertificationEntry[];
  projects?: ProjectEntry[];
  availability?: Availability;
  socialLinks?: SocialLinks;
  resumeUrl?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
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
  /** Returned by AI recommendation endpoint */
  matchScore?: number;
  /** Returned by recommendation endpoint — whether the talent has saved this job */
  isSaved?: boolean;
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
  profile: UserProfile & { email: string; bio?: string };
  metadata?: {
    fileName?: string;
    uploadedAt?: string;
  };
  status: 'pending' | 'shortlisted' | 'rejected' | 'hired';
  assessmentStatus: 'not_sent' | 'sent' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ScreeningResult {
  _id: string;
  rank: number;
  matchScore: number;
  scoreBreakdown: {
    skills: number;
    experience: number;
    education: number;
    relevance: number;
  };
  evaluation: {
    recommendation: Recommendation;
    reasoning: string;
    strengths: string[];
    gaps: string[];
    risks: string[];
    aiFallback?: boolean;
  };
  applicantId: string | Applicant;
  jobId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScreeningSession {
  _id: string;
  jobId: string;
  status: SessionStatus;
  startedAt?: string;
  completedAt?: string;
  totalApplicants?: number;
  processedApplicants?: number;
  error?: string;
  options?: {
    batchSize?: number;
    batchMode?: boolean;
    [key: string]: any;
  };
  aiProviderStatus?: {
    primaryProvider: 'gemini' | 'groq';
    currentProvider: 'gemini' | 'groq';
    fallbackCount: number;
    geminiQuotaExhausted: boolean;
    groqErrors: number;
    lastProviderSwitch?: string;
    providerSwitchReason?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AssessmentQuestion {
  question: string;
  options?: string[];
  expectedAnswer?: string;
  correctOptionIndex?: number;
}

export interface Assessment {
  _id: string;
  jobId: string | Job;
  applicantId: string | Applicant;
  questions: AssessmentQuestion[];
  candidateAnswers?: Array<{
    question: string;
    answer: string;
    selectedOptionIndex?: number;
  }>;
  grading?: {
    totalScore?: number;
    perQuestion?: Array<{
      question: string;
      score: number;
      feedback: string;
    }>;
    overallFeedback?: string;
    provider?: string;
    model?: string;
    gradedAt?: string;
  };
  status: 'pending' | 'completed' | 'expired';
  timePerQuestionSeconds?: number;
  timeLimitSeconds?: number;
  startedAt?: string;
  timedOut?: boolean;
  dueAt?: string;
  expiresAt?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}
