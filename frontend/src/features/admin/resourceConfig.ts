import type { ReactNode } from 'react';
import type { FieldValues, Path } from 'react-hook-form';
import type { z } from 'zod';

import type { CrudApi } from '@/api/admin';
import type { SelectOption } from '@/components/ui';

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'markdown'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'list'
  | 'date'
  | 'image'
  | 'slug';

/** One input in a content editor. */
export interface FieldConfig<V extends FieldValues> {
  name: Path<V>;
  label: string;
  kind: FieldKind;
  hint?: string;
  optional?: boolean;
  /** Choices for a select. */
  options?: SelectOption[];
  /** Span both columns of the form grid. */
  wide?: boolean;
  rows?: number;
  /** For a slug field: the field its value is derived from when left empty. */
  slugSource?: Path<V>;
}

export interface ColumnConfig<T> {
  header: string;
  cell: (item: T) => ReactNode;
  /** Hide on small screens to keep the table readable. */
  secondary?: boolean;
}

/**
 * Everything the generic list and editor screens need to manage one content type: where it
 * lives, how to talk to the API, how to validate it and how to draw it.
 *
 * @typeParam T the entity as the API returns it
 * @typeParam V the values the form holds (strings, booleans, numbers)
 * @typeParam Input the write payload the API expects
 */
export interface ResourceConfig<T extends { id: number }, V extends FieldValues, Input> {
  /** URL segment under /admin and part of the query key. */
  path: string;
  title: string;
  singular: string;
  api: CrudApi<T, Input>;
  schema: z.ZodType<V, V>;
  defaults: V;
  toValues: (item: T) => V;
  toInput: (values: V) => Input;
  fields: FieldConfig<V>[];
  columns: ColumnConfig<T>[];
  /** A short name for an item, used in headings and confirmations. */
  describe: (item: T) => string;
}
