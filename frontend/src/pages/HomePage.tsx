import { startTransition, useEffect, useState } from 'react';

import { Seo } from '@/components/Seo';
import { AboutSection } from '@/features/home/AboutSection';
import { ContactSection } from '@/features/home/ContactSection';
import { Hero } from '@/features/home/Hero';
import { PersonSchema } from '@/features/home/PersonSchema';
import { JourneySection } from '@/features/home/JourneySection';
import { ServicesSection } from '@/features/home/ServicesSection';
import { SkillsSection } from '@/features/home/SkillsSection';
import { TechMarquee } from '@/features/home/TechMarquee';
import { WorkSection } from '@/features/home/WorkSection';
import { useSceneScroll } from '@/features/scene/useSceneScroll';
import { useHashScroll } from '@/hooks/useHashScroll';
import { useSceneActive } from '@/hooks/useSceneActive';
import { useSettings } from '@/hooks/useSettings';

export function HomePage() {
  const settings = useSettings();
  const [sectionsMounted, setSectionsMounted] = useState(false);
  useHashScroll();
  useSceneScroll(useSceneActive());

  // The hero paints first. Everything below it mounts in a transition, which React renders in
  // small slices, so a long page never blocks the main thread in one go.
  useEffect(() => {
    startTransition(() => {
      setSectionsMounted(true);
    });
  }, []);

  return (
    <>
      <Seo title={settings.seoTitle} description={settings.seoDescription} path="/" />
      <PersonSchema />
      <Hero />
      {sectionsMounted ? (
        <>
          <TechMarquee />
          <AboutSection />
          <SkillsSection />
          <WorkSection />
          <JourneySection />
          <ServicesSection />
          <ContactSection />
        </>
      ) : null}
    </>
  );
}
