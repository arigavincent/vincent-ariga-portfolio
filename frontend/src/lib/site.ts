import type { SiteSettings } from '@/api/types';

/**
 * Identity shown while the API loads, and if it cannot be reached. The live values come from
 * GET /api/settings and are edited in the admin panel; keep this in step with the backend seed.
 */
export const fallbackSettings: SiteSettings = {
  displayName: 'Vincent Ariga',
  brandMark: 'A&J',
  role: 'Backend Engineer',
  headline: 'I build dependable backends and the full-stack products around them.',
  tagline: 'SOFTWARE · STREAMING · APPS',
  bio: '',
  heritageNote: null,
  location: 'Kenya',
  availability: 'Open to full-time on-site work in Nyeri, and to remote contract work.',
  email: 'lameckvin@gmail.com',
  phoneDisplay: '+254 718 569 004',
  whatsappNumber: '254718569004',
  githubUrl: 'https://github.com/arigavincent',
  footerLine: 'Vincent Ariga · A&J',
  seoTitle: 'Vincent Ariga · A&J | Backend Engineer',
  seoDescription:
    'Vincent Ariga is a backend engineer in Kenya working in Java / Spring Boot, Kotlin and Go, and building full-stack products.',
  updatedAt: null,
};

/** Sections of the home page, in order. Drives the navigation and the scroll story. */
export const homeSections = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'work', label: 'Work' },
  { id: 'journey', label: 'Journey' },
  { id: 'services', label: 'Services' },
  { id: 'contact', label: 'Contact' },
] as const;

export type HomeSectionId = (typeof homeSections)[number]['id'];
