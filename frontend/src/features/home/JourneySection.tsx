import { useQuery } from '@tanstack/react-query';

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

      <ol className="mt-14 border-t border-ink-700">
        {entries.map((entry) => (
          <li key={entry.key} className="border-b border-ink-700">
            <Reveal className="grid gap-4 py-8 md:grid-cols-[12rem_1fr] md:gap-10">
              <div className="flex flex-col gap-2">
                <p className="eyebrow">{entry.kind}</p>
                {entry.period ? (
                  <p className="font-mono text-sm text-warm-300">{entry.period}</p>
                ) : null}
              </div>
              <div className="flex flex-col gap-3">
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
    </Section>
  );
}
