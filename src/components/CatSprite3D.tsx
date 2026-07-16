"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { storyWorld } from "@/data/storyWorld";

export type CatIdentity = "nono" | "xiaoyi";

type CatSprite3DProps = {
  identity: CatIdentity;
  position: [number, number, number];
  scale: number;
  side: -1 | 1;
  reducedMotion: boolean;
  renderOrder: number;
  onAdvance: () => void;
};

type CatCompanionsProps = {
  activeChapter: number;
  reducedMotion: boolean;
  onAdvance: () => void;
};

const CAT_TEXTURES = {
  nono: {
    front: "/assets/cats/nono-front.webp",
    left: "/assets/cats/nono-left.webp",
    right: "/assets/cats/nono-right.webp",
    blink: "/assets/cats/nono-blink.webp",
  },
  xiaoyi: {
    front: "/assets/cats/xiaoyi-front.webp",
    left: "/assets/cats/xiaoyi-left.webp",
    right: "/assets/cats/xiaoyi-right.webp",
    blink: "/assets/cats/xiaoyi-blink.webp",
  },
} as const;

const CAT_LAYOUT = {
  nono: {
    width: 1.35,
    height: 2.03,
    centerY: 0.745,
    tint: "#ded8d0",
    headCrop: [0.2, 0.8, 0.43, 0.95] as const,
  },
  xiaoyi: {
    width: 1.56,
    height: 1.93,
    centerY: 0.725,
    tint: "#e4ddd2",
    headCrop: [0.18, 0.82, 0.42, 0.96] as const,
  },
} as const;

const VIEW_ORDER = ["front", "left", "right", "blink"] as const;

useTexture.preload(Object.values(CAT_TEXTURES).flatMap((cat) => Object.values(cat)));

