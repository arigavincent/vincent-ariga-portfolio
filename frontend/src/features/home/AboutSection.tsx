import { useQuery } from '@tanstack/react-query';

import { queries } from '@/api/public';
import { Heading, Reveal, Section } from '@/components/ui';
import { useSettings } from '@/hooks/useSettings';
import { formatYears, toParagraphs } from '@/lib/format';

export function AboutSection() {
  const settings = useSettings();
  const { data: education } = useQuery(queries.education());
  const degree = education?.[0];

  const facts = [
    { label: 'Based in', value: settings.location },
    { label: 'Focus', value: settings.role },
    ...(degree
      ? [
          {
            label: 'Education',
            value: [
              degree.qualification,
              degree.institution,
              formatYears(degree.startYear, degree.endYear),
            ]
              .filter(Boolean)
              .join(', '),
          },
        ]
      : []),
    { label: 'Availability', value: settings.availability },
  ];

  return (
    <Section id="about" labelledBy="about-title">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
        <Heading
          id="about-title"
          index="01"
          overline="About"
          title="I like systems that stay up and code that stays readable."
        />

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-5 text-lead text-muted">
            {toParagraphs(settings.bio).map((paragraph, index) => (
              <Reveal key={paragraph} delay={index * 0.08}>
                <p>{paragraph}</p>
              </Reveal>
            ))}
          </div>

          {settings.heritageNote ? (
            <Reveal>
              <p className="border-l border-gold-400 pl-5 font-display text-h3 font-bold text-gold-300">
                {settings.heritageNote}
              </p>
            </Reveal>
          ) : null}

          <Reveal>
            <dl className="grid gap-px overflow-hidden rounded-card border border-ink-700 bg-ink-700 sm:grid-cols-2">
              {facts.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-2 bg-ink-850 p-6">
                  <dt className="eyebrow">{fact.label}</dt>
                  <dd className="text-white">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
