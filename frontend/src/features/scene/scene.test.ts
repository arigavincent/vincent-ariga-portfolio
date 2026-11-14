import { describe, expect, it } from 'vitest';

import { classifyDevice, type DeviceTraits } from './deviceTier';
import { createRandom } from '@/lib/random';

import { createDust, createShards } from './layout';
import { poses, resetSceneState, sceneState } from './poses';
import { computeStops } from './stops';

const desktop: DeviceTraits = {
  reducedMotion: false,
  webgl: true,
  coarsePointer: false,
  cores: 8,
  memory: 8,
  viewportWidth: 1440,
};

describe('classifyDevice', () => {
  it('gives a capable desktop the full scene', () => {
    expect(classifyDevice(desktop)).toBe('high');
  });

  it('gives no scene when reduced motion is requested or WebGL is missing', () => {
    expect(classifyDevice({ ...desktop, reducedMotion: true })).toBe('none');
    expect(classifyDevice({ ...desktop, webgl: false })).toBe('none');
  });

  it('gives touch devices, small screens and modest hardware the simplified scene', () => {
    expect(classifyDevice({ ...desktop, coarsePointer: true })).toBe('low');
    expect(classifyDevice({ ...desktop, viewportWidth: 390 })).toBe('low');
    expect(classifyDevice({ ...desktop, cores: 4 })).toBe('low');
    expect(classifyDevice({ ...desktop, memory: 2 })).toBe('low');
  });

  it('does not penalise browsers that hide hardware details', () => {
    expect(classifyDevice({ ...desktop, cores: undefined, memory: undefined })).toBe('high');
  });
});

describe('computeStops', () => {
  const viewport = 1000;

  it('starts with the hero at progress 0', () => {
    expect(computeStops([], viewport, 5000)).toEqual([{ id: 'hero', progress: 0 }]);
  });

  it('reaches a section pose when its opening screenful is centred', () => {
    const stops = computeStops(
      [
        { id: 'about', top: 1000, height: 1000 },
        { id: 'work', top: 3000, height: 2400 },
      ],
      viewport,
      5000,
    );

    // about: 1000 + 500 - 500 = 1000px of 5000. work is taller than the viewport, so only its
    // first screenful counts: 3000 + 500 - 500 = 3000px.
    expect(stops).toEqual([
      { id: 'hero', progress: 0 },
      { id: 'about', progress: 0.2 },
      { id: 'work', progress: 0.6 },
    ]);
  });

  it('keeps stops strictly increasing and inside 0..1', () => {
    const stops = computeStops(
      [
        { id: 'about', top: 0, height: 200 },
        { id: 'skills', top: 100, height: 200 },
        { id: 'contact', top: 9000, height: 600 },
      ],
      viewport,
      5000,
    );
    const progress = stops.map((stop) => stop.progress);

    expect(progress).toEqual([...progress].sort((a, b) => a - b));
    expect(new Set(progress).size).toBe(progress.length);
    expect(Math.max(...progress)).toBeLessThanOrEqual(1);
    expect(Math.min(...progress)).toBeGreaterThanOrEqual(0);
  });

  it('returns only the hero when the page cannot scroll', () => {
    expect(computeStops([{ id: 'about', top: 400, height: 300 }], viewport, 0)).toEqual([
      { id: 'hero', progress: 0 },
    ]);
  });
});

describe('scene poses', () => {
  it('defines a pose for the hero and every home section', () => {
    expect(Object.keys(poses)).toEqual([
      'hero',
      'about',
      'skills',
      'work',
      'journey',
      'services',
      'contact',
    ]);
  });

  it('keeps every pose legible and in range', () => {
    for (const pose of Object.values(poses)) {
      expect(pose.dim).toBeGreaterThan(0.3);
      expect(pose.dim).toBeLessThanOrEqual(1);
      expect(pose.warmth).toBeGreaterThanOrEqual(0);
      expect(pose.warmth).toBeLessThanOrEqual(1);
      expect(pose.distort).toBeGreaterThanOrEqual(0);
      expect(pose.distort).toBeLessThanOrEqual(1);
      expect(pose.coreScale).toBeGreaterThan(0);
    }
  });

  it('resets the live state back to the hero pose', () => {
    Object.assign(sceneState, poses.contact, { progress: 0.9 });

    resetSceneState();

    expect(sceneState).toEqual({ ...poses.hero, progress: 0 });
  });
});

describe('scene layout', () => {
  it('is deterministic for a given seed', () => {
    expect(createShards(12, 7)).toEqual(createShards(12, 7));
    expect(createShards(12, 7)).not.toEqual(createShards(12, 8));
    expect(createDust(10, 3)).toEqual(createDust(10, 3));
  });

  it('produces random values in [0, 1)', () => {
    const random = createRandom(99);
    const values = Array.from({ length: 200 }, random);

    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThan(1);
    expect(new Set(values).size).toBeGreaterThan(190);
  });

  it('keeps shards clear of the core and within the outer shell', () => {
    for (const shard of createShards(80, 7)) {
      const [x, y, z] = shard.position;
      const distance = Math.hypot(x, y / 0.7, (z + 1.4) / 0.65);
      expect(distance).toBeGreaterThanOrEqual(2.6 - 1e-6);
      expect(distance).toBeLessThanOrEqual(8.5 + 1e-6);
      expect(shard.scale).toBeGreaterThan(0);
      expect(shard.stretch).toBeGreaterThan(1);
    }
  });

  it('returns three coordinates per dust point', () => {
    expect(createDust(160, 41)).toHaveLength(480);
  });
});
