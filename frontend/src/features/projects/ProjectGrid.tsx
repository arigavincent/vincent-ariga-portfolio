import { useQuery } from '@tanstack/react-query';

import { queries } from '@/api/public';
import { QueryContent, Reveal, Skeleton } from '@/components/ui';

import { ProjectCard } from './ProjectCard';

interface ProjectGridProps {
  /** Show only featured projects (the home page), or everything published. */
  featuredOnly?: boolean;
}

/** Published projects as a responsive grid of large cards. */
export function ProjectGrid({ featuredOnly = false }: ProjectGridProps) {
  const query = useQuery(queries.projects());

  return (
    <QueryContent
      query={query}
      label="projects"
      skeleton={
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-[28rem] rounded-card" />
          ))}
        </div>
      }
      empty={<p className="text-muted">Projects are on their way. Check back soon.</p>}
    >
      {(projects) => (
        <ul className="grid gap-6 md:grid-cols-2">
          {projects
            .filter((project) => !featuredOnly || project.featured)
            .map((project, index) => (
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
