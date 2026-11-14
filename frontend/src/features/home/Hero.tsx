import { ArrowDown, Download } from 'lucide-react';
import { motion } from 'motion/react';

import { cvUrl } from '@/api/public';
import { Button, MagneticButton, SplitText } from '@/components/ui';
import { useBooted } from '@/hooks/useBooted';
import { useSettings } from '@/hooks/useSettings';

import { HeroBackdrop } from './HeroBackdrop';

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

/** Full-screen opening: name, role, one-line pitch and the two main calls to action. */
export function Hero() {
  const settings = useSettings();
  const booted = useBooted();
  const [firstName, ...rest] = settings.displayName.split(' ');
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: booted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    transition: { duration: 0.9, delay, ease: easeOutExpo },
  });

  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-dvh flex-col justify-end overflow-hidden pt-28 pb-10 sm:pb-14"
    >
      <HeroBackdrop />

      <div className="relative container-page flex flex-col gap-8">
        <motion.p className="eyebrow" {...fade(0.1)}>
          {settings.tagline}
        </motion.p>

        {booted ? (
          <SplitText
            as="h1"
            id="hero-title"
            immediate
            text={`${firstName ?? ''}\n${rest.join(' ')}`}
            stagger={0.12}
            className="font-display text-display font-extrabold uppercase"
          />
        ) : (
          <h1
            id="hero-title"
            className="invisible font-display text-display font-extrabold uppercase"
          >
            {firstName}
            <br />
            {rest.join(' ')}
          </h1>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,34rem)_1fr] lg:items-end">
          <motion.div className="flex flex-col gap-6" {...fade(0.5)}>
            <p className="text-lead text-muted">{settings.headline}</p>
            <div className="flex flex-wrap items-center gap-4">
              <MagneticButton to={{ pathname: '/', hash: '#work' }} size="lg" arrow>
                See my work
              </MagneticButton>
              <Button href={cvUrl} variant="secondary" size="lg" download>
                <span className="flex items-center gap-2">
                  <Download aria-hidden="true" className="size-4" />
                  Download CV
                </span>
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center justify-between gap-4 lg:justify-end lg:gap-10"
            {...fade(0.7)}
          >
            <p className="flex max-w-xs items-start gap-3 text-sm text-warm-300">
              <span className="relative mt-1.5 flex size-2 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-orange-500 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-orange-500" />
              </span>
              {settings.availability}
            </p>
            <p className="flex items-center gap-2 font-mono text-xs tracking-overline text-gold-400 uppercase">
              Scroll
              <ArrowDown aria-hidden="true" className="size-4 animate-bounce" />
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
