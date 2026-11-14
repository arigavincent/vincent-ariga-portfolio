import { Environment, Lightformer, MeshDistortMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type ComponentRef } from 'react';
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  IcosahedronGeometry,
  MathUtils,
  Object3D,
  type Group,
  type InstancedMesh,
  type PointLight,
  type Points,
  type SpriteMaterial,
} from 'three';

import { colorToken } from '@/lib/tokens';

import type { DeviceTier } from './deviceTier';
import { createDust, createShards } from './layout';
import { sceneState } from './poses';

interface SceneContentsProps {
  tier: Exclude<DeviceTier, 'none'>;
  /** Called once, after the first frames have actually been drawn. */
  onReady: () => void;
}

/** What each tier renders: phones get fewer pieces and a coarser core. */
const budgets = {
  high: { shards: 64, embers: 18, dust: 480, coreDetail: 16 },
  low: { shards: 20, embers: 8, dust: 150, coreDetail: 8 },
} as const;

const rings = [
  { radius: 2.15, tilt: [1.25, 0.15, 0.3], speed: 0.32 },
  { radius: 2.65, tilt: [0.35, 1.1, -0.2], speed: -0.22 },
  { radius: 3.2, tilt: [-0.75, 0.5, 0.9], speed: 0.16 },
] as const;

const { damp, lerp } = MathUtils;

/** Reads the brand palette from the design tokens, so the scene never hardcodes a colour. */
function readPalette() {
  return {
    ink: colorToken('ink-900'),
    metal: colorToken('muted'),
    steel: colorToken('ink-600'),
    orange: colorToken('orange-500'),
    gold: colorToken('gold-400'),
    white: colorToken('white'),
  };
}

/** A soft white disc that fades to nothing: tinted and blended additively, it becomes the core's glow. */
function createGlowTexture(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.55)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.12)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  return new CanvasTexture(canvas);
}

/**
 * The original A&J composition: a dark, liquid-metal core that reflects orange and gold light,
 * wrapped in a glow and a wireframe cage, ringed by orbiting nodes and adrift in a field of
 * crystal shards. Everything is driven from one frame loop that reads the
 * scroll-blended scene state and the pointer position.
 */
