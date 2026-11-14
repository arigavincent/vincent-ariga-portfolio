import { Download, Mail } from 'lucide-react';
import { siGithub, siWhatsapp } from 'simple-icons';

import { cvUrl } from '@/api/public';
import { BrandIcon, Heading, Reveal, Section } from '@/components/ui';
import { ContactForm } from '@/features/contact/ContactForm';
import { useSettings } from '@/hooks/useSettings';

export function ContactSection() {
  const settings = useSettings();

  const channels = [
    {
      label: 'Email',
      value: settings.email,
      href: `mailto:${settings.email}`,
      icon: <Mail aria-hidden="true" className="size-4" />,
      external: false,
    },
    {
      label: 'WhatsApp',
      value: settings.phoneDisplay,
      href: `https://wa.me/${settings.whatsappNumber}`,
      icon: <BrandIcon icon={siWhatsapp} />,
      external: true,
    },
    {
      label: 'GitHub',
      value: settings.githubUrl.replace(/^https?:\/\//, ''),
      href: settings.githubUrl,
      icon: <BrandIcon icon={siGithub} />,
      external: true,
    },
    {
      label: 'CV',
      value: 'Download as PDF',
      href: cvUrl,
      icon: <Download aria-hidden="true" className="size-4" />,
      external: false,
    },
  ];

  return (
    <Section id="contact" labelledBy="contact-title">
      <div className="grid gradient-border gap-12 rounded-card p-6 sm:p-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:p-16">
        <div className="flex flex-col gap-10">
          <Heading
            id="contact-title"
            index="06"
            overline="Contact"
            title="Have a role or a project in mind? Let's talk."
            lead={settings.availability}
          />

          <Reveal>
            <ul className="flex flex-col" aria-label="Ways to reach me">
              {channels.map((channel) => (
                <li key={channel.label} className="border-b border-ink-700 first:border-t">
                  <a
                    href={channel.href}
                    {...(channel.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    {...(channel.label === 'CV' ? { download: true } : {})}
                    className="group flex items-center justify-between gap-4 py-4 transition-colors duration-300 hover:text-orange-400"
                  >
                    <span className="flex items-center gap-3 font-mono text-xs tracking-overline text-gold-400 uppercase">
                      {channel.icon}
                      {channel.label}
                    </span>
                    <span className="text-right text-sm font-medium break-all">
                      {channel.value}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  );
}
