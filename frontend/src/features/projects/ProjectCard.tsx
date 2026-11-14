import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';

import type { Project } from '@/api/types';
import { ImageReveal, Tag, TiltCard } from '@/components/ui';

import { ProjectCover } from './ProjectCover';

interface ProjectCardProps {
  project: Project;
  /** Position in the list, shown as a two-digit index. */
  index: number;
}

/**
 * A large, tilting card that links to a project's detail page. Hovering zooms the cover and
 * slides the project's highlights over it as a preview.
 */
export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <TiltCard className="h-full rounded-card">
      <Link
        to={`/projects/${project.slug}`}
        data-cursor-label="View"
        className="group flex h-full flex-col overflow-hidden rounded-card border border-ink-700 bg-ink-850 shadow-card transition-colors duration-500 hover:border-orange-500/60"
      >
        <ImageReveal className="relative aspect-[16/10]">
          <ProjectCover
            project={project}
            className="transition-transform duration-[1200ms] ease-out-expo group-hover:scale-110"
          />
          {project.highlights.length > 0 ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 flex translate-y-4 flex-col justify-end gap-1.5 bg-linear-to-t from-ink-950 via-ink-950/80 to-transparent p-6 opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100 sm:p-8"
            >
              {project.highlights.slice(0, 4).map((highlight) => (
                <p key={highlight} className="flex items-center gap-2 text-sm text-white">
                  <span className="size-1 shrink-0 rounded-full bg-orange-500" />
                  {highlight}
                </p>
              ))}
            </div>
          ) : null}
        </ImageReveal>

        <div className="flex flex-1 flex-col gap-6 p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <p className="eyebrow">
              {String(index + 1).padStart(2, '0')} · {project.category}
            </p>
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-ink-600 text-white transition-all duration-500 ease-out-expo group-hover:border-orange-500 group-hover:bg-orange-500 group-hover:text-ink-950">
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
        </div>
      </Link>
    </TiltCard>
  );
}
