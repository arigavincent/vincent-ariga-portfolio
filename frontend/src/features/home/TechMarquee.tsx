import { useQuery } from '@tanstack/react-query';

import { queries } from '@/api/public';
import { Marquee } from '@/components/ui';
import { SkillBadge } from '@/features/skills/SkillBadge';

/** A strip of the tech stack scrolling past under the hero. Decorative: the Skills section lists it. */
export function TechMarquee() {
  const { data: skills } = useQuery(queries.skills());

  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <Marquee
      duration={50}
      pauseOnHover
      className="relative border-y border-ink-700 bg-ink-900/70 py-5 backdrop-blur-sm"
    >
      {skills.map((skill) => (
        <span
          key={skill.id}
          className="flex items-center gap-3 px-7 font-display text-lg font-bold text-warm-300"
        >
          <SkillBadge skill={skill} className="size-5 text-gold-400" />
          {skill.name}
        </span>
      ))}
    </Marquee>
  );
}
