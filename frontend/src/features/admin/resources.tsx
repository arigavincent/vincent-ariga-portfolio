import { z } from 'zod';

import { adminApi } from '@/api/admin';
import type {
  BlogPost,
  BlogPostInput,
  Education,
  EducationInput,
  Experience,
  ExperienceInput,
  Project,
  ProjectInput,
  ServiceOffering,
  ServiceOfferingInput,
  Skill,
  SkillInput,
} from '@/api/types';
import { skillIconKeys } from '@/features/skills/skillIcons';
import { formatLongDate, formatPeriod, formatYears } from '@/lib/format';

import { blankToNull, linesToList, listToLines, nullToBlank, yearToNumber } from './formValues';
import type { ResourceConfig } from './resourceConfig';
import {
  lines,
  optionalDate,
  optionalText,
  optionalUrl,
  optionalYear,
  publicationStatus,
  requiredText,
  slug,
  sortOrder,
  statusOptions,
} from './schemaParts';
import { StatusBadge } from './StatusBadge';

const sortOrderField = {
  name: 'sortOrder',
  label: 'Display order',
  kind: 'number',
  hint: 'Lower numbers show first.',
} as const;

function publication(status: 'DRAFT' | 'PUBLISHED') {
  return (
    <StatusBadge tone={status === 'PUBLISHED' ? 'live' : 'quiet'}>
      {status === 'PUBLISHED' ? 'Published' : 'Draft'}
    </StatusBadge>
  );
}

// --- Projects ---------------------------------------------------------------

const projectSchema = z.object({
  title: requiredText('a title', 160),
  slug,
  category: requiredText('a category', 80),
  status: publicationStatus,
  summary: requiredText('a summary', 400),
  description: requiredText('a description', 8000),
  techStack: lines(30, 80),
  highlights: lines(30, 300),
  coverImageUrl: optionalText(500),
  repoUrl: optionalUrl,
  liveUrl: optionalUrl,
  sortOrder,
  featured: z.boolean(),
});
type ProjectValues = z.infer<typeof projectSchema>;

export const projectsResource: ResourceConfig<Project, ProjectValues, ProjectInput> = {
  path: 'projects',
  title: 'Projects',
  singular: 'project',
  api: adminApi.projects,
  schema: projectSchema,
  defaults: {
    title: '',
    slug: '',
    category: '',
    status: 'DRAFT',
    summary: '',
    description: '',
    techStack: '',
    highlights: '',
    coverImageUrl: '',
    repoUrl: '',
    liveUrl: '',
    sortOrder: 0,
    featured: false,
  },
  toValues: (project) => ({
    title: project.title,
    slug: project.slug,
    category: project.category,
    status: project.status,
    summary: project.summary,
    description: project.description,
    techStack: listToLines(project.techStack),
    highlights: listToLines(project.highlights),
    coverImageUrl: nullToBlank(project.coverImageUrl),
    repoUrl: nullToBlank(project.repoUrl),
    liveUrl: nullToBlank(project.liveUrl),
    sortOrder: project.sortOrder,
    featured: project.featured,
  }),
  toInput: (values) => ({
    ...values,
    techStack: linesToList(values.techStack),
    highlights: linesToList(values.highlights),
    coverImageUrl: blankToNull(values.coverImageUrl),
    repoUrl: blankToNull(values.repoUrl),
    liveUrl: blankToNull(values.liveUrl),
  }),
  fields: [
    { name: 'title', label: 'Title', kind: 'text' },
    { name: 'slug', label: 'Slug', kind: 'slug', slugSource: 'title' },
    {
      name: 'category',
      label: 'Category',
      kind: 'text',
      hint: 'For example: Streaming, Education.',
    },
    { name: 'status', label: 'Status', kind: 'select', options: statusOptions },
    {
      name: 'summary',
      label: 'Summary',
      kind: 'textarea',
      wide: true,
      rows: 2,
      hint: 'One or two sentences, shown on cards.',
    },
    {
      name: 'description',
      label: 'Description',
      kind: 'textarea',
      wide: true,
      rows: 10,
      hint: 'Shown on the project page. Leave a blank line between paragraphs.',
    },
    { name: 'techStack', label: 'Tech stack', kind: 'list' },
    { name: 'highlights', label: 'Highlights', kind: 'list' },
    {
      name: 'coverImageUrl',
      label: 'Cover image',
      kind: 'image',
      optional: true,
      wide: true,
      hint: 'Leave empty to use the generated cover.',
    },
    { name: 'repoUrl', label: 'Repository URL', kind: 'text', optional: true },
    { name: 'liveUrl', label: 'Live URL', kind: 'text', optional: true },
    sortOrderField,
    { name: 'featured', label: 'Feature on the home page', kind: 'checkbox' },
  ],
  columns: [
    { header: 'Title', cell: (project) => project.title },
    { header: 'Category', cell: (project) => project.category, secondary: true },
    { header: 'Status', cell: (project) => publication(project.status) },
    { header: 'Featured', cell: (project) => (project.featured ? 'Yes' : 'No'), secondary: true },
    { header: 'Order', cell: (project) => project.sortOrder, secondary: true },
  ],
  describe: (project) => project.title,
};

