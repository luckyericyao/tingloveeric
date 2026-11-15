"use client";

import { useEffect, useMemo, useRef } from "react";
import { ContactShadows, Line, useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useFilmFrame } from "./FilmPlayback";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { Butterfly3D } from "@/components/Butterfly3D";
import { CatCompanions } from "@/components/CatSprite3D";
import { storyVisuals, storyWorld, type StoryVisualId } from "@/data/storyWorld";

type RenderQuality = "cinematic" | "quiet";
type StoryPlaybackState = "idle" | "transitioning" | "playing" | "settled" | "completed";
type StoryPlaybackDirection = "forward" | "backward";

type SceneProps = {
  activeBeat: number;
  activeChapter: number;
  started: boolean;
  panelOpen: boolean;
  quality: RenderQuality;
  reducedMotion: boolean;
  playbackState: StoryPlaybackState;
  playbackDirection: StoryPlaybackDirection;
  onCatInteraction: () => void;
};

const PROJECTION_VISUALS: readonly StoryVisualId[] = [
  "shanghai",
  "guangzhou",
  "paris",
  "yellowstone",
] as const;
const PROJECTION_ASPECT = 7.6 / 4.65;

useTexture.preload(PROJECTION_VISUALS.map((id) => storyVisuals[id].src));

function CinematicRig({
  activeBeat,
  activeChapter,
  started,
  reducedMotion,
  playbackState,
  playbackDirection,
}: Pick<SceneProps, "activeBeat" | "activeChapter" | "started" | "reducedMotion" | "playbackState" | "playbackDirection">) {
  const { camera, pointer } = useThree();
  const lookAt = useRef(new THREE.Vector3(...storyWorld.chapters[0].lookAt));
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useFilmFrame((state, delta, elapsed) => {
    const chapter = storyWorld.chapters[activeChapter];
    targetPosition.current.set(...chapter.camera);
    targetLookAt.current.set(...chapter.lookAt);

    if (activeBeat === 0 && !reducedMotion) {
      const arrival = THREE.MathUtils.smoothstep(Math.min(elapsed / 8, 1), 0, 1);
      targetPosition.current.y += (1 - arrival) * 0.18;
      targetPosition.current.z += (1 - arrival) * 1.15;
    }

    if (!reducedMotion && started) {
      targetPosition.current.x += pointer.x * 0.28;
      targetPosition.current.y += pointer.y * 0.12 + Math.sin(elapsed * 0.2) * 0.035;
    }

    if (reducedMotion) {
      camera.position.copy(targetPosition.current);
      lookAt.current.copy(targetLookAt.current);
    } else {
      const transitionRate = playbackDirection === "backward" ? 4.1 : 3.55;
      const cameraRate = playbackState === "transitioning" ? transitionRate : started ? 2.2 : 0.9;
      const cameraEase = 1 - Math.exp(-delta * cameraRate);
      camera.position.lerp(targetPosition.current, cameraEase);
      lookAt.current.lerp(targetLookAt.current, cameraEase * 1.18);
    }

    camera.lookAt(lookAt.current);
  });

  return null;
}

function FirstMeetingLight({ activeBeat, reducedMotion }: Pick<SceneProps, "activeBeat" | "reducedMotion">) {
  const light = useRef<THREE.PointLight>(null);
  useFilmFrame((_, delta, elapsed) => {
    if (!light.current) return;
    const decay = Math.max(0, 1 - elapsed / 14);
    const pulse = reducedMotion ? 0 : Math.pow(Math.max(0, Math.sin(elapsed * 2.25)), 8) * 0.2 * decay;
    const target = activeBeat === 0 ? 0.72 + pulse : 0;
    light.current.intensity = THREE.MathUtils.lerp(light.current.intensity, target, 1 - Math.exp(-delta * 3.8));
  });
  return <pointLight ref={light} position={[-5.4, 2.2, -0.6]} color="#e8a4aa" intensity={0} distance={8.5} decay={2} />;
}

