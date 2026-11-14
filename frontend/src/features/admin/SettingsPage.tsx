import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, FileUp, LoaderCircle } from 'lucide-react';
import { useId, useState } from 'react';
import { z } from 'zod';

import { adminApi } from '@/api/admin';
import { ApiError } from '@/api/client';
import { cvUrl } from '@/api/public';
import type { SiteSettings, SiteSettingsInput } from '@/api/types';
import { Skeleton } from '@/components/ui';
import { buttonClasses } from '@/components/ui/buttonClasses';

import { adminKeys } from './adminKeys';
import { blankToNull, nullToBlank } from './formValues';
import { PageHeader } from './PageHeader';
import type { FieldConfig } from './resourceConfig';
import { ResourceForm } from './ResourceForm';
import { optionalText, requiredText } from './schemaParts';

const settingsSchema = z.object({
  displayName: requiredText('your name', 120),
  brandMark: requiredText('a brand mark', 40),
  role: requiredText('a role', 160),
  headline: requiredText('a headline', 240),
  tagline: requiredText('a tagline', 160),
  bio: requiredText('a bio', 4000),
  heritageNote: optionalText(400),
  location: requiredText('a location', 160),
  availability: requiredText('your availability', 300),
  email: z
    .string()
    .trim()
    .min(1, 'Add an email')
    .max(200)
    .pipe(z.email('That email address does not look right')),
  phoneDisplay: requiredText('a phone number', 40),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{8,15}$/, 'Digits only, with country code, like 254718569004'),
  githubUrl: z
    .string()
    .trim()
    .max(300)
    .regex(/^https?:\/\/\S+$/, 'Must be a full URL starting with http:// or https://'),
  footerLine: requiredText('a footer line', 200),
  seoTitle: requiredText('a page title', 200),
  seoDescription: requiredText('a description', 400),
});
type SettingsValues = z.infer<typeof settingsSchema>;

const fields: FieldConfig<SettingsValues>[] = [
  { name: 'displayName', label: 'Display name', kind: 'text' },
  { name: 'brandMark', label: 'Brand mark', kind: 'text' },
  { name: 'role', label: 'Role', kind: 'text' },
  {
    name: 'tagline',
    label: 'Tagline',
    kind: 'text',
    hint: 'Shown as the gold label and in the footer marquee.',
  },
  { name: 'headline', label: 'Hero headline', kind: 'textarea', wide: true, rows: 2 },
  {
    name: 'bio',
    label: 'About',
    kind: 'textarea',
    wide: true,
    rows: 8,
    hint: 'Leave a blank line between paragraphs.',
  },
  { name: 'heritageNote', label: 'Heritage note', kind: 'text', optional: true, wide: true },
  { name: 'location', label: 'Location', kind: 'text' },
  { name: 'availability', label: 'Availability', kind: 'text' },
  { name: 'email', label: 'Email', kind: 'text' },
  { name: 'phoneDisplay', label: 'Phone (as displayed)', kind: 'text' },
  {
    name: 'whatsappNumber',
    label: 'WhatsApp number',
    kind: 'text',
    hint: 'Digits only, with country code.',
  },
  { name: 'githubUrl', label: 'GitHub URL', kind: 'text' },
  { name: 'footerLine', label: 'Footer line', kind: 'text', wide: true },
  { name: 'seoTitle', label: 'Search title', kind: 'text', wide: true },
  { name: 'seoDescription', label: 'Search description', kind: 'textarea', wide: true, rows: 2 },
];

function toValues(settings: SiteSettings): SettingsValues {
  return { ...settings, heritageNote: nullToBlank(settings.heritageNote) };
}

function toInput(values: SettingsValues): SiteSettingsInput {
  return { ...values, heritageNote: blankToNull(values.heritageNote) };
}

function CvCard() {
  const inputId = useId();
  const [uploadedAt, setUploadedAt] = useState<string | null>(null);
  const upload = useMutation({
    mutationFn: adminApi.uploadCv,
    onSuccess: () => {
      setUploadedAt(new Date().toLocaleTimeString());
    },
  });

  return (
    <section
      aria-labelledby="cv-title"
      className="mt-12 rounded-card border border-ink-700 bg-ink-850 p-6 sm:p-8"
    >
      <h2 id="cv-title" className="font-display text-xl font-bold">
        CV
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        The PDF behind every &ldquo;Download CV&rdquo; button. Until one is uploaded, visitors get a
        placeholder.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <label htmlFor={inputId} className={buttonClasses({ className: 'cursor-pointer' })}>
          {upload.isPending ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <FileUp aria-hidden="true" className="size-4" />
          )}
          {upload.isPending ? 'Uploading' : 'Upload a new PDF'}
        </label>
        <input
          id={inputId}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              upload.mutate(file);
            }
            event.target.value = '';
          }}
        />
        <a href={cvUrl} className={buttonClasses({ variant: 'secondary' })}>
          <Download aria-hidden="true" className="size-4" />
          Download current CV
        </a>
      </div>
      {upload.isSuccess && uploadedAt ? (
        <p role="status" className="mt-4 text-sm text-gold-300">
          New CV uploaded at {uploadedAt}.
        </p>
      ) : null}
      {upload.isError ? (
        <p role="alert" className="mt-4 text-sm text-orange-400">
          {upload.error instanceof ApiError
            ? upload.error.message
            : 'The upload failed. Please try again.'}
        </p>
      ) : null}
    </section>
  );
}

/** Edits the profile and site-wide copy, and replaces the downloadable CV. */
export function SettingsPage() {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: adminKeys.settings, queryFn: adminApi.settings.get });
  const save = useMutation({
    mutationFn: (values: SettingsValues) => adminApi.settings.update(toInput(values)),
    onSuccess: () => queryClient.invalidateQueries(),
  });

  return (
    <>
      <PageHeader title="Settings" description="Your profile and the copy used across the site." />
      {settings.isPending ? (
        <div role="status" aria-label="Loading settings">
          <Skeleton className="h-96 rounded-card" />
        </div>
      ) : settings.isError ? (
        <p role="alert" className="text-muted">
          The settings could not be loaded. Refresh the page to try again.
        </p>
      ) : (
        <>
          {save.isSuccess ? (
            <p
              role="status"
              className="mb-6 rounded-xl border border-gold-400/40 bg-ink-850 px-4 py-3 text-sm text-gold-300"
            >
              Settings saved.
            </p>
          ) : null}
          <ResourceForm
            key={settings.data.updatedAt}
            schema={settingsSchema}
            fields={fields}
            values={toValues(settings.data)}
            submitLabel="Save settings"
            pending={save.isPending}
            failure={save.error}
            onSubmit={(values) => {
              save.mutate(values);
            }}
          />
          <CvCard />
        </>
      )}
    </>
  );
}
