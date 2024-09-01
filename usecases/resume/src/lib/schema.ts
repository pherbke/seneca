import { z } from "zod";

// User Schema & Type
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export type User = z.infer<typeof userSchema>;

// CV Schema & Type
export const cvSchema = z.object({
  id: z.string(),
  file_name: z.string().min(1),
  cv: z.record(z.unknown()),
  user: userSchema,
  userId: z.number(),
});

export type CV = z.infer<typeof cvSchema>;

// Company Schema & Type
export const companySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export type Company = z.infer<typeof companySchema>;

// Job Schema & Type
export const jobSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  company: companySchema,
  companyId: z.number(),
});

export type Job = z.infer<typeof jobSchema>;

// JobApplication Schema & Type
export const jobApplicationSchema = z.object({
  id: z.string(),
  user: userSchema,
  userId: z.number(),
  job: jobSchema,
  jobId: z.number(),
  cv: cvSchema,
  cvId: z.number(),
  createdAt: z.date(),
});

export type JobWithCompany = {
  company: {
    id: string;
    logo: string | null;
    name: string;
    email: string;
  };
} & {
  id: string;
  position: string;
  description: string;
  location: string | null;
  requirements: string[];
  companyId: string;
};

export type JobApplication = z.infer<typeof jobApplicationSchema>;

export type NotificationType = "general" | "vpRequest" | "vpSubmission";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
  vpData?: any;
  userId: string;
  link?: string;
  applicationId?: string;
  pd?: any;
}
