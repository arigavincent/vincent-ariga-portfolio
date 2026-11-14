import type { CSSProperties } from 'react';

import type { Skill, SkillCategory } from '@/api/types';
import { cn } from '@/lib/cn';

import { SkillBadge } from './SkillBadge';

interface SkillOrbitProps {
  skills: Skill[];
  /** The skill currently highlighted, from hovering here or in the list beside the orbit. */
  activeId: number | null;
  onActivate: (id: number | null) => void;
}

/** One ring per category: radius as a percentage of the orbit's width, and seconds per turn. */
const rings: { category: SkillCategory; radius: number; duration: number; reverse: boolean }[] = [
  { category: 'FRONTEND', radius: 19, duration: 38, reverse: true },
  { category: 'TOOLING', radius: 33, duration: 64, reverse: false },
  { category: 'BACKEND', radius: 47, duration: 90, reverse: true },
];

/**
 * Tech logos orbiting the A&J mark, one ring per category. Hovering a logo (or its row in the
 * list) highlights it and pauses the orbit. Built with CSS transforms only, so it is cheap on
 * phones and stands still under reduced motion. Decorative: the accessible content is the list
 * next to it.
 */
export function SkillOrbit({ skills, activeId, onActivate }: SkillOrbitProps) {
  const active = skills.find((skill) => skill.id === activeId);

  return (
    <div
      aria-hidden="true"
      className={cn(
        // Clipped to its own box: rotating elements would otherwise widen the page on phones.
        'group/orbit relative mx-auto aspect-square w-full max-w-[36rem] overflow-hidden',
        activeId !== null && 'is-paused',
      )}
    >
      {/* Inset by a logo's radius so every logo stays inside the clipped box as it orbits. */}
      <div className="absolute inset-7 sm:inset-9">
        {rings.map((ring) => {
          const members = skills.filter((skill) => skill.category === ring.category);
          const direction = ring.reverse ? 'reverse' : 'normal';
          return (
            <div
              key={ring.category}
              className="absolute animate-orbit rounded-full border border-dashed border-ink-600 group-hover/orbit:[animation-play-state:paused] group-[.is-paused]/orbit:[animation-play-state:paused]"
              style={
                {
                  inset: `${50 - ring.radius}%`,
                  '--orbit-duration': `${ring.duration}s`,
                  animationDirection: direction,
                } as CSSProperties
              }
            >
              {members.map((skill, index) => {
                const angle = (index / members.length) * Math.PI * 2;
                const isActive = skill.id === activeId;
                return (
                  <div
                    key={skill.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${50 + 50 * Math.cos(angle)}%`,
                      top: `${50 + 50 * Math.sin(angle)}%`,
                    }}
                  >
                    {/* Spins against its ring, so the logo stays upright. */}
                    <div
                      className="animate-orbit group-hover/orbit:[animation-play-state:paused] group-[.is-paused]/orbit:[animation-play-state:paused]"
                      style={
                        {
                          '--orbit-duration': `${ring.duration}s`,
                          animationDirection: ring.reverse ? 'normal' : 'reverse',
                        } as CSSProperties
                      }
                    >
                      <div
                        onPointerEnter={() => {
                          onActivate(skill.id);
                        }}
                        onPointerLeave={() => {
                          onActivate(null);
                        }}
                        className={cn(
                          'grid size-10 place-items-center rounded-full border bg-ink-850 text-warm-300 transition-all duration-300 ease-out-expo sm:size-12',
                          isActive
                            ? 'scale-125 border-orange-500 text-orange-400 shadow-glow'
                            : 'border-ink-600 hover:border-gold-400',
                        )}
                      >
                        <SkillBadge skill={skill} className="size-4 sm:size-5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="absolute top-1/2 left-1/2 grid size-[22%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ink-600 bg-ink-900 text-center shadow-glow">
        {active ? (
          <span className="px-2 font-display text-[0.7rem] leading-tight font-bold text-white sm:text-sm">
            {active.name}
          </span>
        ) : (
          <span className="font-display text-sm font-extrabold sm:text-lg">
            A<span className="text-orange-500">&amp;</span>J
          </span>
        )}
      </div>
    </div>
  );
}
