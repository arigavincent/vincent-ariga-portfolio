import { useId, useMemo } from 'react';

import type { Project } from '@/api/types';
import { apiUrl } from '@/api/client';
import { cn } from '@/lib/cn';

import { coverArt, type CoverArt } from './coverArt';

interface ProjectCoverProps {
  project: Pick<Project, 'slug' | 'title' | 'coverImageUrl'>;
  className?: string;
}

function Pattern({ art }: { art: CoverArt }) {
  const stroke = art.goldLed ? 'var(--color-gold-400)' : 'var(--color-orange-500)';
  switch (art.pattern) {
    case 0:
      return (
        <g fill="none" stroke={stroke} strokeWidth="0.35" opacity="0.7">
          {[10, 18, 26, 34, 42, 50].map((radius) => (
            <circle key={radius} cx={art.glowX} cy={art.glowY * 0.625} r={radius} />
          ))}
        </g>
      );
    case 1:
      return (
        <g fill={stroke} opacity="0.75">
          {Array.from({ length: 9 }, (_, row) =>
            Array.from({ length: 15 }, (__, column) => (
              <circle
                key={`${row}-${column}`}
                cx={6 + column * 6.3}
                cy={6 + row * 6.3}
                r={0.35 + ((row + column) % 4) * 0.22}
              />
            )),
          )}
        </g>
      );
    case 2:
      return (
        <g
          fill="none"
          stroke={stroke}
          strokeWidth="0.4"
          opacity="0.65"
          transform={`rotate(${art.rotation} 50 31)`}
        >
          {Array.from({ length: 16 }, (_, index) => (
            <line key={index} x1={-20 + index * 9} y1="-20" x2={-20 + index * 9} y2="90" />
          ))}
        </g>
      );
    default:
      return (
        <g
          fill="none"
          stroke={stroke}
          strokeWidth="0.4"
          opacity="0.7"
          transform={`rotate(${art.rotation} 50 31)`}
        >
          {[0, 1, 2, 3, 4].map((step) => (
            <rect
              key={step}
              x={22 + step * 5}
              y={8 + step * 4}
              width={56 - step * 10}
              height={46 - step * 8}
              rx="3"
            />
          ))}
        </g>
      );
  }
}

/**
 * A project's cover: the uploaded image when there is one, otherwise abstract art generated from
 * the project's slug in the brand palette. No stock or placeholder photos are ever shown.
 */
export function ProjectCover({ project, className }: ProjectCoverProps) {
  const art = useMemo(() => coverArt(project.slug), [project.slug]);
  const gradientId = useId();

  if (project.coverImageUrl) {
    return (
      <img
        src={apiUrl(project.coverImageUrl)}
        alt=""
        loading="lazy"
        decoding="async"
        className={cn('size-full object-cover', className)}
      />
    );
  }

  const glow = art.goldLed ? 'var(--color-orange-500)' : 'var(--color-gold-400)';

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 62.5"
      preserveAspectRatio="xMidYMid slice"
      className={cn('size-full bg-ink-950', className)}
    >
      <defs>
        <radialGradient id={gradientId} cx={`${art.glowX}%`} cy={`${art.glowY}%`} r="65%">
          <stop offset="0%" stopColor={glow} stopOpacity="0.55" />
          <stop offset="55%" stopColor={glow} stopOpacity="0.08" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="62.5" fill={`url(#${gradientId})`} />
      <Pattern art={art} />
    </svg>
  );
}
