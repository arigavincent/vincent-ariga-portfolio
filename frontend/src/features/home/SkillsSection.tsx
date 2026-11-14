import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { queries } from '@/api/public';
import type { Skill, SkillCategory } from '@/api/types';
import { Heading, QueryContent, Reveal, Section, Skeleton } from '@/components/ui';
import { SkillBadge } from '@/features/skills/SkillBadge';
import { SkillOrbit } from '@/features/skills/SkillOrbit';
import { cn } from '@/lib/cn';

const categories: { key: SkillCategory; label: string }[] = [
  { key: 'BACKEND', label: 'Backend' },
  { key: 'FRONTEND', label: 'Frontend' },
  { key: 'TOOLING', label: 'Tooling' },
];

interface SkillListProps {
  skills: Skill[];
  activeId: number | null;
  onActivate: (id: number | null) => void;
}

function SkillList({ skills, activeId, onActivate }: SkillListProps) {
  return (
    <ul className="grid gap-x-8 sm:grid-cols-2">
      {skills.map((skill) => (
        <li
          key={skill.id}
          onPointerEnter={() => {
            onActivate(skill.id);
          }}
          onPointerLeave={() => {
            onActivate(null);
          }}
          className={cn(
            'flex items-center gap-3 border-b border-ink-700 py-3 transition-colors duration-300',
            skill.id === activeId ? 'text-orange-400' : 'text-white',
          )}
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full border border-ink-600 text-warm-300">
            <SkillBadge skill={skill} className="size-3.5" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-display font-bold">{skill.name}</span>
            {skill.detail ? (
              <span className="font-mono text-xs text-warm-300">{skill.detail}</span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function SkillsSection() {
  const query = useQuery(queries.skills());
  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <Section id="skills" labelledBy="skills-title">
      <Heading
        id="skills-title"
        index="02"
        overline="Skills"
        title="Backend first, comfortable across the stack."
        lead="The languages, frameworks and tools I reach for."
      />

      <div className="mt-14">
        <QueryContent
          query={query}
          label="skills"
          skeleton={
            <div className="grid gap-10 lg:grid-cols-2">
              <Skeleton className="mx-auto aspect-square w-full max-w-[36rem] rounded-full" />
              <Skeleton className="h-96 rounded-card" />
            </div>
          }
        >
          {(skills) => (
            <div className="grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
              <Reveal className="lg:sticky lg:top-28">
                <SkillOrbit skills={skills} activeId={activeId} onActivate={setActiveId} />
              </Reveal>

              <div className="flex flex-col gap-10">
                {categories.map((category, index) => (
                  <Reveal key={category.key} delay={index * 0.08}>
                    <h3 className="mb-2 eyebrow">{category.label}</h3>
                    <SkillList
                      skills={skills.filter((skill) => skill.category === category.key)}
                      activeId={activeId}
                      onActivate={setActiveId}
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </QueryContent>
      </div>
    </Section>
  );
}
