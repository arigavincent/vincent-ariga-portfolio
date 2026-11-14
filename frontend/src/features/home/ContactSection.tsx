import { Download, Mail } from 'lucide-react';
import { siGithub, siWhatsapp } from 'simple-icons';

import { cvUrl } from '@/api/public';
import { BrandIcon, Button, Heading, MagneticButton, Reveal, Section } from '@/components/ui';
import { useSettings } from '@/hooks/useSettings';

export function ContactSection() {
  const settings = useSettings();

  return (
    <Section id="contact" labelledBy="contact-title">
      <div className="gradient-border rounded-card p-8 sm:p-14 lg:p-20">
        <Heading
          id="contact-title"
          index="06"
          overline="Contact"
          title="Have a role or a project in mind? Let's talk."
          lead={settings.availability}
        />

        <Reveal className="mt-12 flex flex-wrap items-center gap-4">
          <MagneticButton href={`mailto:${settings.email}`} size="lg">
            <span className="flex items-center gap-2">
              <Mail aria-hidden="true" className="size-4" />
              {settings.email}
            </span>
          </MagneticButton>
          <Button href={`https://wa.me/${settings.whatsappNumber}`} variant="secondary" size="lg">
            <span className="flex items-center gap-2">
              <BrandIcon icon={siWhatsapp} />
              {settings.phoneDisplay}
            </span>
          </Button>
          <Button href={settings.githubUrl} variant="secondary" size="lg">
            <span className="flex items-center gap-2">
              <BrandIcon icon={siGithub} />
              GitHub
            </span>
          </Button>
          <Button href={cvUrl} variant="secondary" size="lg" download>
            <span className="flex items-center gap-2">
              <Download aria-hidden="true" className="size-4" />
              Download CV
            </span>
          </Button>
        </Reveal>
      </div>
    </Section>
  );
}
