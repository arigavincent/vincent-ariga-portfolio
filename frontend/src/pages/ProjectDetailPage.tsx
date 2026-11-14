import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { siGithub } from 'simple-icons';

import { ApiError } from '@/api/client';
import { queries } from '@/api/public';
import type { Project } from '@/api/types';
import {
  BrandIcon,
  Button,
  ImageReveal,
  Overline,
  Reveal,
  Section,
  Skeleton,
  SplitText,
  Tag,
} from '@/components/ui';
import { ProjectCover } from '@/features/projects/ProjectCover';
import { ProjectPager } from '@/features/projects/ProjectPager';
import { useSettings } from '@/hooks/useSettings';
import { toParagraphs } from '@/lib/format';

import { NotFoundPage } from './NotFoundPage';

function ProjectArticle({ project }: { project: Project }) {
  const settings = useSettings();

  return (
    <article>
      <title>{`${project.title} | ${settings.displayName} · ${settings.brandMark}`}</title>
      <meta name="description" content={project.summary} />

      <header className="flex flex-col gap-8">
        <Overline>{project.category}</Overline>
        <SplitText
          as="h1"
          immediate
          text={project.title}
          className="font-display text-h1 font-extrabold"
        />
        <p className="max-w-2xl text-lead text-white">{project.summary}</p>
      </header>

      <ImageReveal className="mt-12 aspect-[16/8] rounded-card border border-ink-700">
        <ProjectCover project={project} />
      </ImageReveal>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-24">
        <div className="flex flex-col gap-8">
          <div className="flex max-w-2xl flex-col gap-5 text-lead text-muted">
            {toParagraphs(project.description).map((paragraph) => (
              <Reveal key={paragraph}>
                <p>{paragraph}</p>
              </Reveal>
            ))}
          </div>
          {project.repoUrl || project.liveUrl ? (
            <div className="flex flex-wrap gap-4">
              {project.liveUrl ? (
                <Button href={project.liveUrl} arrow>
                  Visit live site
                </Button>
              ) : null}
              {project.repoUrl ? (
                <Button href={project.repoUrl} variant="secondary">
                  <span className="flex items-center gap-2">
                    <BrandIcon icon={siGithub} />
                    Source code
                  </span>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <aside className="flex flex-col gap-10">
          {project.techStack.length > 0 ? (
            <Reveal className="flex flex-col gap-4">
              <h2 id="project-stack" className="eyebrow">
                Tech stack
              </h2>
              <ul aria-labelledby="project-stack" className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <li key={tech}>
                    <Tag>{tech}</Tag>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}
          {project.highlights.length > 0 ? (
            <Reveal className="flex flex-col gap-4">
              <h2 id="project-highlights" className="eyebrow">
                Highlights
              </h2>
              <ul aria-labelledby="project-highlights" className="flex flex-col">
                {project.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-baseline gap-3 border-b border-ink-700 py-3 last:border-b-0"
                  >
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 rounded-full bg-orange-500"
                    />
                    {highlight}
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}
        </aside>
      </div>

      <ProjectPager slug={project.slug} />
    </article>
  );
}

export function ProjectDetailPage() {
  const { slug = '' } = useParams();
  const { data: project, error, isPending, refetch } = useQuery(queries.project(slug));

  if (error instanceof ApiError && error.status === 404) {
    return <NotFoundPage />;
  }

  return (
    <Section className="pt-40">
      <Link
        to="/projects"
        className="mb-12 inline-flex items-center gap-2 font-mono text-xs tracking-overline text-gold-400 uppercase transition-colors hover:text-gold-300"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        All projects
      </Link>

      {isPending ? (
        <div role="status" aria-label="Loading project" className="flex flex-col gap-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 w-full max-w-3xl" />
          <Skeleton className="aspect-[16/8] w-full rounded-card" />
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-col items-start gap-4">
          <p className="text-muted">Could not load this project right now.</p>
          <Button
            variant="secondary"
            onClick={() => {
              void refetch();
            }}
          >
            Try again
          </Button>
        </div>
      ) : (
        <ProjectArticle key={project.slug} project={project} />
      )}
    </Section>
  );
}
