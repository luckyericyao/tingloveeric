"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { storyWorld } from "@/data/storyWorld";

type Butterfly3DProps = {
  activeChapter: number;
  reducedMotion: boolean;
  quiet: boolean;
  onAdvance: () => void;
};

const WING_TEXTURE = "/assets/butterfly/pearl-wing.webp";

useTexture.preload(WING_TEXTURE);

function createWingGeometry() {
  const width = 0.58;
  const height = 0.74;
  const geometry = new THREE.PlaneGeometry(width, height, 8, 10);
  geometry.translate(-width * 0.5, 0, 0);
  const positions = geometry.attributes.position as THREE.BufferAttribute;

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const normalized = THREE.MathUtils.clamp(Math.abs(x) / width, 0, 1);
    positions.setZ(index, Math.sin(normalized * Math.PI) * 0.025);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createAntennaGeometry(side: -1 | 1) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(side * 0.016, 0.17, 0.01),
    new THREE.Vector3(side * 0.065, 0.28, 0.02),
    new THREE.Vector3(side * 0.13, 0.34, 0.035),
  ]);
  return new THREE.TubeGeometry(curve, 12, 0.0045, 5, false);
}

export function Butterfly3D({ activeChapter, reducedMotion, quiet, onAdvance }: Butterfly3DProps) {
  const anchor = useRef<THREE.Group>(null);
  const butterfly = useRef<THREE.Group>(null);
  const leftWing = useRef<THREE.Group>(null);
  const rightWing = useRef<THREE.Group>(null);
  const wingMaterials = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const [hovered, setHovered] = useState(false);
  const loadedTexture = useTexture(WING_TEXTURE);
  const { gl } = useThree();
  const texture = useMemo(() => {
    const nextTexture = loadedTexture.clone();
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
    nextTexture.minFilter = THREE.LinearMipmapLinearFilter;
    nextTexture.magFilter = THREE.LinearFilter;
    nextTexture.generateMipmaps = true;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [gl, loadedTexture]);
  const wingGeometry = useMemo(() => createWingGeometry(), []);
  const leftAntenna = useMemo(() => createAntennaGeometry(-1), []);
  const rightAntenna = useMemo(() => createAntennaGeometry(1), []);
  const path = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(-1.2, 1.92, 0.48),
          new THREE.Vector3(-0.84, 2.17, 0.24),
          new THREE.Vector3(-0.34, 2.02, 0.5),
          new THREE.Vector3(-0.58, 1.8, 0.72),
          new THREE.Vector3(-1.08, 1.82, 0.58),
        ],
        true,
        "catmullrom",
        0.38,
      ),
    [],
  );
  const target = useMemo(() => new THREE.Vector3(), []);
  const point = useMemo(() => new THREE.Vector3(), []);
  const nextPoint = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const targetScaleVector = useMemo(() => new THREE.Vector3(), []);
  const progress = useRef(0.08);
  const flapPhase = useRef(0);
  const reveal = useRef(0);

  useEffect(
    () => () => {
      wingGeometry.dispose();
      leftAntenna.dispose();
      rightAntenna.dispose();
      texture.dispose();
    },
    [leftAntenna, rightAntenna, texture, wingGeometry],
  );

  useFrame((state, delta) => {
    if (!anchor.current || !butterfly.current || !leftWing.current || !rightWing.current) return;
    const chapter = storyWorld.chapters[activeChapter];
    target.set(chapter.position[0], 0, chapter.position[2]);
    anchor.current.position.lerp(target, 1 - Math.exp(-delta * 2.25));

    if (!reducedMotion) {
      const speed = (quiet ? 0.026 : 0.032) * (1 + Math.sin(state.clock.elapsedTime * 0.41) * 0.16);
      progress.current = (progress.current + delta * speed) % 1;
    }

    path.getPointAt(progress.current, point);
    path.getPointAt((progress.current + 0.006) % 1, nextPoint);
    direction.copy(nextPoint).sub(point).normalize();
    butterfly.current.position.copy(point);
    if (!reducedMotion) butterfly.current.position.y += Math.sin(state.clock.elapsedTime * 1.13) * 0.035;

    const targetYaw = Math.atan2(direction.x, Math.max(0.001, direction.z));
    const targetBank = reducedMotion ? -0.035 : THREE.MathUtils.clamp(direction.y * -0.42, -0.18, 0.18);
    butterfly.current.rotation.y = THREE.MathUtils.lerp(
      butterfly.current.rotation.y,
      targetYaw,
      1 - Math.exp(-delta * 3.4),
    );
    butterfly.current.rotation.z = THREE.MathUtils.lerp(
      butterfly.current.rotation.z,
      targetBank + (reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.66) * 0.035),
      1 - Math.exp(-delta * 3.2),
    );

    if (reducedMotion) {
      leftWing.current.rotation.y = 0.34;
      rightWing.current.rotation.y = -0.34;
    } else {
      const variation = 1 + Math.sin(state.clock.elapsedTime * 0.57) * 0.13;
      flapPhase.current += delta * (quiet ? 7.2 : 8.4) * variation;
      const flap = 0.34 + Math.sin(flapPhase.current) * 0.64 + Math.sin(flapPhase.current * 0.47) * 0.07;
      leftWing.current.rotation.y = flap;
      rightWing.current.rotation.y = -flap;
    }

    reveal.current = reducedMotion ? 1 : THREE.MathUtils.lerp(reveal.current, 1, 1 - Math.exp(-delta * 3));
    wingMaterials.current.forEach((material, index) => {
      if (!material) return;
      material.opacity = reveal.current * (index < 2 ? (quiet ? 0.75 : 0.82) : 0.1);
    });
    const targetScale = hovered ? 0.84 : quiet ? 0.7 : 0.76;
    targetScaleVector.set(targetScale, targetScale, targetScale);
    butterfly.current.scale.lerp(
      targetScaleVector,
      1 - Math.exp(-delta * 7),
    );
  });

  const wing = (mirrored: boolean, materialOffset: number) => (
    <group ref={mirrored ? rightWing : leftWing} scale={mirrored ? [-1, 1, 1] : [1, 1, 1]}>
      <mesh geometry={wingGeometry} renderOrder={52 + materialOffset}>
        <meshBasicMaterial
          ref={(material) => {
            wingMaterials.current[materialOffset] = material;
          }}
          map={texture}
          color="#ddd3c4"
          transparent
          opacity={0}
          alphaTest={0.012}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {!quiet ? (
        <mesh geometry={wingGeometry} position={[0, 0, -0.01]} scale={[1.006, 1.006, 1]} renderOrder={50 + materialOffset}>
          <meshBasicMaterial
            ref={(material) => {
              wingMaterials.current[materialOffset + 2] = material;
            }}
            map={texture}
            color="#a9a5be"
            transparent
            opacity={0}
            alphaTest={0.012}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : null}
    </group>
  );

  return (
    <group ref={anchor} name="pearl-butterfly-flight-path">
      <group
        ref={butterfly}
        name="pearl-butterfly-3d"
        userData={{ treatment: "textured-wing-3d" }}
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
        {wing(false, 0)}
        {wing(true, 1)}
        <mesh position={[0, -0.02, 0.025]}>
          <capsuleGeometry args={[0.022, 0.3, 5, 9]} />
          <meshStandardMaterial color="#403932" roughness={0.84} metalness={0.04} />
        </mesh>
        <mesh geometry={leftAntenna}>
          <meshStandardMaterial color="#6f6254" roughness={0.88} />
        </mesh>
        <mesh geometry={rightAntenna}>
          <meshStandardMaterial color="#6f6254" roughness={0.88} />
        </mesh>
        {hovered ? <pointLight position={[0, 0.05, 0.18]} color="#ead8b7" intensity={0.45} distance={1.2} /> : null}
      </group>
    </group>
  );
}
