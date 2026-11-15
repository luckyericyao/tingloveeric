"use client";

import { Canvas, useThree } from "@react-three/fiber";
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
import { FilmPausedContext } from "./FilmPlayback";

type StoryWorldCanvasProps = {
  paused?: boolean;
  activeBeat: number;
  activeChapter: number;
  panelOpen: boolean;
  quality: RenderQuality;
  reducedMotion: boolean;
  playbackState: StoryPlaybackState;
  playbackDirection: StoryPlaybackDirection;
  onCatInteraction: () => void;
  onReady: () => void;
  onFailure: () => void;
};

function WatchContext({ onFailure }: { onFailure: () => void }) {
  const renderer = useThree(state => state.gl);

  useEffect(() => {
    const canvas = renderer.domElement;
    canvas.addEventListener("webglcontextlost", onFailure, { once: true });
    if (renderer.getContext().isContextLost()) onFailure();
    return () => canvas.removeEventListener("webglcontextlost", onFailure);
  }, [onFailure, renderer]);

  return null;
}

function SceneReady({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    const frame = window.requestAnimationFrame(onReady);
    return () => window.cancelAnimationFrame(frame);
  }, [onReady]);

  return null;
}

export function StoryWorldCanvas({
  paused = false,
  activeBeat,
  activeChapter,
  panelOpen,
  quality,
  reducedMotion,
  playbackState,
  playbackDirection,
  onCatInteraction,
  onReady,
  onFailure,
}: StoryWorldCanvasProps) {
  return (
    <Canvas
      className={styles.canvas}
      shadows={quality === "cinematic" ? "basic" : false}
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
      <WatchContext onFailure={onFailure} />
      <Suspense fallback={null}>
        <FilmPausedContext.Provider value={paused}>
          <StoryWorldScene
            activeBeat={activeBeat}
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
        </FilmPausedContext.Provider>
      </Suspense>
    </Canvas>
  );
}
