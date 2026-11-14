import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useState } from 'react';

import type { DeviceTier } from './deviceTier';
import { poses } from './poses';
import { SceneContents } from './SceneContents';

export interface SceneCanvasProps {
  tier: Exclude<DeviceTier, 'none'>;
  onReady: () => void;
}

/**
 * The WebGL canvas. Loaded lazily so Three.js stays out of the first bundle. Capable devices get
 * antialiasing, a higher pixel ratio, bloom and a vignette; if the frame rate drops, the
 * performance monitor switches those off and the scene keeps running.
 */
export default function SceneCanvas({ tier, onReady }: SceneCanvasProps) {
  const [degraded, setDegraded] = useState(false);
  const full = tier === 'high' && !degraded;

  return (
    <Canvas
      dpr={[1, full ? 1.5 : 1.25]}
      gl={{ antialias: tier === 'high', powerPreference: 'high-performance' }}
      camera={{
        fov: 38,
        near: 0.1,
        far: 60,
        position: [0, poses.hero.cameraY, poses.hero.cameraZ],
      }}
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <PerformanceMonitor
        flipflops={2}
        onDecline={() => {
          setDegraded(true);
        }}
      />
      <SceneContents tier={tier} onReady={onReady} />
      {full ? (
        <EffectComposer multisampling={0}>
          <Bloom
            mipmapBlur
            intensity={0.95}
            luminanceThreshold={0.82}
            luminanceSmoothing={0.25}
            radius={0.78}
          />
          <Vignette offset={0.25} darkness={0.7} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      ) : null}
    </Canvas>
  );
}
