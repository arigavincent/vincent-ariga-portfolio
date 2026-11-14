import { queryOptions } from '@tanstack/react-query';

import { apiUrl, request } from './client';
import type {
  BlogPost,
  BlogPostSummary,
  ContactReceipt,
  ContactRequest,
  Education,
  Experience,
  Project,
  ServiceOffering,
  SiteSettings,
  Skill,
} from './types';

/** URL of the downloadable CV. */
export const cvUrl = apiUrl('/api/cv');

export function sendContactMessage(message: ContactRequest): Promise<ContactReceipt> {
  return request<ContactReceipt>('/api/contact', { method: 'POST', body: message });
}

function get<T>(path: string) {
  return ({ signal }: { signal: AbortSignal }) => request<T>(path, { signal });
}

/** Query definitions for the public content API, shared by components and prefetching. */
export const queries = {
  settings: () =>
    queryOptions({ queryKey: ['settings'], queryFn: get<SiteSettings>('/api/settings') }),
  projects: () =>
    queryOptions({ queryKey: ['projects'], queryFn: get<Project[]>('/api/projects') }),
  project: (slug: string) =>
    queryOptions({
      queryKey: ['projects', slug],
      queryFn: get<Project>(`/api/projects/${encodeURIComponent(slug)}`),
    }),
  skills: () => queryOptions({ queryKey: ['skills'], queryFn: get<Skill[]>('/api/skills') }),
  experience: () =>
    queryOptions({ queryKey: ['experience'], queryFn: get<Experience[]>('/api/experience') }),
  education: () =>
    queryOptions({ queryKey: ['education'], queryFn: get<Education[]>('/api/education') }),
  services: () =>
    queryOptions({ queryKey: ['services'], queryFn: get<ServiceOffering[]>('/api/services') }),
  blogPosts: () =>
    queryOptions({ queryKey: ['blog'], queryFn: get<BlogPostSummary[]>('/api/blog') }),
  blogPost: (slug: string) =>
    queryOptions({
      queryKey: ['blog', slug],
      queryFn: get<BlogPost>(`/api/blog/${encodeURIComponent(slug)}`),
    }),
};
