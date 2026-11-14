import { auth } from './auth';
import type {
  BlogPost,
  BlogPostInput,
  ContactMessage,
  ContactStatus,
  Education,
  EducationInput,
  Experience,
  ExperienceInput,
  Page,
  Project,
  ProjectInput,
  ServiceOffering,
  ServiceOfferingInput,
  SiteSettings,
  SiteSettingsInput,
  Skill,
  SkillInput,
  UploadResult,
} from './types';

/** The five operations every content type shares, matching the backend's CrudController. */
export interface CrudApi<T, Input> {
  list: () => Promise<T[]>;
  get: (id: number) => Promise<T>;
  create: (input: Input) => Promise<T>;
  update: (id: number, input: Input) => Promise<T>;
  remove: (id: number) => Promise<void>;
}

function crud<T, Input>(path: string): CrudApi<T, Input> {
  return {
    list: () => auth.authorized<T[]>(path),
    get: (id) => auth.authorized<T>(`${path}/${id}`),
    create: (input) => auth.authorized<T>(path, { method: 'POST', body: input }),
    update: (id, input) => auth.authorized<T>(`${path}/${id}`, { method: 'PUT', body: input }),
    remove: (id) => auth.authorized<undefined>(`${path}/${id}`, { method: 'DELETE' }),
  };
}

function upload(path: string, file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  return auth.authorized<UploadResult>(path, { method: 'POST', body: form });
}

export interface MessageQuery {
  status?: ContactStatus;
  page?: number;
}

export const adminApi = {
  projects: crud<Project, ProjectInput>('/api/admin/projects'),
  skills: crud<Skill, SkillInput>('/api/admin/skills'),
  experience: crud<Experience, ExperienceInput>('/api/admin/experience'),
  education: crud<Education, EducationInput>('/api/admin/education'),
  services: crud<ServiceOffering, ServiceOfferingInput>('/api/admin/services'),
  blog: crud<BlogPost, BlogPostInput>('/api/admin/blog'),

  settings: {
    get: () => auth.authorized<SiteSettings>('/api/admin/settings'),
    update: (input: SiteSettingsInput) =>
      auth.authorized<SiteSettings>('/api/admin/settings', { method: 'PUT', body: input }),
  },

  messages: {
    list: ({ status, page = 0 }: MessageQuery = {}) => {
      const params = new URLSearchParams({ page: String(page) });
      if (status) {
        params.set('status', status);
      }
      return auth.authorized<Page<ContactMessage>>(`/api/admin/messages?${params.toString()}`);
    },
    unreadCount: () => auth.authorized<{ unread: number }>('/api/admin/messages/unread-count'),
    setStatus: (id: number, status: ContactStatus) =>
      auth.authorized<ContactMessage>(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        body: { status },
      }),
    remove: (id: number) =>
      auth.authorized<undefined>(`/api/admin/messages/${id}`, { method: 'DELETE' }),
  },

  uploadImage: (file: File) => upload('/api/admin/uploads', file),
  uploadCv: (file: File) => upload('/api/admin/cv', file),
};
