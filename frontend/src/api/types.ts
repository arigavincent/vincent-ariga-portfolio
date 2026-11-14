/** Types mirroring the backend DTOs (see backend/src/main/java/.../dto). */

export type PublicationStatus = 'DRAFT' | 'PUBLISHED';
export type SkillCategory = 'BACKEND' | 'FRONTEND' | 'TOOLING';

export interface SiteSettings {
  displayName: string;
  brandMark: string;
  role: string;
  headline: string;
  tagline: string;
  bio: string;
  heritageNote: string | null;
  location: string;
  availability: string;
  email: string;
  phoneDisplay: string;
  whatsappNumber: string;
  githubUrl: string;
  footerLine: string;
  seoTitle: string;
  seoDescription: string;
  updatedAt: string | null;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  techStack: string[];
  highlights: string[];
  coverImageUrl: string | null;
  repoUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  status: PublicationStatus;
  sortOrder: number;
  updatedAt: string | null;
}

export interface Skill {
  id: number;
  name: string;
  category: SkillCategory;
  detail: string | null;
  iconKey: string | null;
  sortOrder: number;
}

export interface Experience {
  id: number;
  title: string;
  organization: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  description: string;
  sortOrder: number;
}

export interface Education {
  id: number;
  institution: string;
  qualification: string;
  grade: string | null;
  startYear: number | null;
  endYear: number | null;
  description: string | null;
  sortOrder: number;
}

export interface ServiceOffering {
  id: number;
  title: string;
  description: string;
  iconKey: string | null;
  sortOrder: number;
}

export interface BlogPostSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  tags: string[];
  status: PublicationStatus;
  publishedAt: string | null;
  updatedAt: string | null;
}

export interface BlogPost extends BlogPostSummary {
  content: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
  /** Honeypot: must stay empty. */
  website?: string;
}

export interface ContactReceipt {
  message: string;
}

export interface FieldViolation {
  field: string;
  message: string;
}

/** The error JSON every backend endpoint returns. */
export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: FieldViolation[];
}
