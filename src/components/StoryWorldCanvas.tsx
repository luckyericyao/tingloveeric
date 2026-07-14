"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import { storyWorld } from "@/data/storyWorld";
import { StoryWorldScene, type RenderQuality } from "@/components/StoryWorldScene";
import styles from "./LoveStoryExperience.module.css";

type StoryWorldCanvasProps = {
  activeChapter: number;
  quality: RenderQuality;
  reducedMotion: boolean;
  onSelectChapter: (chapter: number) => void;
  onAdvance: () => void;
  onReady: () => void;
};

export function StoryWorldCanvas({
  activeChapter,
  quality,
  reducedMotion,
  onSelectChapter,
  onAdvance,
  onReady,
}: StoryWorldCanvasProps) {
  return (
    <Canvas
      className={styles.canvas}
      shadows={quality === "cinematic"}
      dpr={quality === "cinematic" ? [1, 1.65] : 1}
      camera={{
        fov: 42,
        near: 0.1,
        far: 80,
        position: storyWorld.chapters[0].camera,
      }}
      gl={{
        antialias: quality === "cinematic",
        alpha: false,
        powerPreference: quality === "cinematic" ? "high-performance" : "low-power",
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        window.requestAnimationFrame(onReady);
      }}
    >
      <Suspense fallback={null}>
        <StoryWorldScene
          activeChapter={activeChapter}
          started
          quality={quality}
          reducedMotion={reducedMotion}
          onSelectChapter={onSelectChapter}
          onAdvance={onAdvance}
        />
      </Suspense>
    </Canvas>
  );
}
