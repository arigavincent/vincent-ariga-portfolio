import { Heading, Section } from '@/components/ui';
import { ProjectIndex } from '@/features/projects/ProjectIndex';
import { useSettings } from '@/hooks/useSettings';

export function ProjectsPage() {
  const settings = useSettings();

  return (
    <>
      <title>{`Projects | ${settings.displayName} · ${settings.brandMark}`}</title>
      <meta
        name="description"
        content={`Projects designed and built by ${settings.displayName}.`}
      />
      <Section className="pt-40">
        <Heading
          level="h1"
          overline="Projects"
          title="What I have been building."
          lead="Streaming, church management, payments and learning platforms."
        />
        <div className="mt-16">
          <ProjectIndex />
        </div>
      </Section>
    </>
  );
}
