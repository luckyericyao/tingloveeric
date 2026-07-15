"use client";

import { useMemo, useRef, useState } from "react";
import { ContactShadows, Edges, Html, RoundedBox, useTexture } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { storyWorld, type StoryArtifact } from "@/data/storyWorld";

type RenderQuality = "cinematic" | "quiet";

type SceneProps = {
  activeChapter: number;
  started: boolean;
  quality: RenderQuality;
  reducedMotion: boolean;
  onSelectChapter: (chapter: number) => void;
  onAdvance: () => void;
};

const ink = "#070a12";
const moon = "#f5eee2";
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

function ButterflyGuide({
  activeChapter,
  reducedMotion,
  onAdvance,
}: Pick<SceneProps, "activeChapter" | "reducedMotion" | "onAdvance">) {
  const group = useRef<THREE.Group>(null);
  const leftWing = useRef<THREE.Group>(null);
  const rightWing = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const target = useMemo(() => new THREE.Vector3(), []);
  const upperWingGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.24, 0.72, 0.9, 0.88, 1.02, 0.24);
    shape.bezierCurveTo(1.08, -0.18, 0.44, -0.3, 0, 0);
    return new THREE.ShapeGeometry(shape, 36);
  }, []);
  const lowerWingGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0.02, -0.02);
    shape.bezierCurveTo(0.4, -0.08, 0.76, -0.42, 0.58, -0.86);
    shape.bezierCurveTo(0.38, -1.08, 0.08, -0.5, 0.02, -0.02);
    return new THREE.ShapeGeometry(shape, 30);
  }, []);

  useFrame((state, delta) => {
    if (!group.current || !leftWing.current || !rightWing.current) return;
    const chapter = storyWorld.chapters[activeChapter];
    target.set(chapter.position[0] - 1.05, 2.05, chapter.position[2] + 0.55);
    group.current.position.lerp(target, 1 - Math.exp(-delta * 2.4));
    if (!reducedMotion) {
      group.current.position.y += Math.sin(state.clock.elapsedTime * 1.7) * 0.004;
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.38) * 0.42;
      const flap = Math.sin(state.clock.elapsedTime * 8.5) * 0.72;
      leftWing.current.rotation.y = flap;
      rightWing.current.rotation.y = -flap;
    }
  });

  return (
    <group
      ref={group}
      scale={hovered ? 1.18 : 1}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "default";
      }}
      onClick={(event) => {
        event.stopPropagation();
        onAdvance();
      }}
    >
      <group ref={leftWing} rotation={[0.12, 0, -0.08]}>
        <mesh geometry={upperWingGeometry}>
          <meshPhysicalMaterial color="#a996c8" emissive={lavender} emissiveIntensity={0.32} transparent opacity={0.74} side={THREE.DoubleSide} roughness={0.28} metalness={0.16} />
          <Edges threshold={18} color="#d6c7e9" />
        </mesh>
        <mesh geometry={lowerWingGeometry}>
          <meshPhysicalMaterial color="#9c607b" emissive={rose} emissiveIntensity={0.26} transparent opacity={0.76} side={THREE.DoubleSide} roughness={0.32} metalness={0.12} />
          <Edges threshold={18} color="#c791a2" />
        </mesh>
        <mesh position={[0.42, 0.16, 0.012]} rotation={[0, 0, -1.12]}>
          <cylinderGeometry args={[0.008, 0.008, 0.7, 6]} />
          <meshBasicMaterial color="#d8c9e4" transparent opacity={0.46} />
        </mesh>
        <mesh position={[0.26, -0.31, 0.012]} rotation={[0, 0, -0.58]}>
          <cylinderGeometry args={[0.007, 0.007, 0.58, 6]} />
          <meshBasicMaterial color="#c8a4b1" transparent opacity={0.42} />
        </mesh>
      </group>
      <group ref={rightWing} scale={[-1, 1, 1]} rotation={[0.12, 0, 0.08]}>
        <mesh geometry={upperWingGeometry}>
          <meshPhysicalMaterial color="#a996c8" emissive={lavender} emissiveIntensity={0.32} transparent opacity={0.74} side={THREE.DoubleSide} roughness={0.28} metalness={0.16} />
          <Edges threshold={18} color="#d6c7e9" />
        </mesh>
        <mesh geometry={lowerWingGeometry}>
          <meshPhysicalMaterial color="#9c607b" emissive={rose} emissiveIntensity={0.26} transparent opacity={0.76} side={THREE.DoubleSide} roughness={0.32} metalness={0.12} />
          <Edges threshold={18} color="#c791a2" />
        </mesh>
        <mesh position={[0.42, 0.16, 0.012]} rotation={[0, 0, -1.12]}>
          <cylinderGeometry args={[0.008, 0.008, 0.7, 6]} />
          <meshBasicMaterial color="#d8c9e4" transparent opacity={0.46} />
        </mesh>
        <mesh position={[0.26, -0.31, 0.012]} rotation={[0, 0, -0.58]}>
          <cylinderGeometry args={[0.007, 0.007, 0.58, 6]} />
          <meshBasicMaterial color="#c8a4b1" transparent opacity={0.42} />
        </mesh>
      </group>
      <mesh position={[0, -0.09, 0.025]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.035, 0.3, 5, 10]} />
        <meshStandardMaterial color="#1b1520" metalness={0.45} roughness={0.36} />
      </mesh>
      <pointLight color="#ab91d4" intensity={hovered ? 4.5 : 2.2} distance={2.4} />
    </group>
  );
}

