const swatches = [
  { name: 'Ink', className: 'bg-ink-900 border border-ink-700' },
  { name: 'Surface', className: 'bg-ink-800' },
  { name: 'Orange', className: 'bg-orange-500' },
  { name: 'Gold', className: 'bg-gold-400' },
  { name: 'Muted', className: 'bg-muted' },
  { name: 'Warm', className: 'bg-warm-500' },
] as const;

export function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-center gap-10 px-6 py-24">
      <p className="font-mono text-xs tracking-overline text-gold-400 uppercase">
        Software · Streaming · Apps
      </p>
      <h1 className="font-display text-5xl leading-none font-extrabold tracking-tight sm:text-7xl">
        Vincent Ariga <span className="text-orange-500">·</span> A&amp;J
      </h1>
      <p className="max-w-xl text-lg text-muted">
        Backend engineer working in Java / Spring Boot, Kotlin and Go. The full site is being built
        on this foundation.
      </p>
      <ul className="flex flex-wrap gap-4" aria-label="A&J colour palette">
        {swatches.map((swatch) => (
          <li key={swatch.name} className="flex flex-col gap-2">
            <span className={`block size-16 rounded-xl ${swatch.className}`} />
            <span className="font-mono text-xs text-warm-300">{swatch.name}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
