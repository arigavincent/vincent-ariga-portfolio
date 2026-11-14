import {
  Button,
  Card,
  Heading,
  ImageReveal,
  MagneticButton,
  Marquee,
  Overline,
  Reveal,
  Section,
  Skeleton,
  SplitText,
  Tag,
  TiltCard,
} from '@/components/ui';

const swatches = [
  ['ink-950', 'bg-ink-950'],
  ['ink-900', 'bg-ink-900'],
  ['ink-850', 'bg-ink-850'],
  ['ink-800', 'bg-ink-800'],
  ['ink-700', 'bg-ink-700'],
  ['ink-600', 'bg-ink-600'],
  ['orange-400', 'bg-orange-400'],
  ['orange-500', 'bg-orange-500'],
  ['orange-600', 'bg-orange-600'],
  ['gold-300', 'bg-gold-300'],
  ['gold-400', 'bg-gold-400'],
  ['muted', 'bg-muted'],
  ['warm-300', 'bg-warm-300'],
  ['warm-500', 'bg-warm-500'],
  ['white', 'bg-white'],
] as const;

/** A living reference of the design system. Only routed in development builds. */
export function StyleguidePage() {
  return (
    <Section className="pt-40">
      <title>Styleguide | A&amp;J</title>
      <Heading
        level="h1"
        overline="Design system"
        title="The A&J building blocks."
        lead="Tokens and components used across the site."
      />

      <div className="mt-20 flex flex-col gap-20">
        <div className="flex flex-col gap-6">
          <Overline index="01">Colour</Overline>
          <ul className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-8">
            {swatches.map(([name, className]) => (
              <li key={name} className="flex flex-col gap-2">
                <span className={`block h-16 rounded-xl border border-ink-600 ${className}`} />
                <span className="font-mono text-xs text-warm-300">{name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <Overline index="02">Type</Overline>
          <p className="font-display text-display font-extrabold">Display</p>
          <p className="font-display text-h1 font-extrabold">Heading one</p>
          <p className="font-display text-h2 font-extrabold">Heading two</p>
          <p className="font-display text-h3 font-extrabold">Heading three</p>
          <p className="font-display text-h2 font-extrabold text-outline uppercase">Outlined</p>
          <p className="max-w-2xl text-lead text-muted">
            Lead paragraph in Manrope. Body copy stays calm so the display type can be loud.
          </p>
          <p className="font-mono text-sm text-warm-300">JetBrains Mono for labels and code.</p>
          <SplitText
            text="Split text reveals word by word."
            className="font-display text-h2 font-extrabold"
          />
        </div>

        <div className="flex flex-col gap-6">
          <Overline index="03">Buttons</Overline>
          <div className="flex flex-wrap items-center gap-4">
            <Button arrow>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button size="lg" arrow>
              Large
            </Button>
            <Button disabled>Disabled</Button>
            <MagneticButton size="lg" arrow>
              Magnetic
            </MagneticButton>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Overline index="04">Surfaces</Overline>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <h3 className="font-display text-h3 font-extrabold">Card</h3>
              <p className="mt-3 text-muted">The default elevated surface.</p>
            </Card>
            <Card glow>
              <h3 className="font-display text-h3 font-extrabold">Glow card</h3>
              <p className="mt-3 text-muted">With the animated gradient border.</p>
            </Card>
            <TiltCard className="rounded-card">
              <Card data-cursor-label="Tilt">
                <h3 className="font-display text-h3 font-extrabold">Tilt card</h3>
                <p className="mt-3 text-muted">Follows the pointer in 3D.</p>
              </Card>
            </TiltCard>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag>Java</Tag>
            <Tag>Spring Boot</Tag>
            <Tag>Kotlin</Tag>
            <Tag>Go</Tag>
          </div>
          <Skeleton className="h-10 w-64" />
        </div>

        <div className="flex flex-col gap-6">
          <Overline index="05">Motion</Overline>
          <Marquee duration={18} pauseOnHover className="rounded-card border border-ink-700 py-5">
            {['Java', 'Spring Boot', 'Kotlin', 'Go', 'PostgreSQL', 'Redis', 'Docker'].map(
              (item) => (
                <span key={item} className="px-8 font-display text-h3 font-bold text-warm-300">
                  {item}
                </span>
              ),
            )}
          </Marquee>
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <Card>Reveal: fades and lifts in on scroll.</Card>
            </Reveal>
            <ImageReveal className="rounded-card">
              <div className="grid h-40 place-items-center bg-linear-to-br from-orange-600 to-gold-400 font-display text-h3 font-extrabold text-ink-950">
                Image reveal
              </div>
            </ImageReveal>
          </div>
        </div>
      </div>
    </Section>
  );
}
