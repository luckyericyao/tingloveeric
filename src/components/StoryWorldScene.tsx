"use client";

import { useRef, useState } from "react";
import { ContactShadows, Html, RoundedBox, useTexture } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { Butterfly3D } from "@/components/Butterfly3D";
import { CatCompanions } from "@/components/CatSprite3D";
import { storyWorld, type StoryArtifact } from "@/data/storyWorld";

type RenderQuality = "cinematic" | "quiet";
type StoryPlaybackState = "idle" | "transitioning" | "playing" | "settled" | "completed";
type StoryPlaybackDirection = "forward" | "backward";

type SceneProps = {
  activeChapter: number;
  started: boolean;
  panelOpen: boolean;
  quality: RenderQuality;
  reducedMotion: boolean;
  playbackState: StoryPlaybackState;
  playbackDirection: StoryPlaybackDirection;
  onSceneInteraction: () => void;
};

const rose = "#9f5968";
const lavender = "#8277a8";
const gold = "#c7a76d";

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
      targetPosition.current.x += pointer.x * 0.34;
      targetPosition.current.y += pointer.y * 0.16 + Math.sin(state.clock.elapsedTime * 0.22) * 0.045;
    }

    if (reducedMotion) {
      camera.position.copy(targetPosition.current);
      lookAt.current.copy(targetLookAt.current);
    } else {
      const transitionRate = playbackDirection === "backward" ? 3.35 : 2.18;
      const cameraRate = playbackState === "transitioning" ? transitionRate : started ? 1.7 : 0.72;
      const cameraEase = 1 - Math.exp(-delta * cameraRate);
      camera.position.lerp(targetPosition.current, cameraEase);
      lookAt.current.lerp(targetLookAt.current, cameraEase * 1.15);
    }

    camera.lookAt(lookAt.current);
  });

  return null;
}

function CoordinatesArtifact() {
  const texture = useTexture("/images/coordinates/cp-cottage.jpg");

  return (
    <group position={[0, 1.08, 0]} rotation={[0.02, -0.16, -0.035]}>
      <mesh castShadow>
        <boxGeometry args={[0.82, 1.64, 0.08]} />
        <meshStandardMaterial color="#9b8262" metalness={0.62} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0, 0.047]}>
        <planeGeometry args={[0.74, 1.54]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.66, 0.1]}>
        <boxGeometry args={[0.22, 0.035, 0.025]} />
        <meshStandardMaterial color={rose} roughness={0.74} />
      </mesh>
      <pointLight position={[0.25, 0.5, 1]} color="#d5b7c0" intensity={1.5} distance={4.2} />
    </group>
  );
}

function BookArtifact() {
  return (
    <group position={[0, 0.88, 0]} rotation={[-0.2, 0.15, -0.06]}>
      <RoundedBox args={[0.78, 0.11, 0.94]} radius={0.06} smoothness={4} position={[-0.4, 0, 0]} rotation={[0, 0, 0.12]}>
        <meshStandardMaterial color="#d9cdbb" roughness={0.75} />
      </RoundedBox>
      <RoundedBox args={[0.78, 0.11, 0.94]} radius={0.06} smoothness={4} position={[0.4, 0, 0]} rotation={[0, 0, -0.12]}>
        <meshStandardMaterial color="#e7dfd2" roughness={0.75} />
      </RoundedBox>
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[0.08, 0.18, 1]} />
        <meshStandardMaterial color={rose} roughness={0.65} />
      </mesh>
      <pointLight position={[0, 0.6, 0]} color="#e9d6b7" intensity={2.4} distance={3.5} />
    </group>
  );
}

function CatsArtifact() {
  const nono = useTexture("/images/coordinates/nono-nine-grid.jpg");
  const xiaoyi = useTexture("/images/coordinates/xiaoyi-nine-grid.jpg");

  return (
    <group position={[0, 1.02, 0]} rotation={[0.02, -0.1, 0]}>
      <mesh position={[-0.44, 0, 0]}>
        <planeGeometry args={[0.72, 0.92]} />
        <meshBasicMaterial map={nono} toneMapped={false} />
      </mesh>
      <mesh position={[0.44, 0.04, 0.03]} rotation={[0.01, 0.04, 0]}>
        <planeGeometry args={[0.72, 0.92]} />
        <meshBasicMaterial map={xiaoyi} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.53, -0.02]}>
        <boxGeometry args={[1.72, 0.08, 0.16]} />
        <meshStandardMaterial color="#9f5968" roughness={0.74} />
      </mesh>
    </group>
  );
}

