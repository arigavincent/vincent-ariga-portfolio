import { AboutSection } from '@/features/home/AboutSection';
import { ContactSection } from '@/features/home/ContactSection';
import { Hero } from '@/features/home/Hero';
import { JourneySection } from '@/features/home/JourneySection';
import { ServicesSection } from '@/features/home/ServicesSection';
import { SkillsSection } from '@/features/home/SkillsSection';
import { WorkSection } from '@/features/home/WorkSection';
import { useHashScroll } from '@/hooks/useHashScroll';
import { useSettings } from '@/hooks/useSettings';

export function HomePage() {
  const settings = useSettings();
  useHashScroll();

  return (
    <>
      <title>{settings.seoTitle}</title>
      <meta name="description" content={settings.seoDescription} />
      <Hero />
      <AboutSection />
      <SkillsSection />
      <WorkSection />
      <JourneySection />
      <ServicesSection />
      <ContactSection />
    </>
  );
}
