import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { loading } from '@/lib/loading';
import { publicApi, stubApi } from '@/test/api';
import { renderWithProviders } from '@/test/render';

import { Footer } from './Footer';
import { Header } from './Header';
import { Preloader } from './Preloader';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Header', () => {
  it('links the brand home and lists the section navigation', () => {
    stubApi(publicApi);
    renderWithProviders(<Header />);

    expect(screen.getByRole('link', { name: /Vincent Ariga · A&J, home/ })).toHaveAttribute(
      'href',
      '/',
    );
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['About', 'Skills', 'Work', 'Journey', 'Services']);
    expect(within(nav).getByRole('link', { name: 'Work' })).toHaveAttribute('href', '/#work');
    expect(screen.getByRole('link', { name: /Let.s talk/ })).toHaveAttribute('href', '/#contact');
  });

  it('marks the section in the URL as the current location', () => {
    stubApi(publicApi);
    renderWithProviders(<Header />, '/#skills');

    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('link', { name: 'Skills' })).toHaveAttribute(
      'aria-current',
      'location',
    );
    expect(within(nav).getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current');
  });

  it('opens the mobile menu as a dialog and closes it with Escape, returning focus', async () => {
    stubApi(publicApi);
    const user = userEvent.setup();
    renderWithProviders(<Header />);
    const opener = screen.getByRole('button', { name: 'Open menu' });
    expect(opener).toHaveAttribute('aria-expanded', 'false');

    await user.click(opener);

    const dialog = screen.getByRole('dialog', { name: 'Menu' });
    expect(opener).toHaveAttribute('aria-expanded', 'true');
    expect(within(dialog).getByRole('button', { name: 'Close menu' })).toHaveFocus();
    expect(within(dialog).getByRole('link', { name: /Services/ })).toHaveAttribute(
      'href',
      '/#services',
    );

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument();
    });
    expect(opener).toHaveFocus();
  });

  it('keeps keyboard focus inside the open menu', async () => {
    stubApi(publicApi);
    const user = userEvent.setup();
    renderWithProviders(<Header />);
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    const dialog = screen.getByRole('dialog', { name: 'Menu' });

    // Focus starts on the close button; stepping back reaches the first control, then wraps to the last.
    await user.tab({ shift: true });
    expect(within(dialog).getByRole('link', { name: /home/ })).toHaveFocus();
    await user.tab({ shift: true });
    expect(within(dialog).getByRole('link', { name: /Let.s talk/ })).toHaveFocus();

    // And stepping forward from the last control wraps back to the first.
    await user.tab();
    expect(within(dialog).getByRole('link', { name: /home/ })).toHaveFocus();
  });
});

describe('Footer', () => {
  it('shows the brand line and contact links, with no LinkedIn anywhere', async () => {
    stubApi(publicApi);
    const { container } = renderWithProviders(<Footer />);

    expect(screen.getByText('Vincent Ariga · A&J')).toBeInTheDocument();
    const links = screen.getByRole('list', { name: 'Contact links' });
    expect(within(links).getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/arigavincent',
    );
    expect(within(links).getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
      'href',
      'https://wa.me/254718569004',
    );
    expect(within(links).getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      'mailto:lameckvin@gmail.com',
    );
    await waitFor(() => {
      expect(container.innerHTML.toLowerCase()).not.toContain('linkedin');
    });
  });

  it('shows the brand tagline as a decorative marquee', () => {
    stubApi(publicApi);
    renderWithProviders(<Footer />);

    expect(screen.getAllByText('SOFTWARE')).toHaveLength(2);
    expect(screen.getAllByText('STREAMING')).toHaveLength(2);
    expect(screen.getAllByText('APPS')).toHaveLength(2);
  });
});

describe('Preloader', () => {
  it('follows real loading progress and lifts once everything has finished', async () => {
    stubApi(publicApi);
    const onFinished = vi.fn();
    loading.register('fonts', 1);
    loading.register('content', 1);
    renderWithProviders(<Preloader onFinished={onFinished} />);

    expect(screen.getByRole('status')).toHaveAccessibleName('Loading 0%');

    act(() => {
      loading.done('fonts');
    });
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveAccessibleName('Loading 50%');
    });
    expect(onFinished).not.toHaveBeenCalled();

    act(() => {
      loading.done('content');
    });
    await waitFor(
      () => {
        expect(onFinished).toHaveBeenCalledOnce();
      },
      { timeout: 4000 },
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
