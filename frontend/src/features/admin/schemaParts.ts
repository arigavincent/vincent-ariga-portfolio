import { z } from 'zod';

import type { SelectOption } from '@/components/ui';

import { linesToList } from './formValues';

/** Validation building blocks shared by the content editors. They mirror the backend's rules. */

export const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `Add ${label}`).max(max, `Keep this under ${max} characters`);

export const optionalText = (max: number) =>
  z.string().trim().max(max, `Keep this under ${max} characters`);

export const slug = z
  .string()
  .trim()
  .min(1, 'Add a slug')
  .max(120, 'Keep this under 120 characters')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Use lowercase letters, numbers and single hyphens, like my-project',
  );

export const optionalUrl = z
  .string()
  .trim()
  .max(500, 'Keep this under 500 characters')
  .refine(
    (value) => value === '' || /^https?:\/\/\S+$/.test(value),
    'Must be a full URL starting with http:// or https://',
  );

export const sortOrder = z.number({ error: 'Enter a number' }).int('Whole numbers only');

/** A textarea holding one item per line, with limits on how many and how long. */
export const lines = (maxItems: number, maxLength: number) =>
  z
    .string()
    .refine((text) => linesToList(text).length <= maxItems, `At most ${maxItems} lines`)
    .refine(
      (text) => linesToList(text).every((line) => line.length <= maxLength),
      `Each line must be ${maxLength} characters or fewer`,
    );

export const optionalYear = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === '' || (/^\d{4}$/.test(value) && Number(value) >= 1950 && Number(value) <= 2100),
    'Enter a year like 2026, or leave it empty',
  );

export const optionalDate = z
  .string()
  .refine(
    (value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value),
    'Pick a date, or leave it empty',
  );

export const publicationStatus = z.enum(['DRAFT', 'PUBLISHED']);

export const statusOptions: SelectOption[] = [
  { value: 'DRAFT', label: 'Draft (hidden from the site)' },
  { value: 'PUBLISHED', label: 'Published' },
];
