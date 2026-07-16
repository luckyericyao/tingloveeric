"use client";

import { useMemo, useRef, useState } from "react";
import { ContactShadows, Html, RoundedBox, useTexture } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { Butterfly3D } from "@/components/Butterfly3D";
import { CatCompanions } from "@/components/CatSprite3D";
import { storyWorld, type StoryArtifact } from "@/data/storyWorld";

type RenderQuality = "cinematic" | "quiet";

type SceneProps = {
  activeChapter: number;
  started: boolean;
  panelOpen: boolean;
  quality: RenderQuality;
  reducedMotion: boolean;
  onSelectChapter: (chapter: number) => void;
  onAdvance: () => void;
};

const ink = "#070a12";
const rose = "#9f5968";
const lavender = "#8277a8";
const gold = "#c7a76d";

function CinematicRig({
  activeChapter,
  started,
  reducedMotion,
}: Pick<SceneProps, "activeChapter" | "started" | "reducedMotion">) {
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
      const cameraEase = 1 - Math.exp(-delta * (started ? 1.55 : 0.72));
      camera.position.lerp(targetPosition.current, cameraEase);
      lookAt.current.lerp(targetLookAt.current, cameraEase * 1.15);
    }

    camera.lookAt(lookAt.current);
  });

  return null;
}

function SparkField({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [new THREE.Color(rose), new THREE.Color(lavender), new THREE.Color(gold)];

    const seeded = (value: number) => {
      const raw = Math.sin(value * 12.9898) * 43758.5453;
      return raw - Math.floor(raw);
    };

    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = -9 + seeded(index + 1) * 27;
      positions[index * 3 + 1] = 0.3 + seeded(index + 83) * 6.8;
      positions[index * 3 + 2] = -9 + seeded(index + 167) * 10;
      const color = palette[index % palette.length];
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    }

    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    buffer.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return buffer;
  }, [count]);

  useFrame((state, delta) => {
    if (!points.current || reducedMotion) return;
    points.current.rotation.y += delta * 0.008;
    points.current.position.y = Math.sin(state.clock.elapsedTime * 0.16) * 0.08;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        vertexColors
        transparent
        opacity={0.58}
        size={0.045}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Flower({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.018, 0.026, 0.68, 8]} />
        <meshStandardMaterial color="#314238" roughness={0.9} />
      </mesh>
      <group position={[0, 0.7, 0]}>
        {Array.from({ length: 6 }, (_, index) => {
          const angle = (index / 6) * Math.PI * 2;
          return (
            <mesh
              key={index}
              position={[Math.cos(angle) * 0.12, Math.sin(angle) * 0.12, 0]}
              rotation={[0.25, 0, angle]}
              scale={[0.8, 1.25, 0.34]}
            >
              <sphereGeometry args={[0.11, 14, 10]} />
              <meshStandardMaterial color={index % 2 ? "#765270" : "#8f5262"} roughness={0.72} />
            </mesh>
          );
        })}
        <mesh position={[0, 0, 0.045]}>
          <sphereGeometry args={[0.075, 14, 10]} />
          <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.16} />
        </mesh>
      </group>
    </group>
  );
}

function NightGarden({ quiet }: { quiet: boolean }) {
  const flowers = useMemo(
    () => [
      [-5.1, 0, -1.8, 1.1],
      [-1.7, 0, -5.1, 0.86],
      [2.5, 0, -1.8, 1.08],
      [4.2, 0, -4.3, 0.8],
      [8.8, 0, -2.1, 1.18],
      [12.1, 0, -4.8, 0.9],
      [0.9, 0, -2.2, 0.7],
      [6.9, 0, -2.4, 0.74],
    ] as Array<[number, number, number, number]>,
    [],
  );

  return (
    <group>
      {flowers.slice(0, quiet ? 4 : flowers.length).map(([x, y, z, scale], index) => (
        <Flower key={`${x}-${z}-${index}`} position={[x, y, z]} scale={scale} />
      ))}
    </group>
  );
}

function MoonGate() {
  return (
    <group position={[-6, 1.55, -2.1]} rotation={[0, 0.08, 0]}>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[1.42, 0.065, 20, 110]} />
        <meshStandardMaterial color="#d7c7aa" emissive={gold} emissiveIntensity={0.5} metalness={0.76} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0, -0.16]}>
        <circleGeometry args={[1.31, 64]} />
        <meshBasicMaterial color="#c5b8dd" transparent opacity={0.055} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color="#c6b8ef" intensity={5.5} distance={8} decay={2} />
    </group>
  );
}

function StoryPath() {
  const geometry = useMemo(() => {
    const points = storyWorld.chapters.map(
      (chapter) => new THREE.Vector3(chapter.position[0], 0.035, chapter.position[2]),
    );
    const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.42);
    return new THREE.TubeGeometry(curve, 120, 0.018, 8, false);
  }, []);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#8b7550" emissive={gold} emissiveIntensity={0.34} metalness={0.72} roughness={0.34} />
    </mesh>
  );
}

function DistantMoon() {
  return (
    <group position={[5.5, 7.2, -18]}>
      <mesh>
        <sphereGeometry args={[3.3, 64, 48]} />
        <meshBasicMaterial color="#ddd8e8" transparent opacity={0.18} />
      </mesh>
      <mesh position={[-0.72, 0.38, 0.24]}>
        <sphereGeometry args={[3.05, 56, 40]} />
        <meshBasicMaterial color={ink} transparent opacity={0.68} />
      </mesh>
      <pointLight color="#a9a0ce" intensity={5.2} distance={32} decay={2} />
    </group>
  );
}