// --- Skills -----------------------------------------------------------------

const skillSchema = z.object({
  name: requiredText('a name', 80),
  category: z.enum(['BACKEND', 'FRONTEND', 'TOOLING']),
  detail: optionalText(200),
  iconKey: optionalText(60),
  sortOrder,
});
type SkillValues = z.infer<typeof skillSchema>;

const categoryLabels = { BACKEND: 'Backend', FRONTEND: 'Frontend', TOOLING: 'Tooling' } as const;

export const skillsResource: ResourceConfig<Skill, SkillValues, SkillInput> = {
  path: 'skills',
  title: 'Skills',
  singular: 'skill',
  api: adminApi.skills,
  schema: skillSchema,
  defaults: { name: '', category: 'BACKEND', detail: '', iconKey: '', sortOrder: 0 },
  toValues: (skill) => ({
    name: skill.name,
    category: skill.category,
    detail: nullToBlank(skill.detail),
    iconKey: nullToBlank(skill.iconKey),
    sortOrder: skill.sortOrder,
  }),
  toInput: (values) => ({
    ...values,
    detail: blankToNull(values.detail),
    iconKey: blankToNull(values.iconKey),
  }),
  fields: [
    { name: 'name', label: 'Name', kind: 'text' },
    {
      name: 'category',
      label: 'Category',
      kind: 'select',
      options: Object.entries(categoryLabels).map(([value, label]) => ({ value, label })),
    },
    {
      name: 'detail',
      label: 'Detail',
      kind: 'text',
      optional: true,
      hint: 'Frameworks or flavours, for example "Gin · Fiber".',
    },
    {
      name: 'iconKey',
      label: 'Icon',
      kind: 'select',
      optional: true,
      hint: 'Without an icon the skill shows its initials.',
      options: [
        { value: '', label: 'No icon' },
        ...skillIconKeys.map((key) => ({ value: key, label: key })),
      ],
    },
    sortOrderField,
  ],
  columns: [
    { header: 'Name', cell: (skill) => skill.name },
    { header: 'Category', cell: (skill) => categoryLabels[skill.category] },
    { header: 'Detail', cell: (skill) => skill.detail ?? '', secondary: true },
    { header: 'Order', cell: (skill) => skill.sortOrder, secondary: true },
  ],
  describe: (skill) => skill.name,
};

// --- Experience -------------------------------------------------------------

const experienceSchema = z.object({
  title: requiredText('a title', 160),
  organization: requiredText('an organisation', 160),
  location: optionalText(160),
  startDate: optionalDate,
  endDate: optionalDate,
  current: z.boolean(),
  description: requiredText('a description', 4000),
  sortOrder,
});
type ExperienceValues = z.infer<typeof experienceSchema>;

