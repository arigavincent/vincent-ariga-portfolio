import { useQuery } from '@tanstack/react-query';
import { Building2, Layers, Server, Sparkles, Waypoints, type LucideIcon } from 'lucide-react';

import { queries } from '@/api/public';
import { Heading, QueryContent, Reveal, Section, Skeleton, TiltCard } from '@/components/ui';

/** Icons for the keys stored on services in the admin panel. */
const serviceIcons: Record<string, LucideIcon> = {
  server: Server,
  api: Waypoints,
  layers: Layers,
  building: Building2,
};

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
                <Skeleton key={index} className="h-64 rounded-card" />
              ))}
            </div>
          }
        >
          {(services) => (
            <ul className="grid gap-6 sm:grid-cols-2">
              {services.map((service, index) => {
                const Icon = serviceIcons[service.iconKey ?? ''] ?? Sparkles;
                return (
                  <li key={service.id}>
                    <Reveal delay={(index % 2) * 0.1} className="h-full">
                      <TiltCard className="h-full rounded-card" maxTilt={5}>
                        <div className="group flex h-full flex-col gap-6 rounded-card border border-ink-700 bg-ink-850 p-6 shadow-card transition-colors duration-500 hover:border-gold-400/60 sm:p-8">
                          <div className="flex items-center justify-between">
                            <span className="grid size-12 place-items-center rounded-2xl border border-ink-600 text-gold-400 transition-colors duration-500 group-hover:border-orange-500 group-hover:text-orange-400">
                              <Icon aria-hidden="true" className="size-5" />
                            </span>
                            <span className="font-mono text-sm text-warm-300">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <h3 className="font-display text-h3 font-extrabold">{service.title}</h3>
                          <p className="text-muted">{service.description}</p>
                        </div>
                      </TiltCard>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          )}
        </QueryContent>
      </div>
    </Section>
  );
}
