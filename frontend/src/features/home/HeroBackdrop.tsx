/**
 * The hero's CSS backdrop: an orange glow, a gold haze and slow orbit rings on the ink base. It
 * sits under the 3D scene and is also the complete visual when WebGL or motion is unavailable.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute top-1/2 left-[62%] size-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-orange-500)_26%,transparent),transparent)] blur-2xl" />
      <div className="absolute top-[18%] left-[78%] size-[34vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-gold-400)_14%,transparent),transparent)] blur-2xl" />
      <div className="absolute top-1/2 left-[62%] size-[58vmin] -translate-x-1/2 -translate-y-1/2 animate-[spin_60s_linear_infinite] rounded-full border border-dashed border-warm-500/50" />
      <div className="absolute top-1/2 left-[62%] size-[82vmin] -translate-x-1/2 -translate-y-1/2 animate-[spin_90s_linear_infinite_reverse] rounded-full border border-ink-700" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-ink-900 to-transparent" />
    </div>
  );
}
