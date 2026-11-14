import type { Skill } from '@/api/types';
import { BrandIcon } from '@/components/ui';
import { cn } from '@/lib/cn';

import { skillIcon, skillInitials } from './skillIcons';

interface SkillBadgeProps {
  skill: Skill;
  className?: string;
}

/** A skill's logo, or its initials when there is no logo for it. Decorative. */
export function SkillBadge({ skill, className }: SkillBadgeProps) {
  const icon = skillIcon(skill.iconKey);
  return icon ? (
    <BrandIcon icon={icon} className={className} />
  ) : (
    <span aria-hidden="true" className={cn('font-mono text-[0.6rem] font-semibold', className)}>
      {skillInitials(skill.name)}
    </span>
  );
}
