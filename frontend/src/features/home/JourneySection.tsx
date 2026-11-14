import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useSpring } from 'motion/react';
import { useRef } from 'react';

import { queries } from '@/api/public';
import { Heading, Reveal, Section } from '@/components/ui';
import { formatPeriod, formatYears, toParagraphs } from '@/lib/format';

interface TimelineEntry {
  key: string;
  kind: 'Experience' | 'Education';
  period: string;
  title: string;
  place: string;
  note: string | null;
  paragraphs: string[];
}

/** A vertical timeline whose spine draws itself in as the section scrolls through the viewport. */
function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <ol ref={ref} className="relative mt-14 flex flex-col gap-12 pl-10 md:pl-16">
      <span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-[7px] w-px bg-ink-700 md:left-[15px]"
      />
      <motion.span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-linear-to-b from-orange-500 to-gold-400 md:left-[15px]"
        style={{ scaleY }}
      />

      {entries.map((entry) => (
        <li key={entry.key} className="relative">
          <span
            aria-hidden="true"
            className="absolute top-1.5 -left-10 grid size-[15px] place-items-center rounded-full border border-gold-400 bg-ink-900 md:-left-16 md:size-[31px]"
          >
            <span className="size-1.5 rounded-full bg-orange-500 md:size-2.5" />
          </span>
          <Reveal className="grid gap-4 md:grid-cols-[11rem_1fr] md:gap-10">
            <div className="flex flex-col gap-2">
              <p className="eyebrow">{entry.kind}</p>
              {entry.period ? (
                <p className="font-mono text-sm text-warm-300">{entry.period}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-3 rounded-card border border-ink-700 bg-ink-850/85 p-6 backdrop-blur-sm sm:p-8">
              <h3 className="font-display text-h3 font-extrabold">{entry.title}</h3>
              <p className="text-white">
                {entry.place}
                {entry.note ? <span className="text-gold-300"> · {entry.note}</span> : null}
              </p>
              {entry.paragraphs.map((paragraph) => (
                <p key={paragraph} className="max-w-2xl text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

export function JourneySection() {
  const { data: experience = [] } = useQuery(queries.experience());
  const { data: education = [] } = useQuery(queries.education());

  const entries: TimelineEntry[] = [
    ...experience.map((item) => ({
      key: `experience-${item.id}`,
      kind: 'Experience' as const,
      period: formatPeriod(item.startDate, item.endDate, item.current),
      title: item.title,
      place: [item.organization, item.location].filter(Boolean).join(' · '),
      note: null,
      paragraphs: toParagraphs(item.description),
    })),
    ...education.map((item) => ({
      key: `education-${item.id}`,
      kind: 'Education' as const,
      period: formatYears(item.startYear, item.endYear),
      title: item.qualification,
      place: item.institution,
      note: item.grade,
      paragraphs: item.description ? toParagraphs(item.description) : [],
    })),
  ];

  return (
    <Section id="journey" labelledBy="journey-title">
      <Heading id="journey-title" index="04" overline="Journey" title="Experience and education." />
      <Timeline entries={entries} />
    </Section>
  );
}
