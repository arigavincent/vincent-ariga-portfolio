import { AboutSection } from '@/features/home/AboutSection';
import { ContactSection } from '@/features/home/ContactSection';
import { Hero } from '@/features/home/Hero';
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
  useHashScroll();
  useSceneScroll(useSceneActive());

  return (
    <>
      <title>{settings.seoTitle}</title>
      <meta name="description" content={settings.seoDescription} />
      <Hero />
      <TechMarquee />
      <AboutSection />
      <SkillsSection />
      <WorkSection />
      <JourneySection />
      <ServicesSection />
      <ContactSection />
    </>
  );
}
