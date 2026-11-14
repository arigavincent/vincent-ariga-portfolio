import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';

import type { Project } from '@/api/types';
import { Tag, TiltCard } from '@/components/ui';

interface ProjectCardProps {
  project: Project;
  /** Position in the list, shown as a two-digit index. */
  index: number;
}

/** A large, tilting card that links to a project's detail page. */
export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <TiltCard className="h-full rounded-card">
      <Link
        to={`/projects/${project.slug}`}
        data-cursor-label="View"
        className="group flex h-full flex-col gap-8 rounded-card border border-ink-700 bg-ink-850 p-6 shadow-card transition-colors duration-500 hover:border-orange-500/60 sm:p-8"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow">
            {String(index + 1).padStart(2, '0')} · {project.category}
          </p>
          <span className="grid size-10 place-items-center rounded-full border border-ink-600 text-white transition-all duration-500 ease-out-expo group-hover:border-orange-500 group-hover:bg-orange-500 group-hover:text-ink-950">
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-h3 font-extrabold">{project.title}</h3>
          <p className="text-muted">{project.summary}</p>
        </div>

        {project.techStack.length > 0 ? (
          <ul className="mt-auto flex flex-wrap gap-2" aria-label="Tech stack">
            {project.techStack.map((tech) => (
              <li key={tech}>
                <Tag>{tech}</Tag>
              </li>
            ))}
          </ul>
        ) : null}
      </Link>
    </TiltCard>
  );
}
