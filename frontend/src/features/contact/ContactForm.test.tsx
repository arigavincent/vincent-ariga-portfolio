import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { ContactForm } from './ContactForm';

function respondWith(status: number, body: unknown, headers: Record<string, string> = {}) {
  const fetchMock = vi.fn((_input: RequestInfo | URL, _init?: RequestInit) =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...headers },
      }),
    ),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Name'), 'Wanjiru Kamau');
  await user.type(screen.getByLabelText('Email'), 'wanjiru@example.com');
  await user.type(
    screen.getByLabelText('Message'),
    'Hello Vincent, we have a backend role for you.',
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ContactForm', () => {
  it('explains what is missing and sends nothing when submitted empty', async () => {
    const fetchMock = respondWith(202, { message: 'ok' });
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);

    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByText('Please tell me your name')).toBeInTheDocument();
    expect(screen.getByText('Please add an email so I can reply')).toBeInTheDocument();
    expect(
      screen.getByText('A few more words, please (at least 10 characters)'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Name')).toHaveAccessibleDescription('Please tell me your name');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects an email address that does not look right', async () => {
    respondWith(202, { message: 'ok' });
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.tab();

    expect(await screen.findByText('That email address does not look right')).toBeInTheDocument();
  });

  it('posts the message to the API and confirms it was sent', async () => {
    const fetchMock = respondWith(202, {
      message: 'Thanks, your message is in. I will get back to you soon.',
    });
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);
    await fillValidForm(user);

    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByRole('heading', { name: 'Message sent.' })).toBeInTheDocument();
    expect(
      screen.getByText('Thanks, your message is in. I will get back to you soon.'),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('/api/contact');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual({
      name: 'Wanjiru Kamau',
      email: 'wanjiru@example.com',
      message: 'Hello Vincent, we have a backend role for you.',
      website: '',
    });

    await user.click(screen.getByRole('button', { name: 'Send another' }));
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('shows validation errors from the server against their fields', async () => {
    respondWith(400, {
      timestamp: '',
      status: 400,
      error: 'Bad Request',
      message: 'Some fields need another look.',
      path: '/api/contact',
      fieldErrors: [{ field: 'email', message: 'That email address does not look right' }],
    });
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);
    await fillValidForm(user);

    await user.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(
        'That email address does not look right',
      );
    });
    expect(
      screen.getByText('Some details need another look. Check the highlighted fields.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toHaveValue(
      'Hello Vincent, we have a backend role for you.',
    );
  });

  it('tells a rate-limited visitor how long to wait', async () => {
    respondWith(
      429,
      {
        timestamp: '',
        status: 429,
        error: 'Too Many Requests',
        message: 'Too many requests.',
        path: '/api/contact',
      },
      { 'Retry-After': '290' },
    );
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);
    await fillValidForm(user);

    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByText(/Please try again in about 5 minutes\./)).toBeInTheDocument();
  });

  it('offers a way forward when the server cannot be reached', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);
    await fillValidForm(user);

    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(
      await screen.findByText('Could not reach the server. Check your connection and try again.'),
    ).toBeInTheDocument();
  });

  it('keeps the honeypot away from people: hidden from assistive tech and out of the tab order', () => {
    respondWith(202, { message: 'ok' });
    renderWithProviders(<ContactForm />);

    const honeypot = screen.getByLabelText('Leave this field empty', { selector: 'input' });
    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(
      screen.queryByRole('textbox', { name: 'Leave this field empty' }),
    ).not.toBeInTheDocument();
  });
});
