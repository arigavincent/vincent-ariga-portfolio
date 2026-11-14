/** Deterministic placement of the scene's floating pieces, so every visit looks the same. */

/** A small, fast seeded random number generator (mulberry32). Returns values in [0, 1). */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Shard {
  position: [number, number, number];
  rotation: [number, number, number];
  /** Stretch along the shard's own axis, so each one reads as a sliver rather than a regular solid. */
  stretch: number;
  /** Radians per second around each axis. */
  spin: [number, number, number];
  scale: number;
  /** Offset into the bobbing cycle, so shards do not move in unison. */
  phase: number;
}

const INNER_RADIUS = 2.6;
const OUTER_RADIUS = 8.5;
const DEPTH_SQUASH = 0.65;
const DEPTH_OFFSET = 1.4;

/** Scatters shards through a hollow shell around the origin, leaving the core's space clear. */
export function createShards(count: number, seed: number): Shard[] {
  const random = createRandom(seed);
  const between = (min: number, max: number) => min + random() * (max - min);
  return Array.from({ length: count }, () => {
    const radius = between(INNER_RADIUS, OUTER_RADIUS);
    const azimuth = between(0, Math.PI * 2);
    const inclination = Math.acos(between(-1, 1));
    return {
      position: [
        radius * Math.sin(inclination) * Math.cos(azimuth),
        radius * Math.cos(inclination) * 0.7,
        // Pushed back and flattened in depth: few shards come between the camera and the text.
        radius * Math.sin(inclination) * Math.sin(azimuth) * DEPTH_SQUASH - DEPTH_OFFSET,
      ],
      stretch: between(1.4, 2.6),
      rotation: [between(0, Math.PI), between(0, Math.PI), between(0, Math.PI)],
      spin: [between(-0.25, 0.25), between(-0.25, 0.25), between(-0.25, 0.25)],
      scale: between(0.045, 0.17),
      phase: between(0, Math.PI * 2),
    };
  });
}

/** Positions for a cloud of dust points, as a flat xyz array ready for a buffer attribute. */
export function createDust(count: number, seed: number): Float32Array {
  const random = createRandom(seed);
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const radius = 4 + random() * 10;
    const azimuth = random() * Math.PI * 2;
    const inclination = Math.acos(random() * 2 - 1);
    positions[index * 3] = radius * Math.sin(inclination) * Math.cos(azimuth);
    positions[index * 3 + 1] = radius * Math.cos(inclination);
    positions[index * 3 + 2] = radius * Math.sin(inclination) * Math.sin(azimuth);
  }
  return positions;
}
