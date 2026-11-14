/** Lets keyboard users jump straight past the navigation. Visible only when focused. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="fixed top-4 left-4 z-[100] -translate-y-24 rounded-full bg-gold-400 px-5 py-3 text-sm font-semibold text-ink-950 transition-transform focus:translate-y-0"
    >
      Skip to content
    </a>
  );
}
