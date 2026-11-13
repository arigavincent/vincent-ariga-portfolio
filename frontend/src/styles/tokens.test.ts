import { describe, expect, it } from 'vitest';

import { contrastRatio } from './contrast';
import css from './tokens.css?raw';

const tokens = new Map<string, string>();
for (const [, name, value] of css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)) {
  if (name && value) {
    tokens.set(name, value);
  }
}

function color(name: string): string {
  const value = tokens.get(name);
  if (!value) {
    throw new Error(`Token --color-${name} is not defined in tokens.css`);
  }
  return value;
}

const AA_TEXT = 4.5;
const textSurfaces = ['ink-950', 'ink-900', 'ink-850', 'ink-800'];
const textColors = [
  'white',
  'muted',
  'gold-400',
  'gold-300',
  'orange-500',
  'orange-400',
  'warm-300',
];

describe('A&J palette tokens', () => {
  it('keeps the six brand colours exactly as specified', () => {
    expect(color('orange-500')).toBe('#f26b1d');
    expect(color('gold-400')).toBe('#e8c766');
    expect(color('ink-900')).toBe('#1b1b20');
    expect(color('muted')).toBe('#a9a9b0');
    expect(color('warm-500')).toBe('#5c574c');
    expect(color('white')).toBe('#ffffff');
  });

  it.each(textSurfaces.flatMap((surface) => textColors.map((text) => [text, surface] as const)))(
    '%s text on %s meets WCAG AA',
    (text, surface) => {
      expect(contrastRatio(color(text), color(surface))).toBeGreaterThanOrEqual(AA_TEXT);
    },
  );

  it.each(['orange-400', 'orange-500', 'orange-600', 'gold-400', 'gold-300'])(
    'dark ink text on a %s fill meets WCAG AA',
    (fill) => {
      expect(contrastRatio(color('ink-950'), color(fill))).toBeGreaterThanOrEqual(AA_TEXT);
    },
  );
});
