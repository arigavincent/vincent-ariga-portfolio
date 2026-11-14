import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { useState, type PointerEvent } from 'react';
import { Link } from 'react-router';

import { queries } from '@/api/public';
import type { Project } from '@/api/types';
import { QueryContent, Reveal, Skeleton } from '@/components/ui';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/useMediaQuery';

import { ProjectCover } from './ProjectCover';

const spring = { stiffness: 180, damping: 22, mass: 0.6 };
/** The floating preview's size in pixels, and its gap from the pointer. */
const PREVIEW = { width: 352, height: 220, gap: 36 };

function ProjectRows({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Project | null>(null);
  const x = useSpring(useMotionValue(0), spring);
  const y = useSpring(useMotionValue(0), spring);
  const finePointer = useFinePointer();
  const reducedMotion = usePrefersReducedMotion();
  const floating = finePointer && !reducedMotion;

  function handleMove(event: PointerEvent<HTMLUListElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    // Beside the pointer rather than under it, so the row being read stays visible; it flips
    // to the left when there is no room on the right.
    const fitsRight = pointerX + PREVIEW.gap + PREVIEW.width < rect.width;
    x.set(fitsRight ? pointerX + PREVIEW.gap : pointerX - PREVIEW.gap - PREVIEW.width);
    y.set(event.clientY - rect.top - PREVIEW.height / 2);
  }

  return (
    <ul
      className="relative border-t border-ink-700"
      onPointerMove={floating ? handleMove : undefined}
      onPointerLeave={() => {
        setActive(null);
      }}
    >
      {projects.map((project, index) => (
        <li key={project.id} className="border-b border-ink-700">
          <Reveal>
            <Link
              to={`/projects/${project.slug}`}
              data-cursor-label="View"
              onPointerEnter={() => {
                setActive(project);
              }}
              onFocus={() => {
                setActive(project);
              }}
              className="group grid items-center gap-4 py-8 transition-colors duration-500 hover:text-orange-400 md:grid-cols-[4rem_1fr_auto] md:gap-8 md:py-10"
            >
              <span className="font-mono text-sm text-gold-400">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="flex flex-col gap-3">
                <span className="font-display text-h2 font-extrabold transition-transform duration-700 ease-out-expo md:group-hover:translate-x-4">
                  {project.title}
                </span>
                <span className="max-w-2xl text-muted">{project.summary}</span>
                {/* On touch devices there is no hover preview, so the cover sits in the row. */}
                {floating ? null : (
                  <span className="mt-2 block aspect-[16/10] w-full max-w-md overflow-hidden rounded-xl border border-ink-700">
                    <ProjectCover project={project} />
                  </span>
                )}
              </span>
              <span className="flex items-center gap-4">
                <span className="eyebrow">{project.category}</span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-6 text-warm-300 transition-all duration-500 ease-out-expo group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-orange-500"
                />
              </span>
            </Link>
          </Reveal>
        </li>
      ))}

      {floating ? (
        <motion.li
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-10 overflow-hidden rounded-card border border-ink-600 shadow-card"
          style={{ x, y, width: PREVIEW.width, height: PREVIEW.height }}
          animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.85 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatePresence mode="popLayout">
            {active ? (
              <motion.div
                key={active.slug}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.15 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <ProjectCover project={active} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.li>
      ) : null}
    </ul>
  );
}

/**
 * Every published project as a list of large rows. With a mouse, a preview of the hovered
 * project floats beside the pointer; on touch screens each row shows its cover inline.
 */
export function ProjectIndex() {
  const query = useQuery(queries.projects());

  return (
    <QueryContent
      query={query}
      label="projects"
      skeleton={
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      }
      empty={<p className="text-muted">Projects are on their way. Check back soon.</p>}
    >
      {(projects) => <ProjectRows projects={projects} />}
    </QueryContent>
  );
}
