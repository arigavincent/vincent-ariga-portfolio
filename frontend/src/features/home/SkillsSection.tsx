import { useQuery } from '@tanstack/react-query';

import { queries } from '@/api/public';
import type { Skill, SkillCategory } from '@/api/types';
import { Heading, QueryContent, Reveal, Section, Skeleton } from '@/components/ui';

const categories: { key: SkillCategory; label: string }[] = [
  { key: 'BACKEND', label: 'Backend' },
  { key: 'FRONTEND', label: 'Frontend' },
  { key: 'TOOLING', label: 'Tooling' },
];

function SkillList({ skills }: { skills: Skill[] }) {
  return (
    <ul className="flex flex-col">
      {skills.map((skill) => (
        <li
          key={skill.id}
          className="flex items-baseline justify-between gap-4 border-b border-ink-700 py-3 last:border-b-0"
        >
          <span className="font-display text-lg font-bold whitespace-nowrap">{skill.name}</span>
          {skill.detail ? (
            <span className="text-right font-mono text-xs text-warm-300">{skill.detail}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function SkillsSection() {
  const query = useQuery(queries.skills());

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
            <div className="grid gap-6 lg:grid-cols-3">
              {categories.map((category) => (
                <Skeleton key={category.key} className="h-80 rounded-card" />
              ))}
            </div>
          }
        >
          {(skills) => (
            <div className="grid gap-6 lg:grid-cols-3">
              {categories.map((category, index) => (
                <Reveal key={category.key} delay={index * 0.1}>
                  <div className="h-full rounded-card border border-ink-700 bg-ink-850/80 p-6 backdrop-blur-sm sm:p-8">
                    <h3 className="mb-4 eyebrow">{category.label}</h3>
                    <SkillList skills={skills.filter((skill) => skill.category === category.key)} />
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </QueryContent>
      </div>
    </Section>
  );
}
