"use client";

import { createContext, useContext, useRef } from "react";
import { useFrame, type RootState } from "@react-three/fiber";

export const FilmPausedContext = createContext(false);

export function useFilmFrame(callback: (state: RootState, delta: number, elapsed: number) => void) {
  const paused = useContext(FilmPausedContext);
  const elapsed = useRef(0);
  useFrame((state, delta) => {
    if (paused) return;
    const step = Math.min(delta, 0.05);
    elapsed.current += step;
    callback(state, step, elapsed.current);
  });
}
