/** A fixed film-grain layer over the page. Purely decorative. */
export function Grain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 grain opacity-[0.07] mix-blend-overlay"
    />
  );
}