export function SceneContents({ tier, onReady }: SceneContentsProps) {
  const budget = budgets[tier];
  const palette = useMemo(() => readPalette(), []);
  const colors = useMemo(
    () => ({
      orange: new Color(palette.orange),
      gold: new Color(palette.gold),
      glow: new Color(palette.orange),
    }),
    [palette],
  );
  const shards = useMemo(() => createShards(budget.shards, 7), [budget.shards]);
  const embers = useMemo(() => createShards(budget.embers, 23), [budget.embers]);
  const dust = useMemo(() => createDust(budget.dust, 41), [budget.dust]);
  const cageGeometry = useMemo(() => new IcosahedronGeometry(1.55, 1), []);
  const glowTexture = useMemo(() => createGlowTexture(), []);
  const scratch = useMemo(() => new Object3D(), []);

  const core = useRef<Group>(null);
  const cage = useRef<Group>(null);
  const ringGroup = useRef<Group>(null);
  const field = useRef<Group>(null);
  const shardMesh = useRef<InstancedMesh>(null);
  const emberMesh = useRef<InstancedMesh>(null);
  const dustPoints = useRef<Points>(null);
  const glowLight = useRef<PointLight>(null);
  const halo = useRef<SpriteMaterial>(null);
  const coreMaterial = useRef<ComponentRef<typeof MeshDistortMaterial>>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const frames = useRef(0);
  const appliedDim = useRef(-1);

  useEffect(() => {
    function handleMove(event: PointerEvent) {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    }
    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handleMove);
    };
  }, []);

  useEffect(
    () => () => {
      cageGeometry.dispose();
      glowTexture.dispose();
    },
    [cageGeometry, glowTexture],
  );

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const scene = sceneState;
    const { x: pointerX, y: pointerY } = pointer.current;
    // On portrait screens the core sits above the text instead of beside it.
    const portrait = state.size.width < state.size.height;

    const camera = state.camera;
    camera.position.x = damp(camera.position.x, pointerX * 0.45, 2.5, delta);
    camera.position.y = damp(camera.position.y, scene.cameraY + pointerY * 0.3, 2.5, delta);
    camera.position.z = damp(camera.position.z, scene.cameraZ * (portrait ? 1.3 : 1), 4, delta);
    camera.lookAt(0, scene.cameraY * 0.4, 0);

    colors.glow.copy(colors.orange).lerp(colors.gold, scene.warmth);
    const pulse = 1 + Math.sin(time * 1.6) * 0.08;

    if (core.current) {
      const targetX = portrait ? scene.coreX * 0.18 : scene.coreX;
      const targetY = portrait ? scene.coreY * 0.5 + 1.25 : scene.coreY;
      const scale = scene.coreScale * (portrait ? 0.7 : 1);
      core.current.position.set(
        damp(core.current.position.x, targetX, 5, delta),
        damp(core.current.position.y, targetY + Math.sin(time * 0.6) * 0.08, 5, delta),
        damp(core.current.position.z, scene.coreZ, 5, delta),
      );
      core.current.scale.setScalar(damp(core.current.scale.x, scale, 5, delta));
      core.current.rotation.y = time * 0.14 + scene.progress * Math.PI * 3 + pointerX * 0.35;
      core.current.rotation.x = Math.sin(time * 0.21) * 0.12 - pointerY * 0.25;
    }

    if (coreMaterial.current) {
      coreMaterial.current.distort = damp(coreMaterial.current.distort, scene.distort, 4, delta);
      coreMaterial.current.emissive.copy(colors.glow);
      coreMaterial.current.emissiveIntensity = 0.05 * scene.energy * pulse;
    }

    if (halo.current) {
      halo.current.color.copy(colors.glow);
      halo.current.opacity = Math.min(1, 0.5 * scene.energy * pulse);
    }

    if (cage.current) {
      cage.current.scale.setScalar(damp(cage.current.scale.x, scene.cageScale, 4, delta));
      cage.current.rotation.y = -time * 0.09 - scene.progress * Math.PI * 1.5;
      cage.current.rotation.z = time * 0.05;
    }

    if (ringGroup.current) {
      const spread = lerp(0.72, 1.3, scene.ringSpread);
      ringGroup.current.scale.setScalar(damp(ringGroup.current.scale.x, spread, 4, delta));
      ringGroup.current.children.forEach((ring, index) => {
        const config = rings[index];
        if (config) {
          ring.rotation.x = config.tilt[0] * lerp(0.35, 1, scene.ringSpread);
          ring.rotation.z = config.tilt[2] + time * config.speed;
        }
      });
    }

    if (glowLight.current) {
      glowLight.current.color.copy(colors.glow);
      glowLight.current.intensity = 26 * scene.energy * pulse;
    }

    if (field.current) {
      field.current.rotation.y = time * 0.02 + scene.progress * Math.PI * 0.9;
      field.current.rotation.x = pointerY * 0.05;
    }

    for (const [mesh, pieces] of [
      [shardMesh.current, shards],
      [emberMesh.current, embers],
    ] as const) {
      if (!mesh) {
        continue;
      }
      pieces.forEach((piece, index) => {
        scratch.position.set(
          piece.position[0] * scene.shardSpread,
          piece.position[1] * scene.shardSpread + Math.sin(time * 0.5 + piece.phase) * 0.18,
          piece.position[2] * scene.shardSpread,
        );
        scratch.rotation.set(
          piece.rotation[0] + time * piece.spin[0],
          piece.rotation[1] + time * piece.spin[1],
          piece.rotation[2] + time * piece.spin[2],
        );
        scratch.scale.set(piece.scale, piece.scale * piece.stretch, piece.scale);
        scratch.updateMatrix();
        mesh.setMatrixAt(index, scratch.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }

    if (dustPoints.current) {
      dustPoints.current.rotation.y = time * 0.012 + scene.progress * 1.4;
    }

    // Fade the whole layer behind text-heavy sections. Written straight to the canvas element:
    // it changes continuously while scrolling and must not go through React.
    if (Math.abs(scene.dim - appliedDim.current) > 0.004) {
      appliedDim.current = scene.dim;
      state.gl.domElement.style.opacity = scene.dim.toFixed(3);
    }

    frames.current += 1;
    if (frames.current === 3) {
      onReady();
    }
  });

  return (
    <>
      <color attach="background" args={[palette.ink]} />
      <fog attach="fog" args={[palette.ink, 9, 24]} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 6]} intensity={1.4} color={palette.white} />
      <pointLight position={[-6, -3, -4]} intensity={40} color={palette.gold} />

      {/* Procedural studio lighting for reflections: nothing is downloaded. */}
      <Environment resolution={64} frames={1}>
        <Lightformer
          form="rect"
          intensity={5}
          color={palette.orange}
          position={[5, 2, 3]}
          scale={[4, 7, 1]}
        />
        <Lightformer
          form="rect"
          intensity={3}
          color={palette.gold}
          position={[-6, -1, -3]}
          scale={[6, 3, 1]}
        />
        <Lightformer
          form="ring"
          intensity={2}
          color={palette.white}
          position={[0, 6, 1]}
          scale={3}
        />
      </Environment>

      <group ref={core}>
        <sprite scale={6.4} renderOrder={-1}>
          <spriteMaterial
            ref={halo}
            map={glowTexture}
            color={palette.orange}
            blending={AdditiveBlending}
            transparent
            opacity={0.5}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
        <mesh>
          <icosahedronGeometry args={[1, budget.coreDetail]} />
          <MeshDistortMaterial
            ref={coreMaterial}
            color={palette.metal}
            emissive={palette.orange}
            emissiveIntensity={0.05}
            roughness={0.2}
            metalness={1}
            envMapIntensity={1.5}
            distort={sceneState.distort}
            speed={1.5}
          />
        </mesh>
        <pointLight ref={glowLight} intensity={26} distance={14} color={palette.orange} />

        <group ref={cage}>
          <lineSegments>
            <edgesGeometry args={[cageGeometry]} />
            <lineBasicMaterial color={palette.gold} transparent opacity={0.55} />
          </lineSegments>
        </group>

        <group ref={ringGroup}>
          {rings.map((ring) => (
            <group key={ring.radius} rotation={[ring.tilt[0], ring.tilt[1], ring.tilt[2]]}>
              <mesh>
                <torusGeometry args={[ring.radius, 0.006, 8, 180]} />
                <meshBasicMaterial color={palette.gold} transparent opacity={0.5} />
              </mesh>
              <mesh position={[ring.radius, 0, 0]}>
                <sphereGeometry args={[0.055, 16, 16]} />
                <meshBasicMaterial color={palette.orange} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      <group ref={field}>
        <instancedMesh
          ref={shardMesh}
          args={[undefined, undefined, shards.length]}
          frustumCulled={false}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={palette.steel}
            metalness={0.9}
            roughness={0.22}
            envMapIntensity={2.6}
            flatShading
          />
        </instancedMesh>
        <instancedMesh
          ref={emberMesh}
          args={[undefined, undefined, embers.length]}
          frustumCulled={false}
        >
          <tetrahedronGeometry args={[0.35, 0]} />
          <meshBasicMaterial color={palette.orange} toneMapped={false} />
        </instancedMesh>
      </group>

      <points ref={dustPoints}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={palette.gold}
          size={0.028}
          sizeAttenuation
          transparent
          opacity={0.65}
          depthWrite={false}
        />
      </points>
    </>
  );
}
