import { createRandom, hashString } from '@/lib/random';

export interface CoverArt {
  /** Which of the four patterns to draw. */
  pattern: number;
  glowX: number;
  glowY: number;
  rotation: number;
  /** True when gold leads and orange accents, false for the reverse. */
  goldLed: boolean;
}

/** Derives a cover design from the project's slug, so each project always gets the same art. */
export function coverArt(slug: string): CoverArt {
  const random = createRandom(hashString(slug));
  return {
    pattern: Math.floor(random() * 4),
    glowX: 25 + random() * 50,
    glowY: 25 + random() * 50,
    rotation: Math.round(random() * 60 - 30),
    goldLed: random() > 0.5,
  };
}