function prepareProjectionTexture(texture: THREE.Texture, visualId: StoryVisualId) {
  const nextTexture = texture.clone();
  const image = texture.image as { width?: number; height?: number } | undefined;
  const imageWidth = image?.width || 1;
  const imageHeight = image?.height || 1;
  const imageAspect = imageWidth / imageHeight;
  const [focalX, focalY] = storyVisuals[visualId].focalPoint;

  nextTexture.colorSpace = THREE.SRGBColorSpace;
  nextTexture.wrapS = THREE.ClampToEdgeWrapping;
  nextTexture.wrapT = THREE.ClampToEdgeWrapping;

  if (imageAspect > PROJECTION_ASPECT) {
    const visibleWidth = PROJECTION_ASPECT / imageAspect;
    nextTexture.repeat.set(visibleWidth, 1);
    nextTexture.offset.set((1 - visibleWidth) * focalX, 0);
  } else {
    const visibleHeight = imageAspect / PROJECTION_ASPECT;
    nextTexture.repeat.set(1, visibleHeight);
    nextTexture.offset.set(0, (1 - visibleHeight) * (1 - focalY));
  }

  nextTexture.needsUpdate = true;
  return nextTexture;
}

function FilmProjection({ activeBeat, reducedMotion }: Pick<SceneProps, "activeBeat" | "reducedMotion">) {
  const group = useRef<THREE.Group>(null);
  const materialRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const loadedTextures = useTexture(PROJECTION_VISUALS.map((id) => storyVisuals[id].src));
  const textures = useMemo(
    () => loadedTextures.map((texture, index) => prepareProjectionTexture(texture, PROJECTION_VISUALS[index])),
    [loadedTextures],
  );
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const targetScale = useMemo(() => new THREE.Vector3(), []);
  const groupInitialized = useRef(false);
  const { camera, size } = useThree();
  const compact = size.width < 680;

  useEffect(
    () => () => textures.forEach((texture) => texture.dispose()),
    [textures],
  );

  useFilmFrame((state, delta, elapsed) => {
    if (!group.current) return;
    const beat = storyWorld.timeline[activeBeat];
    const chapter = storyWorld.chapters[beat.chapterIndex];
    const activeVisualIndex = PROJECTION_VISUALS.indexOf(beat.visual);
    const beatPulse = reducedMotion ? 1 : 1 + Math.sin(elapsed * 0.18) * 0.004;

    targetPosition.set(chapter.position[0], compact ? 2.62 : 1.2, chapter.position[2] - (compact ? 2.1 : 2.75));
    targetScale.setScalar((compact ? 1.5 : 2.3) * beatPulse);

    if (!groupInitialized.current) {
      group.current.position.copy(targetPosition);
      group.current.scale.copy(targetScale);
      groupInitialized.current = true;
    } else {
      group.current.position.lerp(targetPosition, 1 - Math.exp(-delta * 4.4));
      group.current.scale.lerp(targetScale, 1 - Math.exp(-delta * 3.8));
    }

    const targetYaw = Math.atan2(camera.position.x - group.current.position.x, camera.position.z - group.current.position.z);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetYaw, 1 - Math.exp(-delta * 4.6));

    materialRefs.current.forEach((material, index) => {
      if (!material) return;
      const targetOpacity = index === activeVisualIndex ? 0.94 : 0;
      material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 1 - Math.exp(-delta * 7.5));
      material.visible = material.opacity > 0.003;
    });
  });

  return (
    <group ref={group} name="cinematic-memory-projection">
      {textures.map((texture, index) => (
        <mesh key={PROJECTION_VISUALS[index]} position={[0, 0, index * 0.003]} renderOrder={2 + index}>
          <planeGeometry args={[7.6, 4.65]} />
          <meshBasicMaterial
            ref={(material) => {
              materialRefs.current[index] = material;
            }}
            map={texture}
            color="#ffffff"
            transparent
            opacity={0}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function JourneyTrace({ activeBeat, reducedMotion }: Pick<SceneProps, "activeBeat" | "reducedMotion">) {
  const group = useRef<THREE.Group>(null);
  const opacity = useRef(0);
  const { camera, size } = useThree();
  const compact = size.width < 680;
  const points = useMemo(
    () => new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-1.9, -0.25, 0),
      new THREE.Vector3(0, 0.82, 0),
      new THREE.Vector3(1.9, -0.25, 0),
    ).getPoints(42),
    [],
  );

  useFilmFrame((_, delta) => {
    if (!group.current) return;
    const targetOpacity = activeBeat === 2 ? 0.68 : 0;
    opacity.current = reducedMotion
      ? targetOpacity
      : THREE.MathUtils.lerp(opacity.current, targetOpacity, 1 - Math.exp(-delta * 2.6));
    group.current.visible = opacity.current > 0.004;
    group.current.scale.setScalar(compact ? 0.72 : 1);
    group.current.rotation.y = Math.atan2(
      camera.position.x - group.current.position.x,
      camera.position.z - group.current.position.z,
    );
    group.current.traverse((object) => {
      if (!(object instanceof THREE.Mesh || object instanceof THREE.Line)) return;
      const material = object.material as THREE.Material & { opacity?: number };
      if ("opacity" in material) material.opacity = opacity.current;
    });
  });

  return (
    <group ref={group} position={[0, compact ? 3.65 : 3.25, -6.55]} visible={false} renderOrder={1}>
      <Line points={points} color="#c998a1" lineWidth={compact ? 0.8 : 1.15} transparent opacity={0} depthTest={false} />
      {[-1.9, 1.9].map((x) => (
        <mesh key={x} position={[x, -0.25, 0.01]}>
          <circleGeometry args={[compact ? 0.045 : 0.055, 24]} />
          <meshBasicMaterial color="#e6c8bf" transparent opacity={0} depthTest={false} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function WorldParallax({ children, reducedMotion }: { children: React.ReactNode; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFilmFrame((_, delta) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.01, 1 - Math.exp(-delta * 2.5));
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.y * 0.006, 1 - Math.exp(-delta * 2.5));
  });

  return <group ref={group}>{children}</group>;
}

function RoomBackdrop({ quiet }: { quiet: boolean }) {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[4, -0.05, -2.7]}>
        <planeGeometry args={[34, 13]} />
        <meshStandardMaterial color="#35242d" roughness={0.98} metalness={0.02} />
      </mesh>
      <mesh position={[4, 4, -9.4]}>
        <planeGeometry args={[34, 12]} />
        <meshStandardMaterial color="#432f39" roughness={1} metalness={0} />
      </mesh>
      <pointLight position={[4.8, 3.7, -7.6]} color="#d49ca2" intensity={quiet ? 0.32 : 0.48} distance={9} />
    </group>
  );
}

export function StoryWorldScene({
  activeBeat,
  activeChapter,
  started,
  panelOpen,
  quality,
  reducedMotion,
  playbackState,
  playbackDirection,
  onCatInteraction,
}: SceneProps) {
  const quiet = quality === "quiet";

  return (
    <>
      <color attach="background" args={["#271b22"]} />
      <fog attach="fog" args={["#271b22", 10, quiet ? 26 : 36]} />
      <CinematicRig
        activeBeat={activeBeat}
        activeChapter={activeChapter}
        started={started}
        reducedMotion={reducedMotion}
        playbackState={playbackState}
        playbackDirection={playbackDirection}
      />
      <FirstMeetingLight activeBeat={activeBeat} reducedMotion={reducedMotion} />

      <ambientLight intensity={0.66} color="#ddbbb8" />
      <directionalLight
        castShadow={!quiet}
        position={[3, 8, 6]}
        intensity={0.96}
        color="#f4d4c2"
        shadow-mapSize-width={quiet ? 512 : 1024}
        shadow-mapSize-height={quiet ? 512 : 1024}
      />
      <directionalLight position={[-4, 3.2, -6]} intensity={0.18} color="#c6c5db" />
      <pointLight position={[-5, 4, 1]} color="#d698a5" intensity={0.62} distance={15} />
      <pointLight position={[7, 3, 0]} color="#b895aa" intensity={0.54} distance={13} />

      <WorldParallax reducedMotion={reducedMotion}>
        <RoomBackdrop quiet={quiet} />
        <FilmProjection activeBeat={activeBeat} reducedMotion={reducedMotion} />
        <JourneyTrace activeBeat={activeBeat} reducedMotion={reducedMotion} />
        <Butterfly3D activeChapter={activeChapter} reducedMotion={reducedMotion} quiet={quiet} />
      </WorldParallax>
      <CatCompanions
        activeChapter={activeChapter}
        panelOpen={panelOpen}
        reducedMotion={reducedMotion}
        onInteract={onCatInteraction}
      />

      <ContactShadows
        position={[4, 0, -2.5]}
        scale={32}
        opacity={quiet ? 0.22 : 0.38}
        blur={quiet ? 2.8 : 2.35}
        far={9}
        resolution={quiet ? 256 : 512}
        color="#160e14"
      />

      {!quiet ? (
        <EffectComposer multisampling={2}>
          <Bloom mipmapBlur intensity={0.035} luminanceThreshold={0.99} luminanceSmoothing={0.32} />
          <Vignette eskil={false} offset={0.24} darkness={0.3} />
        </EffectComposer>
      ) : null}
    </>
  );
}

export type { RenderQuality, StoryPlaybackDirection, StoryPlaybackState };
