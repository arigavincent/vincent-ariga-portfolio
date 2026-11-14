import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

import { queries } from '@/api/public';

interface ProjectPagerProps {
  slug: string;
}

/** Links to the previous and next project in display order, wrapping around at the ends. */
export function ProjectPager({ slug }: ProjectPagerProps) {
  const { data: projects = [] } = useQuery(queries.projects());
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1 || projects.length < 2) {
    return null;
  }
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  if (!previous || !next) {
    return null;
  }

  return (
    <nav
      aria-label="More projects"
      className="mt-24 grid gap-px overflow-hidden rounded-card bg-ink-700 sm:grid-cols-2"
    >
      {[
        {
          project: previous,
          label: 'Previous project',
          icon: ArrowLeft,
          align: 'items-start text-left',
        },
        { project: next, label: 'Next project', icon: ArrowRight, align: 'items-end text-right' },
      ].map(({ project, label, icon: Icon, align }) => (
        <Link
          key={label}
          to={`/projects/${project.slug}`}
          data-cursor-label="View"
          className={`group flex flex-col gap-3 bg-ink-850 p-8 transition-colors duration-500 hover:bg-ink-800 sm:p-10 ${align}`}
        >
          <span className="flex items-center gap-2 eyebrow">
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </span>
          <span className="font-display text-h3 font-extrabold transition-colors duration-300 group-hover:text-orange-400">
            {project.title}
          </span>
        </Link>
      ))}
    </nav>
  );
}
