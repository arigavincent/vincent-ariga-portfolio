import { z } from 'zod';

/** Mirrors the backend's ContactRequest validation, so most mistakes are caught before sending. */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Please tell me your name')
    .max(120, 'That name is a little long (120 characters at most)'),
  email: z
    .string()
    .trim()
    .min(1, 'Please add an email so I can reply')
    .max(200, 'That email is too long')
    .pipe(z.email('That email address does not look right')),
  subject: z.string().trim().max(200, 'Keep the subject under 200 characters'),
  message: z
    .string()
    .trim()
    .min(10, 'A few more words, please (at least 10 characters)')
    .max(5000, 'That is a long one. Please keep it under 5000 characters'),
  /** Honeypot: hidden from people, tempting to bots. The server drops anything that fills it. */
  website: z.string(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const emptyContactForm: ContactFormValues = {
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '',
};
