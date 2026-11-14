import { useQuery } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { Button, Heading, Marquee, QueryContent, SplitText } from '.';

describe('Button', () => {
  it('renders a native button that responds to clicks', async () => {
    const onClick = vi.fn();
    renderWithProviders(<Button onClick={onClick}>Send</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute('type', 'button');
  });

  it('renders a router link when given a destination', () => {
    renderWithProviders(<Button to="/projects">All projects</Button>);

    expect(screen.getByRole('link', { name: 'All projects' })).toHaveAttribute('href', '/projects');
  });

  it('opens external links in a new tab without leaking the opener', () => {
    renderWithProviders(<Button href="https://github.com/arigavincent">GitHub</Button>);

    const link = screen.getByRole('link', { name: 'GitHub' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('keeps mailto links in the same tab', () => {
    renderWithProviders(<Button href="mailto:someone@example.com">Email</Button>);

    expect(screen.getByRole('link', { name: 'Email' })).not.toHaveAttribute('target');
  });

  it('uses dark ink text on the orange primary fill for contrast', () => {
    renderWithProviders(<Button>Primary</Button>);

    expect(screen.getByRole('button', { name: 'Primary' })).toHaveClass(
      'bg-orange-500',
      'text-ink-950',
    );
  });

  it('can be disabled', () => {
    renderWithProviders(<Button disabled>Wait</Button>);

    expect(screen.getByRole('button', { name: 'Wait' })).toBeDisabled();
  });
});

describe('SplitText', () => {
  it('exposes the full sentence to assistive technology and hides the animated words', () => {
    renderWithProviders(<SplitText as="h2" text={'Backend first,\nfull stack ready.'} />);

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Backend first, full stack ready.',
    });
    expect(heading.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
    expect(heading).toHaveTextContent('Backend');
  });
});

describe('Heading', () => {
  it('renders the overline, the numbered index and the title at the requested level', () => {
    renderWithProviders(
      <Heading index="02" overline="Skills" title="What I use." lead="Tools I reach for." />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'What I use.' })).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('Tools I reach for.')).toBeInTheDocument();
  });
});

describe('Marquee', () => {
  it('duplicates its content for a seamless loop and hides the copy from screen readers', () => {
    renderWithProviders(
      <Marquee label="Tech stack">
        <span>Java</span>
      </Marquee>,
    );

    const group = screen.getByRole('group', { name: 'Tech stack' });
    expect(group.querySelectorAll('span')).toHaveLength(2);
    expect(screen.getAllByText('Java')).toHaveLength(2);
    expect(group.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
  });

  it('is treated as decoration when it has no label', () => {
    const { container } = renderWithProviders(
      <Marquee>
        <span>Software</span>
      </Marquee>,
    );

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});

function Listing({ load }: { load: () => Promise<string[]> }) {
  const query = useQuery({ queryKey: ['listing'], queryFn: load });
  return (
    <QueryContent
      query={query}
      label="projects"
      skeleton={<p>placeholder</p>}
      empty={<p>Nothing yet</p>}
    >
      {(items) => (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </QueryContent>
  );
}

describe('QueryContent', () => {
  it('shows the skeleton, then the loaded content', async () => {
    renderWithProviders(<Listing load={() => Promise.resolve(['AJ Stream'])} />);

    expect(screen.getByRole('status', { name: 'Loading projects' })).toBeInTheDocument();
    expect(await screen.findByText('AJ Stream')).toBeInTheDocument();
  });

  it('shows the empty state for an empty list', async () => {
    renderWithProviders(<Listing load={() => Promise.resolve([])} />);

    expect(await screen.findByText('Nothing yet')).toBeInTheDocument();
  });

  it('shows an error with a retry that refetches', async () => {
    const load = vi
      .fn<() => Promise<string[]>>()
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValueOnce(['AJ Stream']);
    renderWithProviders(<Listing load={load} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load the projects right now.',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('AJ Stream')).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
  });
});