export const experienceResource: ResourceConfig<Experience, ExperienceValues, ExperienceInput> = {
  path: 'experience',
  title: 'Experience',
  singular: 'role',
  api: adminApi.experience,
  schema: experienceSchema,
  defaults: {
    title: '',
    organization: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    sortOrder: 0,
  },
  toValues: (item) => ({
    title: item.title,
    organization: item.organization,
    location: nullToBlank(item.location),
    startDate: nullToBlank(item.startDate),
    endDate: nullToBlank(item.endDate),
    current: item.current,
    description: item.description,
    sortOrder: item.sortOrder,
  }),
  toInput: (values) => ({
    ...values,
    location: blankToNull(values.location),
    startDate: blankToNull(values.startDate),
    endDate: blankToNull(values.endDate),
  }),
  fields: [
    { name: 'title', label: 'Title', kind: 'text' },
    { name: 'organization', label: 'Organisation', kind: 'text' },
    { name: 'location', label: 'Location', kind: 'text', optional: true },
    { name: 'current', label: 'I work here now', kind: 'checkbox' },
    { name: 'startDate', label: 'Start date', kind: 'date', optional: true },
    { name: 'endDate', label: 'End date', kind: 'date', optional: true },
    { name: 'description', label: 'Description', kind: 'textarea', wide: true, rows: 6 },
    sortOrderField,
  ],
  columns: [
    { header: 'Title', cell: (item) => item.title },
    { header: 'Organisation', cell: (item) => item.organization },
    {
      header: 'Period',
      cell: (item) => formatPeriod(item.startDate, item.endDate, item.current),
      secondary: true,
    },
  ],
  describe: (item) => item.title,
};

// --- Education --------------------------------------------------------------

const educationSchema = z.object({
  institution: requiredText('an institution', 200),
  qualification: requiredText('a qualification', 200),
  grade: optionalText(120),
  startYear: optionalYear,
  endYear: optionalYear,
  description: optionalText(2000),
  sortOrder,
});
type EducationValues = z.infer<typeof educationSchema>;

export const educationResource: ResourceConfig<Education, EducationValues, EducationInput> = {
  path: 'education',
  title: 'Education',
  singular: 'qualification',
  api: adminApi.education,
  schema: educationSchema,
  defaults: {
    institution: '',
    qualification: '',
    grade: '',
    startYear: '',
    endYear: '',
    description: '',
    sortOrder: 0,
  },
  toValues: (item) => ({
    institution: item.institution,
    qualification: item.qualification,
    grade: nullToBlank(item.grade),
    startYear: nullToBlank(item.startYear),
    endYear: nullToBlank(item.endYear),
    description: nullToBlank(item.description),
    sortOrder: item.sortOrder,
  }),
  toInput: (values) => ({
    ...values,
    grade: blankToNull(values.grade),
    startYear: yearToNumber(values.startYear),
    endYear: yearToNumber(values.endYear),
    description: blankToNull(values.description),
  }),
  fields: [
    { name: 'institution', label: 'Institution', kind: 'text' },
    { name: 'qualification', label: 'Qualification', kind: 'text' },
    { name: 'grade', label: 'Grade', kind: 'text', optional: true },
    { name: 'startYear', label: 'Start year', kind: 'text', optional: true },
    { name: 'endYear', label: 'End year', kind: 'text', optional: true },
    { name: 'description', label: 'Description', kind: 'textarea', optional: true, wide: true },
    sortOrderField,
  ],
  columns: [
    { header: 'Qualification', cell: (item) => item.qualification },
    { header: 'Institution', cell: (item) => item.institution },
    { header: 'Years', cell: (item) => formatYears(item.startYear, item.endYear), secondary: true },
  ],
  describe: (item) => item.qualification,
};

