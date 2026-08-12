"use client";

import { useEffect, useMemo, useRef } from "react";
import { ContactShadows, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
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

const PROJECTION_VISUALS = [
  "night",
  "shanghai",
  "guangzhou",
  "cottage",
  "paris",
  "tokyo",
  "yellowstone",
  "starbase",
  "antarctica",
] as const satisfies readonly StoryVisualId[];
const PROJECTION_ASPECT = 7.6 / 4.65;

useTexture.preload(PROJECTION_VISUALS.map((id) => storyVisuals[id].src));

function CinematicRig({
  activeChapter,
  started,
  reducedMotion,
  playbackState,
  playbackDirection,
}: Pick<SceneProps, "activeChapter" | "started" | "reducedMotion" | "playbackState" | "playbackDirection">) {
  const { camera, pointer } = useThree();
  const lookAt = useRef(new THREE.Vector3(...storyWorld.chapters[0].lookAt));
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const chapter = storyWorld.chapters[activeChapter];
    targetPosition.current.set(...chapter.camera);
    targetLookAt.current.set(...chapter.lookAt);

    if (!reducedMotion && started) {
      targetPosition.current.x += pointer.x * 0.28;
      targetPosition.current.y += pointer.y * 0.12 + Math.sin(state.clock.elapsedTime * 0.2) * 0.035;
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

  useFrame((state, delta) => {
    if (!group.current) return;
    const beat = storyWorld.timeline[activeBeat];
    const chapter = storyWorld.chapters[beat.chapterIndex];
    const activeVisualIndex = PROJECTION_VISUALS.indexOf(beat.visual);
    const beatPulse = reducedMotion ? 1 : 1 + Math.sin(state.clock.elapsedTime * 0.18) * 0.004;

    targetPosition.set(chapter.position[0], compact ? 2.62 : 2.92, chapter.position[2] - (compact ? 2.1 : 2.75));
    targetScale.setScalar((compact ? 0.82 : 1) * beatPulse);

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
      const targetOpacity = index === activeVisualIndex ? (compact ? 0.76 : 0.82) : 0;
      material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 1 - Math.exp(-delta * 7.5));
      material.visible = material.opacity > 0.003;
    });
  });

  return (
    <group ref={group} name="cinematic-memory-projection">
      <mesh position={[0, 0, -0.05]} renderOrder={1}>
        <planeGeometry args={[7.78, 4.83]} />
        <meshBasicMaterial color="#24191f" transparent opacity={0.92} depthWrite={false} />
      </mesh>
      {textures.map((texture, index) => (
        <mesh key={PROJECTION_VISUALS[index]} position={[0, 0, index * 0.003]} renderOrder={2 + index}>
          <planeGeometry args={[7.6, 4.65]} />
          <meshBasicMaterial
            ref={(material) => {
              materialRefs.current[index] = material;
            }}
            map={texture}
            color="#d8c9c5"
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.035]} renderOrder={10}>
        <planeGeometry args={[7.6, 4.65]} />
        <meshBasicMaterial color="#2b1d25" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  );
}

function WorldParallax({ children, reducedMotion }: { children: React.ReactNode; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
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
        activeChapter={activeChapter}
        started={started}
        reducedMotion={reducedMotion}
        playbackState={playbackState}
        playbackDirection={playbackDirection}
      />

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