function CityArtifact() {
  const heights = [0.58, 1.1, 0.78, 1.38, 0.92, 0.66];
  return (
    <group position={[0, 0.68, 0]}>
      {heights.map((height, index) => (
        <mesh key={height + index} position={[(index - 2.5) * 0.24, height / 2, (index % 2) * 0.12]}>
          <boxGeometry args={[0.17, height, 0.22]} />
          <meshStandardMaterial
            color={index % 2 ? "#1b2034" : "#262440"}
            emissive={index % 2 ? lavender : gold}
            emissiveIntensity={0.28}
            metalness={0.45}
            roughness={0.54}
          />
        </mesh>
      ))}
      <pointLight position={[0, 0.8, 0.5]} color="#b7a6e2" intensity={3.4} distance={4} />
    </group>
  );
}

function LetterArtifact() {
  return (
    <group position={[0, 0.98, 0]} rotation={[-0.08, 0.18, -0.08]}>
      <RoundedBox args={[1.18, 0.78, 0.08]} radius={0.04} smoothness={3}>
        <meshStandardMaterial color="#ded2bf" roughness={0.68} />
      </RoundedBox>
      <mesh position={[0, 0.08, 0.07]} rotation={[0, 0, Math.PI / 4]} scale={[0.7, 0.7, 0.3]}>
        <boxGeometry args={[0.56, 0.56, 0.035]} />
        <meshStandardMaterial color="#c7b9a2" roughness={0.74} />
      </mesh>
      <mesh position={[0, -0.04, 0.115]}>
        <cylinderGeometry args={[0.13, 0.13, 0.035, 32]} />
        <meshStandardMaterial color={rose} emissive={rose} emissiveIntensity={0.25} roughness={0.56} />
      </mesh>
    </group>
  );
}

function Artifact({ artifact }: { artifact: StoryArtifact }) {
  if (artifact === "coordinates") return <CoordinatesArtifact />;
  if (artifact === "book") return <BookArtifact />;
  if (artifact === "cats") return <CatsArtifact />;
  if (artifact === "city") return <CityArtifact />;
  if (artifact === "letter") return <LetterArtifact />;
  return null;
}

function MemoryBeacon({
  chapterIndex,
  active,
  reducedMotion,
  onSceneInteraction,
}: {
  chapterIndex: number;
  active: boolean;
  reducedMotion: boolean;
  onSceneInteraction: () => void;
}) {
  const chapter = storyWorld.chapters[chapterIndex];
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const interactionPulse = useRef(0);

  useFrame((state, delta) => {
    if (!group.current) return;
    interactionPulse.current = Math.max(0, interactionPulse.current - delta * 1.8);
    const targetScale = (active || hovered ? 1.08 : 0.9) + interactionPulse.current * 0.12;
    group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 1 - Math.exp(-delta * 7));
    if (!reducedMotion) {
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8 + chapterIndex) * 0.045;
      group.current.rotation.y += delta * (active ? 0.055 : 0.018);
    }
  });

  const handlePointer = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(event.type === "pointerover");
    document.body.style.cursor = event.type === "pointerover" ? "pointer" : "default";
  };

  return (
    <group
      ref={group}
      position={chapter.position}
      onPointerOver={handlePointer}
      onPointerOut={handlePointer}
      onClick={(event) => {
        event.stopPropagation();
        onSceneInteraction();
        interactionPulse.current = 1;
      }}
    >
      <mesh position={[0, 0.08, -0.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[active ? 0.78 : 0.58, 48]} />
        <meshBasicMaterial color={active ? rose : lavender} transparent opacity={active ? 0.12 : 0.045} />
      </mesh>
      <Artifact artifact={chapter.artifact} />
      {active ? (
        <Html center position={[0, 2.12, 0]} distanceFactor={4.5} transform sprite>
          <div className="story-world-label">
            <span>{chapter.index}</span>
            {chapter.label}
          </div>
        </Html>
      ) : null}
    </group>
  );
}

function WorldParallax({ children, reducedMotion }: { children: React.ReactNode; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.014, 1 - Math.exp(-delta * 2.5));
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.y * 0.008, 1 - Math.exp(-delta * 2.5));
  });

  return <group ref={group}>{children}</group>;
}

