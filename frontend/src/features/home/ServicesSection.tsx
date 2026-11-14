import { useQuery } from '@tanstack/react-query';

import { queries } from '@/api/public';
import { Card, Heading, QueryContent, Reveal, Section, Skeleton } from '@/components/ui';

export function ServicesSection() {
  const query = useQuery(queries.services());

  return (
    <Section id="services" labelledBy="services-title">
      <Heading
        id="services-title"
        index="05"
        overline="Services"
        title="What I can build for you."
        lead="From a single API to a complete product."
      />

      <div className="mt-14">
        <QueryContent
          query={query}
          label="services"
          skeleton={
            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-56 rounded-card" />
              ))}
            </div>
          }
        >
          {(services) => (
            <ul className="grid gap-6 sm:grid-cols-2">
              {services.map((service, index) => (
                <li key={service.id}>
                  <Reveal delay={(index % 2) * 0.1} className="h-full">
                    <Card className="flex h-full flex-col gap-6">
                      <p className="font-mono text-sm text-gold-400">
                        {String(index + 1).padStart(2, '0')}
                      </p>
                      <h3 className="font-display text-h3 font-extrabold">{service.title}</h3>
                      <p className="text-muted">{service.description}</p>
                    </Card>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </QueryContent>
      </div>
    </Section>
  );
}
