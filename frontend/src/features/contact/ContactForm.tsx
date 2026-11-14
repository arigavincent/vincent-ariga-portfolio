import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CircleCheck, LoaderCircle, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { ApiError } from '@/api/client';
import { sendContactMessage } from '@/api/public';
import { Button, TextAreaField, TextField } from '@/components/ui';

import { contactSchema, emptyContactForm, type ContactFormValues } from './contactSchema';

const fieldNames = new Set<string>(['name', 'email', 'subject', 'message']);

function isFieldName(field: string): field is Exclude<keyof ContactFormValues, 'website'> {
  return fieldNames.has(field);
}

/** Turns a failed submission into one sentence a visitor can act on. */
function describeFailure(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      const minutes = error.retryAfter ? Math.max(1, Math.ceil(error.retryAfter / 60)) : null;
      return minutes
        ? `That is a lot of messages in a short time. Please try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`
        : 'That is a lot of messages in a short time. Please try again a little later.';
    }
    if (error.status === 400) {
      return 'Some details need another look. Check the highlighted fields.';
    }
    if (error.status === 0) {
      return error.message;
    }
  }
  return 'Your message could not be sent. Please try again, or email me directly.';
}

/**
 * The contact form: validated in the browser with the same rules as the API, submitted to
 * POST /api/contact, with server-side field errors shown against their fields.
 */
export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: emptyContactForm,
    mode: 'onTouched',
  });

  const mutation = useMutation({
    mutationFn: sendContactMessage,
    onSuccess: () => {
      reset();
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        for (const violation of error.fieldErrors) {
          if (isFieldName(violation.field)) {
            setError(violation.field, { type: 'server', message: violation.message });
          }
        }
      }
    },
  });

  if (mutation.isSuccess) {
    return (
      <div role="status" className="flex h-full flex-col items-start justify-center gap-5">
        <CircleCheck aria-hidden="true" className="size-12 text-gold-400" />
        <h3 className="font-display text-h3 font-extrabold">Message sent.</h3>
        <p className="max-w-md text-muted">{mutation.data.message}</p>
        <Button
          variant="secondary"
          onClick={() => {
            mutation.reset();
          }}
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      aria-label="Contact form"
      className="grid gap-5 sm:grid-cols-2"
      onSubmit={(event) => {
        void handleSubmit((values) => {
          mutation.mutate({ ...values, subject: values.subject || undefined });
        })(event);
      }}
    >
      <TextField
        label="Name"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Subject"
        optional
        wrapperClassName="sm:col-span-2"
        error={errors.subject?.message}
        {...register('subject')}
      />
      <TextAreaField
        label="Message"
        rows={6}
        wrapperClassName="sm:col-span-2"
        error={errors.message?.message}
        {...register('message')}
      />

      {/* Honeypot: off-screen and out of the tab order, so only bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <Button type="submit" size="lg" disabled={mutation.isPending}>
          <span className="flex items-center gap-2">
            {mutation.isPending ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Send aria-hidden="true" className="size-4" />
            )}
            {mutation.isPending ? 'Sending' : 'Send message'}
          </span>
        </Button>
        {mutation.isError ? (
          <p role="alert" className="max-w-md text-sm text-orange-400">
            {describeFailure(mutation.error)}
          </p>
        ) : null}
      </div>
    </form>
  );
}
