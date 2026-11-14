import { Button, Heading, Reveal, Section } from '@/components/ui';
import { ProjectGrid } from '@/features/projects/ProjectGrid';

export function WorkSection() {
  return (
    <Section id="work" labelledBy="work-title">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <Heading
          id="work-title"
          index="03"
          overline="Featured work"
          title="Products I have designed and built."
        />
        <Reveal>
          <Button to="/projects" variant="secondary" arrow>
            All projects
          </Button>
        </Reveal>
      </div>

      <div className="mt-14">
        <ProjectGrid />
      </div>
    </Section>
  );
}