function createCurvedPlane(width: number, height: number) {
  const geometry = new THREE.PlaneGeometry(width, height, 12, 16);
  const positions = geometry.attributes.position as THREE.BufferAttribute;
  positions.setUsage(THREE.DynamicDrawUsage);

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const normalizedX = x / (width * 0.5);
    const curve = Math.max(0, 1 - normalizedX * normalizedX);
    positions.setZ(index, curve * 0.035);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createCroppedPlane(
  width: number,
  height: number,
  crop: readonly [number, number, number, number],
) {
  const [uMin, uMax, vMin, vMax] = crop;
  const geometry = new THREE.PlaneGeometry(width * (uMax - uMin), height * (vMax - vMin), 6, 6);
  const uvs = geometry.attributes.uv as THREE.BufferAttribute;
  geometry.setAttribute("uv1", uvs.clone());

  for (let index = 0; index < uvs.count; index += 1) {
    uvs.setXY(
      index,
      THREE.MathUtils.lerp(uMin, uMax, uvs.getX(index)),
      THREE.MathUtils.lerp(vMin, vMax, uvs.getY(index)),
    );
  }

  uvs.needsUpdate = true;
  return geometry;
}

function createHeadFeatherTexture() {
  const size = 64;
  const data = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / (size - 1);
      const v = y / (size - 1);
      const horizontal = THREE.MathUtils.smoothstep(Math.min(u, 1 - u), 0, 0.22);
      const vertical = THREE.MathUtils.smoothstep(Math.min(v, 1 - v), 0, 0.28);
      const value = Math.round(horizontal * vertical * 255);
      const offset = (y * size + x) * 4;
      data[offset] = value;
      data[offset + 1] = value;
      data[offset + 2] = value;
      data[offset + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.channel = 1;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function createShadowTexture() {
  const size = 64;
  const data = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = (x / (size - 1) - 0.5) * 2;
      const ny = (y / (size - 1) - 0.5) * 2;
      const radius = nx * nx + ny * ny;
      const alpha = Math.max(0, Math.min(255, Math.round((1 - radius) * 150)));
      const offset = (y * size + x) * 4;
      data[offset] = 8;
      data[offset + 1] = 9;
      data[offset + 2] = 13;
      data[offset + 3] = alpha;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function seededDelay(seed: number, cycle: number, min: number, max: number) {
  const raw = Math.sin((seed + cycle * 7.31) * 12.9898) * 43758.5453;
  const unit = raw - Math.floor(raw);
  return min + unit * (max - min);
}

export function CatSprite3D({
  identity,
  position,
  scale,
  side,
  reducedMotion,
  renderOrder,
  onAdvance,
}: CatSprite3DProps) {
  const anchor = useRef<THREE.Group>(null);
  const motion = useRef<THREE.Group>(null);
  const headLayer = useRef<THREE.Group>(null);
  const mainMaterials = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const depthMaterials = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const headMaterials = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const [hovered, setHovered] = useState(false);
  const { camera, gl } = useThree();
  const layout = CAT_LAYOUT[identity];
  const sources = CAT_TEXTURES[identity];
  const loadedTextures = useTexture(VIEW_ORDER.map((view) => sources[view]));
  const geometry = useMemo(() => createCurvedPlane(layout.width, layout.height), [layout.height, layout.width]);
  const headGeometry = useMemo(
    () => createCroppedPlane(layout.width, layout.height, layout.headCrop),
    [layout.headCrop, layout.height, layout.width],
  );
  const headFeatherTexture = useMemo(() => createHeadFeatherTexture(), []);
  const textures = useMemo(
    () =>
      loadedTextures.map((loadedTexture) => {
        const texture = loadedTexture.clone();
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.needsUpdate = true;
        return texture;
      }),
    [gl, loadedTextures],
  );
  const shadowTexture = useMemo(() => createShadowTexture(), []);
  const cameraWorld = useMemo(() => new THREE.Vector3(), []);
  const cameraLocal = useMemo(() => new THREE.Vector3(), []);
  const currentWeights = useRef([1, 0, 0, 0]);
  const reveal = useRef(0);
  const nextBlinkAt = useRef(0);
  const blinkStartedAt = useRef(-1);
  const blinkCycle = useRef(0);
  const nextTwitchAt = useRef(0);
  const twitchStartedAt = useRef(-1);
  const twitchCycle = useRef(0);
  const seed = identity === "nono" ? 1.37 : 4.83;

  useEffect(
    () => () => {
      geometry.dispose();
      headGeometry.dispose();
      headFeatherTexture.dispose();
      shadowTexture.dispose();
      textures.forEach((texture) => texture.dispose());
    },
    [geometry, headFeatherTexture, headGeometry, shadowTexture, textures],
  );

  useFrame((state, delta) => {
    if (!anchor.current || !motion.current || !headLayer.current) return;

    cameraWorld.copy(camera.position);
    cameraLocal.copy(cameraWorld);
    anchor.current.worldToLocal(cameraLocal);
    const cameraAngle = Math.atan2(cameraLocal.x, Math.max(0.001, cameraLocal.z));
    const sideWeight = reducedMotion
      ? 0
      : THREE.MathUtils.smoothstep(Math.abs(cameraAngle), 0.12, 0.58);

    const now = state.clock.elapsedTime;
    if (nextBlinkAt.current === 0) nextBlinkAt.current = now + seededDelay(seed, 0, 2.5, 4.8);
    if (nextTwitchAt.current === 0) nextTwitchAt.current = now + seededDelay(seed + 2.1, 0, 3.8, 7.4);

    if (!reducedMotion && blinkStartedAt.current < 0 && now >= nextBlinkAt.current) {
      blinkStartedAt.current = now;
    }

    let blinkAmount = 0;
    if (!reducedMotion && blinkStartedAt.current >= 0) {
      const blinkElapsed = now - blinkStartedAt.current;
      blinkAmount = Math.sin(Math.min(1, blinkElapsed / 0.24) * Math.PI);
      if (blinkElapsed >= 0.24) {
        blinkStartedAt.current = -1;
        blinkCycle.current += 1;
        nextBlinkAt.current = now + seededDelay(seed, blinkCycle.current, 2.5, 6);
        blinkAmount = 0;
      }
    }

    if (!reducedMotion && twitchStartedAt.current < 0 && now >= nextTwitchAt.current) {
      twitchStartedAt.current = now;
    }

    let twitchAmount = 0;
    if (!reducedMotion && twitchStartedAt.current >= 0) {
      const twitchElapsed = now - twitchStartedAt.current;
      twitchAmount = Math.sin(Math.min(1, twitchElapsed / 0.34) * Math.PI);
      if (twitchElapsed >= 0.34) {
        twitchStartedAt.current = -1;
        twitchCycle.current += 1;
        nextTwitchAt.current = now + seededDelay(seed + 2.1, twitchCycle.current, 4.2, 8.4);
        twitchAmount = 0;
      }
    }

    const frontWeight = 1 - sideWeight;
    const targetWeights = [
      frontWeight * (1 - blinkAmount),
      cameraAngle < 0 ? sideWeight : 0,
      cameraAngle >= 0 ? sideWeight : 0,
      frontWeight * blinkAmount,
    ];
    const fade = 1 - Math.exp(-delta * 10.5);
    reveal.current = reducedMotion ? 1 : THREE.MathUtils.lerp(reveal.current, 1, 1 - Math.exp(-delta * 3.2));

    for (let index = 0; index < currentWeights.current.length; index += 1) {
      currentWeights.current[index] = THREE.MathUtils.lerp(
        currentWeights.current[index],
        targetWeights[index],
        fade,
      );
      const mainMaterial = mainMaterials.current[index];
      const depthMaterial = depthMaterials.current[index];
      const headMaterial = headMaterials.current[index];
      if (mainMaterial) mainMaterial.opacity = currentWeights.current[index] * reveal.current;
      if (depthMaterial) depthMaterial.opacity = currentWeights.current[index] * reveal.current * 0.13;
      if (headMaterial) headMaterial.opacity = currentWeights.current[index] * reveal.current;
    }

    const breathing = reducedMotion ? 0 : Math.sin(now * 1.22 + seed) * 0.5 + 0.5;
    const headDrift = reducedMotion ? 0 : Math.sin(now * 0.31 + seed) * 0.026;
    motion.current.scale.set(
      hovered ? 1.018 : 1,
      (hovered ? 1.018 : 1) * (1 + breathing * 0.007),
      1,
    );
    motion.current.rotation.y = THREE.MathUtils.clamp(cameraAngle * 0.24, -0.22, 0.22) + headDrift;
    motion.current.rotation.z = reducedMotion ? 0 : Math.sin(now * 0.43 + seed) * 0.006 + twitchAmount * side * 0.008;
    motion.current.position.y = reducedMotion ? 0 : breathing * 0.008;
    headLayer.current.rotation.y = headDrift * 0.9;
    headLayer.current.rotation.z = reducedMotion ? 0 : twitchAmount * side * 0.006;
    headLayer.current.position.x = reducedMotion ? 0 : Math.sin(now * 0.31 + seed) * 0.0025;
  });

  return (
    <group
      ref={anchor}
      name={`${identity}-cat-sprite-3d`}
      position={position}
      scale={scale}
      userData={{ identity, treatment: "2.5d-texture-sprite" }}
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
      <mesh position={[0, 0.018, -0.08]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={renderOrder - 2}>
        <planeGeometry args={[1.16, 0.4]} />
        <meshBasicMaterial
          map={shadowTexture}
          transparent
          opacity={identity === "nono" ? 0.36 : 0.31}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <group ref={motion} position={[0, layout.centerY, 0]}>
        {textures.map((texture, index) => (
          <group key={VIEW_ORDER[index]}>
            <mesh geometry={geometry} position={[side * -0.008, 0.006, -0.026]} scale={[1.018, 1.012, 1]} renderOrder={renderOrder - 1}>
              <meshBasicMaterial
                ref={(material) => {
                  depthMaterials.current[index] = material;
                }}
                map={texture}
                color={identity === "nono" ? "#8c8790" : "#9c958f"}
                transparent
                opacity={0}
                alphaTest={0.012}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh geometry={geometry} renderOrder={renderOrder + index}>
              <meshBasicMaterial
                ref={(material) => {
                  mainMaterials.current[index] = material;
                }}
                map={texture}
                alphaMap={headFeatherTexture}
                color={hovered ? "#eee7dc" : layout.tint}
                transparent
                opacity={0}
                alphaTest={0.018}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}
        <group
          ref={headLayer}
          position={[
            layout.width * ((layout.headCrop[0] + layout.headCrop[1]) * 0.5 - 0.5),
            layout.height * ((layout.headCrop[2] + layout.headCrop[3]) * 0.5 - 0.5),
            0.022,
          ]}
        >
          {textures.map((texture, index) => (
            <mesh key={`head-${VIEW_ORDER[index]}`} geometry={headGeometry} renderOrder={renderOrder + 6 + index}>
              <meshBasicMaterial
                ref={(material) => {
                  headMaterials.current[index] = material;
                }}
                map={texture}
                color={hovered ? "#eee7dc" : layout.tint}
                transparent
                opacity={0}
                alphaTest={0.018}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

export function CatCompanions({ activeChapter, reducedMotion, onAdvance }: CatCompanionsProps) {
  const group = useRef<THREE.Group>(null);
  const target = useMemo(() => new THREE.Vector3(), []);
  const { size } = useThree();
  const compact = size.width < 680;

  useFrame((state, delta) => {
    if (!group.current) return;
    const chapter = storyWorld.chapters[activeChapter];
    target.set(chapter.position[0], compact ? 0.92 : 0.045, chapter.position[2] + (compact ? 1.06 : 1.18));
    group.current.position.lerp(target, 1 - Math.exp(-delta * 2.1));
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      activeChapter % 2 ? -0.17 : 0.15,
      1 - Math.exp(-delta * 2.5),
    );
    if (!reducedMotion) group.current.position.y += Math.sin(state.clock.elapsedTime * 1.9) * 0.0015;
  });

  return (
    <group ref={group} name="nono-and-xiaoyi-2-5d">
      <CatSprite3D
        identity="nono"
        position={[compact ? -0.7 : -0.88, 0, 0.025]}
        scale={compact ? 0.72 : 0.86}
        side={-1}
        reducedMotion={reducedMotion}
        renderOrder={32}
        onAdvance={onAdvance}
      />
      <CatSprite3D
        identity="xiaoyi"
        position={[compact ? 0.7 : 0.88, 0, -0.015]}
        scale={compact ? 0.72 : 0.86}
        side={1}
        reducedMotion={reducedMotion}
        renderOrder={40}
        onAdvance={onAdvance}
      />
    </group>
  );
}
