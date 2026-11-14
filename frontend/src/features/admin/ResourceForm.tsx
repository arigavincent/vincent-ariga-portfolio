import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, Save } from 'lucide-react';
import {
  useForm,
  type DefaultValues,
  type FieldErrors,
  type FieldValues,
  type Path,
  type PathValue,
  type Resolver,
  type UseFormReturn,
} from 'react-hook-form';
import type { z } from 'zod';

import { ApiError } from '@/api/client';
import { Button, CheckboxField, SelectField, TextAreaField, TextField } from '@/components/ui';

import { slugify } from './formValues';
import { ImageField } from './ImageField';
import type { FieldConfig } from './resourceConfig';

interface ResourceFormProps<V extends FieldValues> {
  schema: z.ZodType<V, V>;
  fields: FieldConfig<V>[];
  /** Starting values: the defaults for a new item, or the item being edited. */
  values: V;
  submitLabel: string;
  pending: boolean;
  /** The error from the last save attempt, if it failed. */
  failure: unknown;
  onSubmit: (values: V) => void;
  /** Rendered beside the save button, for example a cancel link. */
  secondaryAction?: React.ReactNode;
}

function errorMessage<V extends FieldValues>(
  errors: FieldErrors<V>,
  name: Path<V>,
): string | undefined {
  const error = errors[name as keyof FieldErrors<V>];
  return typeof error?.message === 'string' ? error.message : undefined;
}

/** Form values are loosely typed here; anything that is not text reads as empty. */
function asText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function describeFailure(failure: unknown): string | null {
  if (!failure) {
    return null;
  }
  if (failure instanceof ApiError) {
    return failure.fieldErrors.length > 0 ? 'Some fields need another look.' : failure.message;
  }
  return 'That could not be saved. Please try again.';
}

interface FormFieldProps<V extends FieldValues> {
  field: FieldConfig<V>;
  form: UseFormReturn<V>;
  serverError?: string;
}

/** Draws one configured field with the right control for its kind. */
function FormField<V extends FieldValues>({ field, form, serverError }: FormFieldProps<V>) {
  const { register, setValue, getValues, watch, formState } = form;
  const error = errorMessage(formState.errors, field.name) ?? serverError;
  const wrapperClassName = field.wide ? 'sm:col-span-2' : undefined;
  const shared = {
    label: field.label,
    hint: field.hint,
    optional: field.optional,
    error,
    wrapperClassName,
  };
  const set = (value: string) => {
    setValue(field.name, value as PathValue<V, Path<V>>, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  switch (field.kind) {
    case 'checkbox':
      return (
        <CheckboxField
          label={field.label}
          hint={field.hint}
          wrapperClassName={wrapperClassName}
          {...register(field.name)}
        />
      );
    case 'select':
      return <SelectField {...shared} options={field.options ?? []} {...register(field.name)} />;
    case 'number':
      return (
        <TextField
          {...shared}
          type="number"
          inputMode="numeric"
          {...register(field.name, { valueAsNumber: true })}
        />
      );
    case 'date':
      return <TextField {...shared} type="date" {...register(field.name)} />;
    case 'textarea':
      return <TextAreaField {...shared} rows={field.rows ?? 4} {...register(field.name)} />;
    case 'list':
      return (
        <TextAreaField
          {...shared}
          hint={field.hint ?? 'One per line.'}
          rows={field.rows ?? 5}
          className="font-mono text-sm"
          {...register(field.name)}
        />
      );
    case 'markdown':
      return (
        <TextAreaField
          {...shared}
          hint={field.hint ?? 'Markdown.'}
          rows={field.rows ?? 16}
          className="font-mono text-sm"
          {...register(field.name)}
        />
      );
    case 'image':
      return (
        <ImageField
          {...shared}
          value={asText(watch(field.name))}
          onUploaded={set}
          {...register(field.name)}
        />
      );
    case 'slug':
      return (
        <TextField
          {...shared}
          hint={field.hint ?? 'Used in the page address. Lowercase letters, numbers and hyphens.'}
          {...register(field.name, {
            onBlur: () => {
              // Left empty, the slug is derived from its source field (usually the title).
              const source = field.slugSource ? asText(getValues(field.slugSource)) : '';
              if (!asText(getValues(field.name)).trim() && source) {
                set(slugify(source));
              }
            },
          })}
        />
      );
    default:
      return <TextField {...shared} {...register(field.name)} />;
  }
}

/**
 * A content editor generated from field configuration: validates with the resource's schema,
 * shows the API's per-field errors against their fields, and reports other failures in one line.
 */
export function ResourceForm<V extends FieldValues>({
  schema,
  fields,
  values,
  submitLabel,
  pending,
  failure,
  onSubmit,
  secondaryAction,
}: ResourceFormProps<V>) {
  const form = useForm<V>({
    resolver: zodResolver(schema) as Resolver<V>,
    defaultValues: values as DefaultValues<V>,
    mode: 'onTouched',
  });
  const serverErrors = new Map(
    failure instanceof ApiError
      ? failure.fieldErrors.map((violation) => [violation.field, violation.message])
      : [],
  );
  const summary = describeFailure(failure);

  return (
    <form
      noValidate
      className="grid gap-5 sm:grid-cols-2"
      onSubmit={(event) => {
        void form.handleSubmit(onSubmit)(event);
      }}
    >
      {fields.map((field) => (
        <FormField
          key={field.name}
          field={field}
          form={form}
          serverError={serverErrors.get(field.name)}
        />
      ))}

      <div className="flex flex-wrap items-center gap-4 border-t border-ink-700 pt-6 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          <span className="flex items-center gap-2">
            {pending ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Save aria-hidden="true" className="size-4" />
            )}
            {pending ? 'Saving' : submitLabel}
          </span>
        </Button>
        {secondaryAction}
        {summary ? (
          <p role="alert" className="text-sm text-orange-400">
            {summary}
          </p>
        ) : null}
      </div>
    </form>
  );
}
