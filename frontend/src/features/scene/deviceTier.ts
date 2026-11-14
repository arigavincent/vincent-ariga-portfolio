/**
 * How much 3D a device gets:
 * - none: no WebGL scene at all (reduced motion requested, or WebGL unavailable)
 * - low: the simplified scene (phones, tablets, modest hardware)
 * - high: the full scene with post-processing
 */
export type DeviceTier = 'none' | 'low' | 'high';

export interface DeviceTraits {
  reducedMotion: boolean;
  webgl: boolean;
  coarsePointer: boolean;
  /** Logical CPU cores, when the browser reports them. */
  cores: number | undefined;
  /** Device memory in GB, when the browser reports it. */
  memory: number | undefined;
  viewportWidth: number;
}

const LOW_END_CORES = 4;
const LOW_END_MEMORY_GB = 4;
const SMALL_VIEWPORT = 768;

export function classifyDevice(traits: DeviceTraits): DeviceTier {
  if (traits.reducedMotion || !traits.webgl) {
    return 'none';
  }
  const modestHardware =
    (traits.cores !== undefined && traits.cores <= LOW_END_CORES) ||
    (traits.memory !== undefined && traits.memory <= LOW_END_MEMORY_GB);
  if (traits.coarsePointer || traits.viewportWidth < SMALL_VIEWPORT || modestHardware) {
    return 'low';
  }
  return 'high';
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Reads the current device's traits from the browser. */
export function readDeviceTraits(reducedMotion: boolean): DeviceTraits {
  const hints = navigator as Navigator & { deviceMemory?: number };
  return {
    reducedMotion,
    webgl: supportsWebGL(),
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    cores: navigator.hardwareConcurrency,
    memory: hints.deviceMemory,
    viewportWidth: window.innerWidth,
  };
}