function OrbArtifact() {
  return (
    <group position={[0, 1.1, 0]}>
      <mesh>
        <icosahedronGeometry args={[0.38, 3]} />
        <meshPhysicalMaterial color="#bea7c8" emissive={lavender} emissiveIntensity={1.4} roughness={0.18} metalness={0.2} transmission={0.22} />
      </mesh>
      <pointLight color="#b4a7e8" intensity={4.2} distance={4.5} />
    </group>
  );
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
      <mesh position={[0, -0.66, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.012, 8, 28]} />
        <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.4} />
      </mesh>
      <pointLight position={[0.25, 0.5, 1]} color="#b7a6e2" intensity={3.6} distance={4.2} />
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

function GardenArtifact() {
  return (
    <group position={[0, 0.66, 0]}>
      <Flower position={[0, 0, 0]} scale={1.3} />
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.72, 40, 30, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#b4a5cb" transparent opacity={0.12} roughness={0.12} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.72, 0.8, 0.08, 48]} />
        <meshStandardMaterial color="#7f6856" metalness={0.62} roughness={0.32} />
      </mesh>
    </group>
  );
}

function PhotoArtifact() {
  const texture = useTexture("/images/shanghai-night-walk.jpg");

  return (
    <group position={[0, 1.08, 0]} rotation={[0.02, -0.12, 0]}>
      <mesh>
        <boxGeometry args={[1.72, 1.16, 0.09]} />
        <meshStandardMaterial color="#a88662" metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.056]}>
        <planeGeometry args={[1.52, 0.96]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.5, 1]} color="#d7ad77" intensity={2.8} distance={4} />
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
  if (artifact === "orb") return <OrbArtifact />;
  if (artifact === "book") return <BookArtifact />;
  if (artifact === "garden") return <GardenArtifact />;
  if (artifact === "photo") return <PhotoArtifact />;
  if (artifact === "city") return <CityArtifact />;
  if (artifact === "letter") return <LetterArtifact />;
  return null;
}

function MemoryBeacon({
  chapterIndex,
  active,
  reducedMotion,
  onSelect,
}: {
  chapterIndex: number;
  active: boolean;
  reducedMotion: boolean;
  onSelect: () => void;
}) {
  const chapter = storyWorld.chapters[chapterIndex];
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!group.current) return;
    const targetScale = active || hovered ? 1.08 : 0.9;
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
        onSelect();
      }}
    >
      <mesh position={[0, 0.96, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.92, active ? 0.026 : 0.015, 12, 72]} />
        <meshBasicMaterial color={active ? gold : lavender} transparent opacity={active ? 0.88 : 0.28} />
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

export function StoryWorldScene({
  activeChapter,
  started,
  panelOpen,
  quality,
  reducedMotion,
  onSelectChapter,
  onAdvance,
}: SceneProps) {
  const quiet = quality === "quiet";

  return (
    <>
      <color attach="background" args={[ink]} />
      <fog attach="fog" args={[ink, 7, quiet ? 25 : 33]} />
      <CinematicRig activeChapter={activeChapter} started={started} reducedMotion={reducedMotion} />

      <ambientLight intensity={0.4} color="#8e8790" />
      <directionalLight
        castShadow={!quiet}
        position={[3, 8, 6]}
        intensity={1.28}
        color="#f0ddc4"
        shadow-mapSize-width={quiet ? 512 : 1024}
        shadow-mapSize-height={quiet ? 512 : 1024}
      />
      <directionalLight position={[-4, 3.2, -6]} intensity={0.52} color="#aebbd0" />
      <pointLight position={[-5, 4, 1]} color={lavender} intensity={2.7} distance={15} />
      <pointLight position={[7, 3, 0]} color={rose} intensity={2.25} distance={13} />

      <WorldParallax reducedMotion={reducedMotion}>
        <SparkField count={quiet ? 110 : 360} reducedMotion={reducedMotion} />
        <DistantMoon />
        <MoonGate />
        <StoryPath />
        <NightGarden quiet={quiet} />

        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[4, -0.05, -2.7]}>
          <planeGeometry args={[34, 13]} />
          <meshStandardMaterial color="#0b1018" roughness={0.96} metalness={0.08} />
        </mesh>

        {storyWorld.chapters.slice(1).map((chapter, offset) => {
          const chapterIndex = offset + 1;
          return (
            <MemoryBeacon
              key={chapter.id}
              chapterIndex={chapterIndex}
              active={activeChapter === chapterIndex}
              reducedMotion={reducedMotion}
              onSelect={() => onSelectChapter(chapterIndex)}
            />
          );
        })}

        <Butterfly3D activeChapter={activeChapter} reducedMotion={reducedMotion} quiet={quiet} onAdvance={onAdvance} />
        <CatCompanions activeChapter={activeChapter} panelOpen={panelOpen} reducedMotion={reducedMotion} onAdvance={onAdvance} />
      </WorldParallax>

      <ContactShadows
        position={[4, 0, -2.5]}
        scale={32}
        opacity={quiet ? 0.18 : 0.27}
        blur={quiet ? 2.6 : 2.05}
        far={9}
        resolution={quiet ? 256 : 512}
        color="#020307"
      />

      {!quiet ? (
        <EffectComposer multisampling={2}>
          <Bloom mipmapBlur intensity={0.66} luminanceThreshold={0.88} luminanceSmoothing={0.24} />
          <Vignette eskil={false} offset={0.18} darkness={0.78} />
        </EffectComposer>
      ) : null}
    </>
  );
}

export type { RenderQuality };
