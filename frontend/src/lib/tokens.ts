/**
 * Reads a colour token from the design system at runtime, for code that cannot use Tailwind
 * classes (the WebGL scene). Keeps tokens.css the single source of truth for the palette.
 */
export function colorToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim();
}
