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
  inwardYaw: number;
  entranceDelay: number;
  lockFront: boolean;
  reducedMotion: boolean;
  renderOrder: number;
  onInteract: () => void;
};

type CatCompanionsProps = {
  activeChapter: number;
  panelOpen: boolean;
  reducedMotion: boolean;
  onInteract: () => void;
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
  },
  xiaoyi: {
    width: 1.56,
    height: 1.93,
    centerY: 0.725,
    tint: "#e4ddd2",
  },
} as const;

const VIEW_ORDER = ["front", "left", "right", "blink"] as const;

const CAT_STAGE_LAYOUT = {
  desktop: {
    depth: 3.55,
    openY: -0.24,
    closedY: -0.34,
    xiaoyi: { xOpen: -2.7, xClosed: -2.45, y: 1.4, z: 0.12, scaleOpen: 2.25, scaleClosed: 2.25, yaw: THREE.MathUtils.degToRad(10) },
    nono: { xOpen: 2.62, xClosed: 2.62, y: -1, z: 0, scaleOpen: 4.6, scaleClosed: 4.6, yaw: THREE.MathUtils.degToRad(-9) },
  },
  mobile: {
    depth: 2.2,
    openY: 0.76,
    closedY: -0.7,
    xiaoyi: { xOpen: -0.75, xClosed: -0.9, y: 0.1, z: 0.08, scaleOpen: 2.5, scaleClosed: 3.2, yaw: THREE.MathUtils.degToRad(9) },
    nono: { xOpen: 0.7, xClosed: 0.9, y: -0.35, z: 0, scaleOpen: 2.65, scaleClosed: 3.65, yaw: THREE.MathUtils.degToRad(-10) },
  },
} as const;

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
  inwardYaw,
  entranceDelay,
  lockFront,
  reducedMotion,
  renderOrder,
  onInteract,
}: CatSprite3DProps) {
  const anchor = useRef<THREE.Group>(null);
  const motion = useRef<THREE.Group>(null);
  const shadowMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const mainMaterials = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const depthMaterials = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const [hovered, setHovered] = useState(false);
  const { camera, gl } = useThree();
  const layout = CAT_LAYOUT[identity];
  const sources = CAT_TEXTURES[identity];
  const loadedTextures = useTexture(VIEW_ORDER.map((view) => sources[view]));
  const geometry = useMemo(() => createCurvedPlane(layout.width, layout.height), [layout.height, layout.width]);
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
  const activeView = useRef<0 | 1 | 2>(0);
  const reveal = useRef(0);
  const entranceElapsed = useRef(0);
  const anchorInitialized = useRef(false);
  const nextBlinkAt = useRef(0);
  const blinkStartedAt = useRef(-1);
  const blinkCycle = useRef(0);
  const nextTwitchAt = useRef(0);
  const twitchStartedAt = useRef(-1);
  const twitchCycle = useRef(0);
  const interactionRequested = useRef(false);
  const interactionPulse = useRef(0);
  const seed = identity === "nono" ? 1.37 : 4.83;
  const targetAnchorPosition = useMemo(() => new THREE.Vector3(), []);
  const targetAnchorScale = useMemo(() => new THREE.Vector3(), []);

  useEffect(
    () => () => {
      geometry.dispose();
      shadowTexture.dispose();
      textures.forEach((texture) => texture.dispose());
    },
    [geometry, shadowTexture, textures],
  );

  useFrame((state, delta) => {
    if (!anchor.current || !motion.current) return;

    targetAnchorPosition.set(...position);
    targetAnchorScale.setScalar(scale);
    if (!anchorInitialized.current) {
      anchor.current.position.copy(targetAnchorPosition);
      anchor.current.scale.copy(targetAnchorScale);
      anchorInitialized.current = true;
    } else {
      anchor.current.position.lerp(targetAnchorPosition, 1 - Math.exp(-delta * 5.2));
      anchor.current.scale.lerp(targetAnchorScale, 1 - Math.exp(-delta * 4.4));
    }

    cameraWorld.copy(camera.position);
    cameraLocal.copy(cameraWorld);
    anchor.current.worldToLocal(cameraLocal);
    const cameraAngle = Math.atan2(cameraLocal.x, Math.max(0.001, cameraLocal.z));
    const absoluteCameraAngle = Math.abs(cameraAngle);
    if (reducedMotion || lockFront || absoluteCameraAngle < 0.24) {
      activeView.current = 0;
    } else if (absoluteCameraAngle > 0.36) {
      activeView.current = cameraAngle < 0 ? 1 : 2;
    }

    const now = state.clock.elapsedTime;
    if (interactionRequested.current) {
      interactionRequested.current = false;
      interactionPulse.current = 1;
      blinkStartedAt.current = now;
      twitchStartedAt.current = now;
    }
    interactionPulse.current = Math.max(0, interactionPulse.current - delta * 1.35);
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

    const targetWeights = activeView.current === 0
      ? [1 - blinkAmount, 0, 0, blinkAmount]
      : [0, activeView.current === 1 ? 1 : 0, activeView.current === 2 ? 1 : 0, 0];
    const fade = 1 - Math.exp(-delta * 10.5);
    entranceElapsed.current += delta;
    const entranceProgress = reducedMotion
      ? 1
      : THREE.MathUtils.clamp((entranceElapsed.current - entranceDelay) / 1.02, 0, 1);
    const entranceEase = 1 - Math.pow(1 - entranceProgress, 3);
    reveal.current = entranceEase;

    for (let index = 0; index < currentWeights.current.length; index += 1) {
      currentWeights.current[index] = THREE.MathUtils.lerp(
        currentWeights.current[index],
        targetWeights[index],
        fade,
      );
      const mainMaterial = mainMaterials.current[index];
      const depthMaterial = depthMaterials.current[index];
      const mainOpacity = currentWeights.current[index] * reveal.current;
      const depthOpacity = mainOpacity * 0.08;
      if (mainMaterial) {
        mainMaterial.opacity = mainOpacity;
        mainMaterial.visible = mainOpacity > 0.002;
        mainMaterial.color.set(hovered || interactionPulse.current > 0.08 ? "#eee7dc" : layout.tint);
      }
      if (depthMaterial) {
        depthMaterial.opacity = depthOpacity;
        depthMaterial.visible = depthOpacity > 0.002;
      }
    }

    if (shadowMaterial.current) {
      shadowMaterial.current.opacity = (identity === "nono" ? 0.48 : 0.43) * reveal.current;
    }

    const breathing = reducedMotion ? 0 : Math.sin(now * 1.22 + seed) * 0.5 + 0.5;
    const headDrift = reducedMotion ? 0 : Math.sin(now * 0.31 + seed) * 0.026;
    const entranceScale = reducedMotion
      ? 1
      : entranceProgress < 0.72
        ? THREE.MathUtils.lerp(0.94, 1.03, 1 - Math.pow(1 - entranceProgress / 0.72, 3))
        : THREE.MathUtils.lerp(1.03, 1, (entranceProgress - 0.72) / 0.28);
    motion.current.scale.set(
      entranceScale,
      entranceScale * (1 + breathing * 0.007),
      entranceScale,
    );
    motion.current.rotation.y = inwardYaw + THREE.MathUtils.clamp(cameraAngle * 0.15, -0.12, 0.12) + headDrift;
    motion.current.rotation.z = reducedMotion
      ? 0
      : Math.sin(now * 0.43 + seed) * 0.006 + twitchAmount * side * 0.008 + interactionPulse.current * side * 0.006;
    motion.current.position.y = (reducedMotion ? 0 : breathing * 0.008) - (1 - entranceEase) * 0.28 + interactionPulse.current * 0.012;
  });

  return (
    <group
      ref={anchor}
      name={`${identity}-cat-sprite-3d`}
      userData={{ identity, treatment: "2.5d-texture-sprite" }}
    >
      <mesh position={[0.08 * side, 0.018, -0.08]} rotation={[-Math.PI / 2, 0, side * 0.08]} renderOrder={renderOrder - 2}>
        <planeGeometry args={[1.46, 0.52]} />
        <meshBasicMaterial
          ref={shadowMaterial}
          map={shadowTexture}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <group ref={motion} position={[0, layout.centerY, 0]}>
        <mesh
          position={[0, -layout.height * 0.03, 0.045]}
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
            onInteract();
            interactionRequested.current = true;
          }}
        >
          <planeGeometry args={[layout.width * 0.58, layout.height * 0.78]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
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
                color={layout.tint}
                transparent
                opacity={0}
                alphaTest={0.018}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

export function CatCompanions({ activeChapter, panelOpen, reducedMotion, onInteract }: CatCompanionsProps) {
  const group = useRef<THREE.Group>(null);
  const target = useMemo(() => new THREE.Vector3(), []);
  const groupInitialized = useRef(false);
  const { size } = useThree();
  const compact = size.width < 680;
  const stage = compact ? CAT_STAGE_LAYOUT.mobile : CAT_STAGE_LAYOUT.desktop;

  useFrame((state, delta) => {
    if (!group.current) return;
    const chapter = storyWorld.chapters[activeChapter];
    target.set(chapter.position[0], panelOpen ? stage.openY : stage.closedY, chapter.position[2] + stage.depth);
    if (!groupInitialized.current) {
      group.current.position.copy(target);
      groupInitialized.current = true;
    } else {
      group.current.position.lerp(target, 1 - Math.exp(-delta * (panelOpen ? 3.4 : 2.8)));
    }
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      activeChapter % 2 ? -0.035 : 0.028,
      1 - Math.exp(-delta * 2.5),
    );
    if (!reducedMotion) group.current.position.y += Math.sin(state.clock.elapsedTime * 1.9) * 0.0015;
  });

  return (
    <group ref={group} name="nono-and-xiaoyi-2-5d">
      <CatSprite3D
        identity="xiaoyi"
        position={[panelOpen ? stage.xiaoyi.xOpen : stage.xiaoyi.xClosed, stage.xiaoyi.y, stage.xiaoyi.z]}
        scale={panelOpen ? stage.xiaoyi.scaleOpen : stage.xiaoyi.scaleClosed}
        side={-1}
        inwardYaw={stage.xiaoyi.yaw}
        entranceDelay={0}
        lockFront={compact}
        reducedMotion={reducedMotion}
        renderOrder={32}
        onInteract={onInteract}
      />
      <CatSprite3D
        identity="nono"
        position={[panelOpen ? stage.nono.xOpen : stage.nono.xClosed, stage.nono.y, stage.nono.z]}
        scale={panelOpen ? stage.nono.scaleOpen : stage.nono.scaleClosed}
        side={1}
        inwardYaw={stage.nono.yaw}
        entranceDelay={0.15}
        lockFront={compact}
        reducedMotion={reducedMotion}
        renderOrder={40}
        onInteract={onInteract}
      />
    </group>
  );
}
