import type { HomeSectionId } from '@/lib/site';

/** The stops of the scroll story: the hero, then each home section. */
export type SceneStopId = 'hero' | HomeSectionId;

/**
 * Everything about the 3D composition that scrolling changes. Each home section has one pose; the
 * scroll timeline blends from pose to pose as the visitor moves down the page.
 */
export interface ScenePose {
  /**
   * Where the core sits, in world units. Poses keep it in the part of the screen each section
   * leaves empty, so it frames the content instead of sitting behind the text.
   */
  coreX: number;
  coreY: number;
  coreZ: number;
  coreScale: number;
  /** How far the core's surface is distorted: the morph from calm (0) to molten (1). */
  distort: number;
  /** Scale of the wireframe cage around the core. */
  cageScale: number;
  /** 0 = orbit rings pulled in tight, 1 = fully opened out. */
  ringSpread: number;
  /** Multiplier on the volume the floating shards occupy. */
  shardSpread: number;
  cameraY: number;
  cameraZ: number;
  /** Colour shift of the glow: 0 = brand orange, 1 = brand gold. */
  warmth: number;
  /** Glow intensity multiplier. */
  energy: number;
  /** Opacity of the whole scene layer, lowered behind text-heavy sections for legibility. */
  dim: number;
}

/** The live scene values: the current blend of poses plus overall scroll progress (0..1). */
export interface SceneState extends ScenePose {
  progress: number;
}

export const poses: Record<SceneStopId, ScenePose> = {
  hero: {
    coreX: 2.2,
    coreY: 0.3,
    coreZ: 0,
    coreScale: 1.15,
    distort: 0.3,
    cageScale: 1,
    ringSpread: 0.35,
    shardSpread: 1,
    cameraY: 0,
    cameraZ: 7.5,
    warmth: 0,
    energy: 1,
    dim: 1,
  },
  about: {
    coreX: -3.7,
    coreY: -2.2,
    coreZ: -1.2,
    coreScale: 0.85,
    distort: 0.14,
    cageScale: 1.15,
    ringSpread: 0.2,
    shardSpread: 1.15,
    cameraY: 0.2,
    cameraZ: 8.6,
    warmth: 0.3,
    energy: 0.6,
    dim: 0.55,
  },
  skills: {
    coreX: 3.0,
    coreY: 1.5,
    coreZ: -1.8,
    coreScale: 0.95,
    distort: 0.08,
    cageScale: 1.7,
    ringSpread: 1,
    shardSpread: 1.6,
    cameraY: 0,
    cameraZ: 8,
    warmth: 1,
    energy: 0.85,
    dim: 0.55,
  },
  work: {
    coreX: 3.4,
    coreY: -1.5,
    coreZ: -0.8,
    coreScale: 1.0,
    distort: 0.55,
    cageScale: 1.2,
    ringSpread: 0.5,
    shardSpread: 0.8,
    cameraY: -0.2,
    cameraZ: 6.2,
    warmth: 0.1,
    energy: 0.9,
    dim: 0.5,
  },
  journey: {
    coreX: 3.2,
    coreY: 1.3,
    coreZ: -1.6,
    coreScale: 0.8,
    distort: 0.3,
    cageScale: 1.4,
    ringSpread: 0.7,
    shardSpread: 1.3,
    cameraY: 0.3,
    cameraZ: 8.6,
    warmth: 0.6,
    energy: 0.6,
    dim: 0.5,
  },
  services: {
    coreX: -3.5,
    coreY: -1.7,
    coreZ: -1.2,
    coreScale: 0.95,
    distort: 0.2,
    cageScale: 1.6,
    ringSpread: 0.9,
    shardSpread: 1.2,
    cameraY: 0,
    cameraZ: 7.6,
    warmth: 0.85,
    energy: 0.75,
    dim: 0.5,
  },
  contact: {
    coreX: 2.8,
    coreY: 1.8,
    coreZ: -0.4,
    coreScale: 1.15,
    distort: 0.7,
    cageScale: 1.1,
    ringSpread: 0.45,
    shardSpread: 0.75,
    cameraY: 0,
    cameraZ: 6.6,
    warmth: 0,
    energy: 1.5,
    dim: 0.9,
  },
};

/**
 * The single mutable object the scroll timeline writes to and the render loop reads from. Kept
 * outside React on purpose: it changes every frame and must never trigger a re-render.
 */
export const sceneState: SceneState = { ...poses.hero, progress: 0 };

export function resetSceneState(): void {
  Object.assign(sceneState, poses.hero, { progress: 0 });
}