// --- Services ---------------------------------------------------------------

const serviceSchema = z.object({
  title: requiredText('a title', 160),
  description: requiredText('a description', 2000),
  iconKey: optionalText(60),
  sortOrder,
});
type ServiceValues = z.infer<typeof serviceSchema>;

export const servicesResource: ResourceConfig<
  ServiceOffering,
  ServiceValues,
  ServiceOfferingInput
> = {
  path: 'services',
  title: 'Services',
  singular: 'service',
  api: adminApi.services,
  schema: serviceSchema,
  defaults: { title: '', description: '', iconKey: '', sortOrder: 0 },
  toValues: (service) => ({
    title: service.title,
    description: service.description,
    iconKey: nullToBlank(service.iconKey),
    sortOrder: service.sortOrder,
  }),
  toInput: (values) => ({ ...values, iconKey: blankToNull(values.iconKey) }),
  fields: [
    { name: 'title', label: 'Title', kind: 'text' },
    {
      name: 'iconKey',
      label: 'Icon',
      kind: 'select',
      optional: true,
      options: [
        { value: '', label: 'Default' },
        { value: 'server', label: 'Server' },
        { value: 'api', label: 'API' },
        { value: 'layers', label: 'Layers' },
        { value: 'building', label: 'Building' },
      ],
    },
    { name: 'description', label: 'Description', kind: 'textarea', wide: true },
    sortOrderField,
  ],
  columns: [
    { header: 'Title', cell: (service) => service.title },
    { header: 'Description', cell: (service) => service.description, secondary: true },
    { header: 'Order', cell: (service) => service.sortOrder, secondary: true },
  ],
  describe: (service) => service.title,
};

// --- Blog -------------------------------------------------------------------

const blogSchema = z.object({
  title: requiredText('a title', 200),
  slug: slug.max(160, 'Keep this under 160 characters'),
  status: publicationStatus,
  excerpt: requiredText('an excerpt', 600),
  content: requiredText('the post body', 200000),
  coverImageUrl: optionalText(500),
  tags: lines(12, 60),
});
type BlogValues = z.infer<typeof blogSchema>;

export const blogResource: ResourceConfig<BlogPost, BlogValues, BlogPostInput> = {
  path: 'blog',
  title: 'Blog',
  singular: 'post',
  api: adminApi.blog,
  schema: blogSchema,
  defaults: {
    title: '',
    slug: '',
    status: 'DRAFT',
    excerpt: '',
    content: '',
    coverImageUrl: '',
    tags: '',
  },
  toValues: (post) => ({
    title: post.title,
    slug: post.slug,
    status: post.status,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: nullToBlank(post.coverImageUrl),
    tags: listToLines(post.tags),
  }),
  toInput: (values) => ({
    ...values,
    coverImageUrl: blankToNull(values.coverImageUrl),
    tags: linesToList(values.tags),
  }),
  fields: [
    { name: 'title', label: 'Title', kind: 'text' },
    { name: 'slug', label: 'Slug', kind: 'slug', slugSource: 'title' },
    { name: 'status', label: 'Status', kind: 'select', options: statusOptions },
    { name: 'tags', label: 'Tags', kind: 'list', rows: 3 },
    {
      name: 'excerpt',
      label: 'Excerpt',
      kind: 'textarea',
      wide: true,
      rows: 2,
      hint: 'Shown in the post list.',
    },
    { name: 'content', label: 'Body', kind: 'markdown', wide: true },
    { name: 'coverImageUrl', label: 'Cover image', kind: 'image', optional: true, wide: true },
  ],
  columns: [
    { header: 'Title', cell: (post) => post.title },
    { header: 'Status', cell: (post) => publication(post.status) },
    {
      header: 'Published',
      cell: (post) => (post.publishedAt ? formatLongDate(post.publishedAt) : 'Not yet'),
      secondary: true,
    },
  ],
  describe: (post) => post.title,
};
