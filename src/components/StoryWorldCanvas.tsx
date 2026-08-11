"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import * as THREE from "three";
import { storyWorld } from "@/data/storyWorld";
import {
  StoryWorldScene,
  type RenderQuality,
  type StoryPlaybackDirection,
  type StoryPlaybackState,
} from "@/components/StoryWorldScene";
import styles from "./LoveStoryExperience.module.css";

type StoryWorldCanvasProps = {
  activeChapter: number;
  panelOpen: boolean;
  quality: RenderQuality;
  reducedMotion: boolean;
  playbackState: StoryPlaybackState;
  playbackDirection: StoryPlaybackDirection;
  onCatInteraction: () => void;
  onReady: () => void;
};

function SceneReady({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    const frame = window.requestAnimationFrame(onReady);
    return () => window.cancelAnimationFrame(frame);
  }, [onReady]);

  return null;
}

export function StoryWorldCanvas({
  activeChapter,
  panelOpen,
  quality,
  reducedMotion,
  playbackState,
  playbackDirection,
  onCatInteraction,
  onReady,
}: StoryWorldCanvasProps) {
  return (
    <Canvas
      className={styles.canvas}
      shadows={quality === "cinematic"}
      dpr={quality === "cinematic" ? [1, 1.45] : 1}
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
        gl.toneMappingExposure = 0.94;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <Suspense fallback={null}>
        <StoryWorldScene
          activeChapter={activeChapter}
          started
          panelOpen={panelOpen}
          quality={quality}
          reducedMotion={reducedMotion}
          playbackState={playbackState}
          playbackDirection={playbackDirection}
          onCatInteraction={onCatInteraction}
        />
        <SceneReady onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
