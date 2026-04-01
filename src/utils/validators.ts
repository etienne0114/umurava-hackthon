import { z } from 'zod';

export const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requiredSkills: z.array(z.string()).min(1, 'At least one skill is required'),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead']),
  educationLevel: z.enum(['high_school', 'bachelors', 'masters', 'phd']),
  weights: z
    .object({
      skills: z.number().min(0).max(1),
      experience: z.number().min(0).max(1),
      education: z.number().min(0).max(1),
      relevance: z.number().min(0).max(1),
    })
    .refine((weights) => {
      const sum = weights.skills + weights.experience + weights.education + weights.relevance;
      return Math.abs(sum - 1.0) < 0.001;
    }, 'Weights must sum to 1.0'),
  status: z.enum(['draft', 'active', 'closed']).optional(),
});

export const applicantSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  profile: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    skills: z.array(z.string()),
    experience: z.array(
      z.object({
        title: z.string(),
        company: z.string(),
        duration: z.string(),
        description: z.string().optional(),
      })
    ),
    education: z.array(
      z.object({
        degree: z.string(),
        institution: z.string(),
        year: z.string(),
      })
    ),
  }),
});

export const screeningOptionsSchema = z.object({
  topN: z.number().min(1).max(100).optional(),
  minScore: z.number().min(0).max(100).optional(),
  weights: z
    .object({
      skills: z.number().min(0).max(1),
      experience: z.number().min(0).max(1),
      education: z.number().min(0).max(1),
      relevance: z.number().min(0).max(1),
    })
    .optional(),
});

export const validateJob = (data: unknown) => {
  return jobSchema.parse(data);
};

export const validateApplicant = (data: unknown) => {
  return applicantSchema.parse(data);
};

export const validateScreeningOptions = (data: unknown) => {
  return screeningOptionsSchema.parse(data);
};