type CompanionCatVariant = "nono" | "xiaoyi";

function CompanionCat({
  variant,
  position,
  side,
  reducedMotion,
  onAdvance,
}: {
  variant: CompanionCatVariant;
  position: [number, number, number];
  side: -1 | 1;
  reducedMotion: boolean;
  onAdvance: () => void;
}) {
  const animated = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const isNono = variant === "nono";
  const colors = isNono
    ? {
        coat: "#f6f0e6",
        chest: "#fffaf1",
        point: "#554b4c",
        pointSoft: "#6d6261",
        iris: "#91a6b2",
      }
    : {
        coat: "#f5f1e9",
        chest: "#fffdf7",
        point: "#b8b5ae",
        pointSoft: "#d9d6cf",
        iris: "#7e9489",
      };
  const tailCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.38, 0.58, -0.08),
        new THREE.Vector3(side * 0.7, 0.7, -0.1),
        new THREE.Vector3(side * 0.82, 1.04, 0.02),
        new THREE.Vector3(side * 0.63, 1.28, 0.16),
      ]),
    [side],
  );
  const tailGeometry = useMemo(
    () => new THREE.TubeGeometry(tailCurve, 34, isNono ? 0.075 : 0.09, 10, false),
    [isNono, tailCurve],
  );

  useFrame((state) => {
    if (!animated.current || reducedMotion) return;
    const phase = isNono ? 0 : 0.85;
    animated.current.position.y = Math.sin(state.clock.elapsedTime * 1.6 + phase) * 0.012;
    animated.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.72 + phase) * 0.012;
    if (tail.current) tail.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.45 + phase) * 0.1;
  });

  const coat = hovered ? "#fffaf0" : colors.coat;

  return (
    <group
      name={isNono ? "Nono-left-companion" : "Xiaoyi-right-companion"}
      userData={{ companion: variant, referenceSide: side === -1 ? "left" : "right" }}
      position={position}
      scale={isNono ? 0.59 : 0.57}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "default";
      }}
      onClick={(event) => {
        event.stopPropagation();
        onAdvance();
      }}
    >
      <group ref={animated}>
        <mesh castShadow position={[0, 0.72, 0]} scale={[0.72, 0.9, 0.86]}>
          <sphereGeometry args={[0.58, 36, 28]} />
          <meshStandardMaterial color={coat} roughness={0.94} metalness={0.01} />
        </mesh>
        <mesh castShadow position={[0, 1.06, 0.18]} scale={[0.72, 0.62, 0.58]}>
          <sphereGeometry args={[0.5, 32, 24]} />
          <meshStandardMaterial color={colors.chest} roughness={0.97} />
        </mesh>
        <mesh castShadow position={[0, 1.52, 0.06]} scale={isNono ? [1, 0.88, 0.9] : [1.04, 0.92, 0.92]}>
          <sphereGeometry args={[0.46, 36, 28]} />
          <meshStandardMaterial color={coat} roughness={0.92} />
        </mesh>
        {[-1, 1].map((cheekSide) => (
          <mesh key={`cheek-${cheekSide}`} castShadow position={[cheekSide * 0.31, 1.46, 0.16]} scale={[1.15, 0.9, 0.72]}>
            <sphereGeometry args={[0.22, 24, 18]} />
            <meshStandardMaterial color={coat} roughness={0.96} />
          </mesh>
        ))}

        {[-1, 1].map((earSide) => (
          <group key={`ear-${earSide}`} position={[earSide * 0.27, 1.91, 0.035]} rotation={[0, 0, earSide * 0.16]}>
            <mesh castShadow>
              <coneGeometry args={[0.205, 0.46, 4]} />
              <meshStandardMaterial color={isNono ? colors.point : colors.pointSoft} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.015, 0.035]} scale={[0.58, 0.72, 0.58]}>
              <coneGeometry args={[0.17, 0.39, 4]} />
              <meshStandardMaterial color="#cfaeb0" roughness={0.94} />
            </mesh>
          </group>
        ))}

        {isNono ? (
          <>
            {[-1, 1].map((maskSide) => (
              <mesh
                key={`mask-${maskSide}`}
                position={[maskSide * 0.185, 1.58, 0.38]}
                rotation={[0, maskSide * 0.09, maskSide * -0.16]}
                scale={[1.5, 1.55, 0.34]}
              >
                <sphereGeometry args={[0.18, 28, 20]} />
                <meshStandardMaterial color={colors.pointSoft} roughness={0.93} />
              </mesh>
            ))}
          </>
        ) : (
          <>
            <mesh position={[0, 1.8, 0.31]} scale={[1.18, 0.3, 0.25]}>
              <sphereGeometry args={[0.22, 28, 20]} />
              <meshStandardMaterial color="#d1cec7" roughness={0.95} />
            </mesh>
            {[-0.12, 0, 0.12].map((stripeX, index) => (
              <mesh
                key={`stripe-${stripeX}`}
                position={[stripeX, 1.78 - Math.abs(stripeX) * 0.18, 0.405]}
                rotation={[0, 0, (index - 1) * 0.22]}
                scale={[0.42, 0.9, 0.2]}
              >
                <sphereGeometry args={[0.035, 16, 12]} />
                <meshStandardMaterial color="#aaa7a1" roughness={0.96} />
              </mesh>
            ))}
          </>
        )}

        {[-1, 1].map((eyeSide) => (
          <group key={`eye-${eyeSide}`} position={[eyeSide * 0.155, 1.56, 0.445]}>
            <mesh scale={[1, 1.08, 0.5]}>
              <sphereGeometry args={[0.084, 22, 16]} />
              <meshStandardMaterial color={colors.iris} roughness={0.35} metalness={0.08} emissive={colors.iris} emissiveIntensity={0.18} />
            </mesh>
            <mesh position={[0, 0, 0.037]} scale={[0.52, 0.9, 0.38]}>
              <sphereGeometry args={[0.054, 18, 14]} />
              <meshStandardMaterial color="#111116" roughness={0.22} />
            </mesh>
            <mesh position={[-0.018, 0.024, 0.061]}>
              <sphereGeometry args={[0.013, 12, 10]} />
              <meshBasicMaterial color="#fffdf6" />
            </mesh>
          </group>
        ))}

        {[-1, 1].map((muzzleSide) => (
          <mesh key={`muzzle-${muzzleSide}`} position={[muzzleSide * 0.095, 1.4, 0.445]} scale={[1.25, 0.84, 0.58]}>
            <sphereGeometry args={[0.105, 24, 18]} />
            <meshStandardMaterial color={colors.chest} roughness={0.96} />
          </mesh>
        ))}
        <mesh position={[0, 1.43, 0.515]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.055, 0.075, 3]} />
          <meshStandardMaterial color="#d69a9e" roughness={0.72} />
        </mesh>

        {[-1, 1].flatMap((whiskerSide) =>
          [-0.05, 0, 0.05].map((offset, index) => (
            <mesh
              key={`whisker-${whiskerSide}-${index}`}
              position={[whiskerSide * 0.31, 1.36 + offset, 0.47]}
              rotation={[0, 0, Math.PI / 2 + whiskerSide * offset * 2.5]}
            >
              <cylinderGeometry args={[0.006, 0.003, 0.32, 6]} />
              <meshBasicMaterial color="#d9d2c8" transparent opacity={0.78} />
            </mesh>
          )),
        )}

        {[-0.27, 0.27].map((x) => (
          <mesh key={`paw-${x}`} castShadow position={[x, 0.27, 0.24]}>
            <capsuleGeometry args={[0.135, 0.44, 8, 18]} />
            <meshStandardMaterial color={colors.chest} roughness={0.96} />
          </mesh>
        ))}
        <mesh ref={tail} geometry={tailGeometry}>
          <meshStandardMaterial color={isNono ? colors.point : colors.pointSoft} roughness={0.94} />
        </mesh>
        {hovered ? <pointLight position={[0, 1.4, 0.65]} color={isNono ? "#aebfd1" : "#c8d8ca"} intensity={2.4} distance={2.3} /> : null}
      </group>
    </group>
  );
}

