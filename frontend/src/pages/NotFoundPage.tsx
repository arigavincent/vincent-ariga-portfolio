import { Seo } from '@/components/Seo';
import { Button, Overline, Section } from '@/components/ui';

export function NotFoundPage() {
  return (
    <Section className="flex min-h-dvh items-center pt-40">
      <Seo
        title="Page not found | Vincent Ariga · A&J"
        description="That page does not exist."
        path="/404"
        noIndex
      />
      <div className="flex flex-col items-start gap-8">
        <Overline>Error 404</Overline>
        <h1 className="font-display text-display font-extrabold">
          Lost<span className="text-orange-500">.</span>
        </h1>
        <p className="max-w-md text-lead text-muted">
          That page does not exist, or it has moved. The home page knows the way.
        </p>
        <Button to="/" size="lg" arrow>
          Back home
        </Button>
      </div>
    </Section>
  );
}
