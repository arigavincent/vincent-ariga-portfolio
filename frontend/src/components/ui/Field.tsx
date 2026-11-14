import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface FieldShellProps {
  id: string;
  label: string;
  /** Shown under the control when there is no error. */
  hint?: string;
  error?: string;
  /** Marks the label as optional instead of marking every required field. */
  optional?: boolean;
  className?: string;
  children: ReactNode;
}

const controlClasses =
  'w-full rounded-xl border bg-ink-900/70 px-4 py-3 text-white placeholder:text-warm-400 ' +
  'transition-colors duration-300 focus:border-gold-400 focus:outline-none ' +
  'aria-invalid:border-orange-500 disabled:opacity-60';

function FieldShell({ id, label, hint, error, optional, className, children }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-4 text-sm font-medium text-white"
      >
        {label}
        {optional ? (
          <span className="font-mono text-xs font-normal text-warm-300">Optional</span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-orange-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-warm-300">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string): string | undefined {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

type SharedProps = Pick<FieldShellProps, 'label' | 'hint' | 'error' | 'optional'> & {
  /** Classes for the wrapper, for grid placement. */
  wrapperClassName?: string;
};

export type TextFieldProps = SharedProps & ComponentPropsWithRef<'input'>;

/** A labelled text input with its hint or validation error wired up for assistive technology. */
export function TextField({
  label,
  hint,
  error,
  optional,
  wrapperClassName,
  className,
  ...input
}: TextFieldProps) {
  const generatedId = useId();
  const id = input.id ?? generatedId;
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      className={wrapperClassName}
    >
      <input
        {...input}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(controlClasses, error ? 'border-orange-500' : 'border-ink-600', className)}
      />
    </FieldShell>
  );
}

export type TextAreaFieldProps = SharedProps & ComponentPropsWithRef<'textarea'>;

/** A labelled multi-line input with the same wiring as {@link TextField}. */
export function TextAreaField({
  label,
  hint,
  error,
  optional,
  wrapperClassName,
  className,
  ...textarea
}: TextAreaFieldProps) {
  const generatedId = useId();
  const id = textarea.id ?? generatedId;
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      className={wrapperClassName}
    >
      <textarea
        {...textarea}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(
          controlClasses,
          'min-h-36 resize-y',
          error ? 'border-orange-500' : 'border-ink-600',
          className,
        )}
      />
    </FieldShell>
  );
}