function RoomBackdrop({ quiet }: { quiet: boolean }) {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[4, -0.05, -2.7]}>
        <planeGeometry args={[34, 13]} />
        <meshStandardMaterial color="#28202a" roughness={0.98} metalness={0.02} />
      </mesh>
      <mesh position={[4, 4, -9.4]}>
        <planeGeometry args={[34, 12]} />
        <meshStandardMaterial color="#3a2931" roughness={1} metalness={0} />
      </mesh>
      <mesh position={[4.8, 3.8, -9.15]}>
        <planeGeometry args={[7.2, 4.6]} />
        <meshBasicMaterial color="#8e626e" transparent opacity={quiet ? 0.12 : 0.19} />
      </mesh>
      <mesh position={[1.2, 2.1, -9.08]}>
        <boxGeometry args={[0.045, 4.4, 0.08]} />
        <meshStandardMaterial color="#b28a79" roughness={0.72} />
      </mesh>
      <mesh position={[8.4, 2.1, -9.08]}>
        <boxGeometry args={[0.045, 4.4, 0.08]} />
        <meshStandardMaterial color="#b28a79" roughness={0.72} />
      </mesh>
      <mesh position={[4.8, 6.1, -9.08]}>
        <boxGeometry args={[7.2, 0.045, 0.08]} />
        <meshStandardMaterial color="#b28a79" roughness={0.72} />
      </mesh>
      <pointLight position={[4.8, 3.7, -7.6]} color="#c9948e" intensity={quiet ? 0.55 : 0.9} distance={9} />
    </group>
  );
}

export function StoryWorldScene({
  activeChapter,
  started,
  panelOpen,
  quality,
  reducedMotion,
  playbackState,
  playbackDirection,
  onSceneInteraction,
}: SceneProps) {
  const quiet = quality === "quiet";

  return (
    <>
      <color attach="background" args={["#171319"]} />
      <fog attach="fog" args={["#171319", 8, quiet ? 27 : 38]} />
      <CinematicRig
        activeChapter={activeChapter}
        started={started}
        reducedMotion={reducedMotion}
        playbackState={playbackState}
        playbackDirection={playbackDirection}
      />

      <ambientLight intensity={0.58} color="#c4aeb0" />
      <directionalLight
        castShadow={!quiet}
        position={[3, 8, 6]}
        intensity={1.06}
        color="#f5dcc8"
        shadow-mapSize-width={quiet ? 512 : 1024}
        shadow-mapSize-height={quiet ? 512 : 1024}
      />
      <directionalLight position={[-4, 3.2, -6]} intensity={0.34} color="#b5bfd3" />
      <pointLight position={[-5, 4, 1]} color="#d5b7c0" intensity={1.3} distance={15} />
      <pointLight position={[7, 3, 0]} color="#b999a6" intensity={1.15} distance={13} />

      <WorldParallax reducedMotion={reducedMotion}>
        <RoomBackdrop quiet={quiet} />

        {storyWorld.chapters.slice(1).map((chapter, offset) => {
          const chapterIndex = offset + 1;
          return (
            <MemoryBeacon
              key={chapter.id}
              chapterIndex={chapterIndex}
              active={activeChapter === chapterIndex}
              reducedMotion={reducedMotion}
              onSceneInteraction={onSceneInteraction}
            />
          );
        })}

        <Butterfly3D
          activeChapter={activeChapter}
          reducedMotion={reducedMotion}
          quiet={quiet}
          onInteract={onSceneInteraction}
        />
        <CatCompanions
          activeChapter={activeChapter}
          panelOpen={panelOpen}
          reducedMotion={reducedMotion}
          onInteract={onSceneInteraction}
        />
      </WorldParallax>

      <ContactShadows
        position={[4, 0, -2.5]}
        scale={32}
        opacity={quiet ? 0.16 : 0.24}
        blur={quiet ? 2.6 : 2.05}
        far={9}
        resolution={quiet ? 256 : 512}
        color="#020307"
      />

      {!quiet ? (
        <EffectComposer multisampling={2}>
          <Bloom mipmapBlur intensity={0.16} luminanceThreshold={0.94} luminanceSmoothing={0.32} />
          <Vignette eskil={false} offset={0.24} darkness={0.48} />
        </EffectComposer>
      ) : null}
    </>
  );
}

export type { RenderQuality, StoryPlaybackDirection, StoryPlaybackState };
