import { ArrowUp, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { siGithub, siWhatsapp } from 'simple-icons';

import { queries } from '@/api/public';
import { BrandIcon, Marquee } from '@/components/ui';
import { useScrollTo } from '@/hooks/useScrollTo';
import { useSettings } from '@/hooks/useSettings';

const timeFormatter = new Intl.DateTimeFormat('en-KE', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Africa/Nairobi',
});

/** The current time in Kenya, refreshed every half minute. */
function useKenyaTime(): string {
  const [time, setTime] = useState(() => timeFormatter.format(new Date()));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTime(timeFormatter.format(new Date()));
    }, 30_000);
    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return time;
}

export function Footer() {
  const settings = useSettings();
  const scrollTo = useScrollTo();
  const time = useKenyaTime();
  const { data: posts = [] } = useQuery(queries.blogPosts());
  const taglineParts = settings.tagline.split('·').map((part) => part.trim());

  const links = [
    {
      label: 'GitHub',
      href: settings.githubUrl,
      icon: <BrandIcon icon={siGithub} />,
      external: true,
    },
    {
      label: 'Email',
      href: `mailto:${settings.email}`,
      icon: <Mail aria-hidden="true" className="size-4" />,
      external: false,
    },
    {
      label: 'WhatsApp',
      href: `https://wa.me/${settings.whatsappNumber}`,
      icon: <BrandIcon icon={siWhatsapp} />,
      external: true,
    },
  ];

  return (
    <footer className="relative z-10 border-t border-ink-700 bg-ink-950">
      <Marquee duration={28} className="border-b border-ink-700 py-6 sm:py-8">
        {taglineParts.map((part) => (
          <span
            key={part}
            className="flex items-center font-display text-h2 font-extrabold uppercase"
          >
            <span className="px-6 text-outline sm:px-10">{part}</span>
            <span className="size-3 rounded-full bg-orange-500" />
          </span>
        ))}
      </Marquee>

      <div className="container-page grid gap-10 py-12 md:grid-cols-[1fr_auto] md:items-end">
        <div className="flex flex-col gap-4">
          <p className="font-display text-h3 font-bold">{settings.footerLine}</p>
          <p className="max-w-md text-sm text-muted">{settings.availability}</p>
          <p className="font-mono text-xs text-warm-300">
            {settings.location} · <time>{time}</time> EAT
          </p>
        </div>

        <ul className="flex flex-wrap gap-3" aria-label="Contact links">
          {links.map(({ label, href, icon, external }) => (
            <li key={label}>
              <a
                href={href}
                {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="flex h-11 items-center gap-2 rounded-full border border-ink-600 px-5 text-sm font-medium text-white transition-colors hover:border-gold-400 hover:text-gold-300"
              >
                {icon}
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="container-page flex flex-wrap items-center justify-between gap-4 border-t border-ink-700 py-6">
        <p className="font-mono text-xs text-warm-300">
          © {new Date().getFullYear()} {settings.displayName}. Built with Spring Boot and React.
        </p>
        <nav
          aria-label="Footer"
          className="flex gap-6 font-mono text-xs tracking-overline uppercase"
        >
          <Link to="/projects" className="text-warm-300 transition-colors hover:text-gold-300">
            Projects
          </Link>
          {posts.length > 0 ? (
            <Link to="/blog" className="text-warm-300 transition-colors hover:text-gold-300">
              Blog
            </Link>
          ) : null}
        </nav>
        <button
          type="button"
          onClick={() => {
            scrollTo(0);
          }}
          className="group flex items-center gap-2 font-mono text-xs tracking-overline text-gold-400 uppercase transition-colors hover:text-gold-300"
        >
          Back to top
          <ArrowUp
            aria-hidden="true"
            className="size-4 transition-transform duration-300 group-hover:-translate-y-1"
          />
        </button>
      </div>
    </footer>
  );
}
