import type { SceneStopId } from './poses';

export interface SectionBox {
  id: SceneStopId;
  /** Distance from the top of the document to the top of the section, in pixels. */
  top: number;
  height: number;
}

export interface SceneStop {
  id: SceneStopId;
  /** Scroll progress (0..1) at which this section's pose is fully reached. */
  progress: number;
}

/** Smallest gap between two stops, so every transition has a non-zero length. */
const MIN_GAP = 0.001;

/**
 * Turns measured section positions into points on the scroll timeline. A section's pose is
 * reached when the section's opening screenful is centred in the viewport. The hero is always
 * the first stop at progress 0, and stops are forced to increase so the timeline stays ordered
 * even when sections are short or still loading.
 */
export function computeStops(
  sections: SectionBox[],
  viewportHeight: number,
  maxScroll: number,
): SceneStop[] {
  const stops: SceneStop[] = [{ id: 'hero', progress: 0 }];
  if (maxScroll <= 0) {
    return stops;
  }
  for (const section of sections) {
    if (section.id === 'hero') {
      continue;
    }
    const anchor = section.top + Math.min(section.height, viewportHeight) / 2 - viewportHeight / 2;
    const previous = stops[stops.length - 1]?.progress ?? 0;
    const progress = Math.min(1, Math.max(previous + MIN_GAP, anchor / maxScroll));
    stops.push({ id: section.id, progress });
  }
  return stops;
}