function CatCompanions({ activeChapter, reducedMotion, onAdvance }: Pick<SceneProps, "activeChapter" | "reducedMotion" | "onAdvance">) {
  const group = useRef<THREE.Group>(null);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!group.current) return;
    const chapter = storyWorld.chapters[activeChapter];
    target.set(chapter.position[0], 0.055, chapter.position[2] + 1.22);
    group.current.position.lerp(target, 1 - Math.exp(-delta * 2.1));
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      activeChapter % 2 ? -0.2 : 0.18,
      1 - Math.exp(-delta * 2.5),
    );
    if (!reducedMotion) group.current.position.y += Math.sin(state.clock.elapsedTime * 2.2) * 0.002;
  });

  return (
    <group ref={group} name="Nono-and-Xiaoyi-companions">
      <CompanionCat variant="nono" position={[-0.82, 0, 0]} side={-1} reducedMotion={reducedMotion} onAdvance={onAdvance} />
      <CompanionCat variant="xiaoyi" position={[0.82, 0, 0]} side={1} reducedMotion={reducedMotion} onAdvance={onAdvance} />
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

      <ambientLight intensity={0.34} color="#78749b" />
      <directionalLight
        castShadow={!quiet}
        position={[3, 8, 6]}
        intensity={1.7}
        color={moon}
        shadow-mapSize-width={quiet ? 512 : 1024}
        shadow-mapSize-height={quiet ? 512 : 1024}
      />
      <pointLight position={[-5, 4, 1]} color={lavender} intensity={4.5} distance={15} />
      <pointLight position={[7, 3, 0]} color={rose} intensity={3.8} distance={13} />

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

        <ButterflyGuide activeChapter={activeChapter} reducedMotion={reducedMotion} onAdvance={onAdvance} />
        <CatCompanions activeChapter={activeChapter} reducedMotion={reducedMotion} onAdvance={onAdvance} />
      </WorldParallax>

      <ContactShadows
        position={[4, 0, -2.5]}
        scale={32}
        opacity={quiet ? 0.2 : 0.34}
        blur={quiet ? 2.4 : 1.8}
        far={9}
        resolution={quiet ? 256 : 512}
        color="#020307"
      />

      {!quiet ? (
        <EffectComposer multisampling={2}>
          <Bloom mipmapBlur intensity={1.15} luminanceThreshold={0.72} luminanceSmoothing={0.35} />
          <Vignette eskil={false} offset={0.18} darkness={0.78} />
        </EffectComposer>
      ) : null}
    </>
  );
}

export type { RenderQuality };
