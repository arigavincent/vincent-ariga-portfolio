import { useQuery } from '@tanstack/react-query';

import { queries } from '@/api/public';
import { QueryContent, Reveal, Skeleton } from '@/components/ui';

import { ProjectCard } from './ProjectCard';

interface ProjectGridProps {
  /** Show only the first N projects. */
  limit?: number;
}

/** The published projects as a responsive grid of cards. */
export function ProjectGrid({ limit }: ProjectGridProps) {
  const query = useQuery(queries.projects());

  return (
    <QueryContent
      query={query}
      label="projects"
      skeleton={
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: limit ?? 4 }, (_, index) => (
            <Skeleton key={index} className="h-72 rounded-card" />
          ))}
        </div>
      }
      empty={<p className="text-muted">Projects are on their way. Check back soon.</p>}
    >
      {(projects) => (
        <ul className="grid gap-6 md:grid-cols-2">
          {projects.slice(0, limit).map((project, index) => (
            <li key={project.id}>
              <Reveal delay={(index % 2) * 0.1} className="h-full">
                <ProjectCard project={project} index={index} />
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </QueryContent>
  );
}
