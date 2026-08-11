"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { archiveContent } from "@/data/archiveContent";

export type StoryTrackId = "opening" | "story";

export type StoryTrack = {
  id: StoryTrackId;
  title: string;
  artist: string;
  src: string;
};

const tracks: Record<StoryTrackId, StoryTrack> = {
  opening: { ...archiveContent.audio.opening, id: "opening" },
  story: { ...archiveContent.audio.story, id: "story" },
};

type StoryAudioContextValue = {
  activeTrack: StoryTrack;
  currentTime: number;
  duration: number;
  endedTrack: StoryTrackId | null;
  error: boolean;
  muted: boolean;
  needsGesture: boolean;
  playing: boolean;
  playTrack: (trackId: StoryTrackId) => Promise<boolean>;
  toggleMute: () => void;
  togglePlayback: () => Promise<boolean>;
};

const StoryAudioContext = createContext<StoryAudioContextValue | null>(null);

export function StoryAudioDirector({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);
  const activeTrackIdRef = useRef<StoryTrackId>("opening");
  const openingUnlockCleanupRef = useRef<(() => void) | null>(null);
  const [activeTrackId, setActiveTrackId] = useState<StoryTrackId>("opening");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [endedTrack, setEndedTrack] = useState<StoryTrackId | null>(null);
  const [error, setError] = useState(false);
  const [muted, setMuted] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [playing, setPlaying] = useState(false);
  const activeTrack = tracks[activeTrackId];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const savedMuted = window.localStorage.getItem("tingloveeric.muted") === "true";
    audio.muted = savedMuted;
    audio.volume = savedMuted ? 0 : 0.26;
    setMuted(savedMuted);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const shouldStageOpening = pathname === "/" || pathname === "/cinema";

    if (!shouldStageOpening) {
      openingUnlockCleanupRef.current?.();
      openingUnlockCleanupRef.current = null;
      audio.pause();
      return;
    }

    if (activeTrackIdRef.current !== "opening") {
      activeTrackIdRef.current = "opening";
      setActiveTrackId("opening");
      audio.src = tracks.opening.src;
      audio.currentTime = 0;
      audio.load();
    }

    let disposed = false;
    const tryPlayback = async () => {
      if (disposed || activeTrackIdRef.current !== "opening" || !audio.paused) return;
      try {
        await audio.play();
        if (!disposed) {
          setNeedsGesture(false);
          setError(false);
        }
      } catch {
        if (!disposed) setNeedsGesture(true);
      }
    };

    const unlock = (event: Event) => {
      const target = event.target as Element | null;
      if (target?.closest?.("[data-story-enter]")) return;
      void tryPlayback();
    };
    const events = ["pointerdown", "touchstart", "wheel", "keydown"] as const;
    events.forEach((event) => window.addEventListener(event, unlock, { passive: true }));
    audio.addEventListener("canplay", unlock);
    const cleanup = () => {
      disposed = true;
      events.forEach((event) => window.removeEventListener(event, unlock));
      audio.removeEventListener("canplay", unlock);
      if (openingUnlockCleanupRef.current === cleanup) openingUnlockCleanupRef.current = null;
    };
    openingUnlockCleanupRef.current?.();
    openingUnlockCleanupRef.current = cleanup;
    void tryPlayback();

    return () => {
      cleanup();
    };
  }, [pathname]);

  const playTrack = useCallback(async (trackId: StoryTrackId) => {
    const audio = audioRef.current;
    if (!audio) return false;
    const nextTrack = tracks[trackId];
    openingUnlockCleanupRef.current?.();
    openingUnlockCleanupRef.current = null;
    activeTrackIdRef.current = trackId;
    setEndedTrack(null);
    setActiveTrackId(trackId);
    audio.pause();
    audio.src = nextTrack.src;
    audio.currentTime = 0;
    audio.volume = muted ? 0 : 0.26;
    try {
      await audio.play();
      setPlaying(true);
      setNeedsGesture(false);
      setError(false);
      return true;
    } catch {
      setPlaying(false);
      setNeedsGesture(true);
      return false;
    }
  }, [muted]);

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;
    if (!audio.paused) {
      audio.pause();
      return true;
    }
    try {
      await audio.play();
      setPlaying(true);
      setNeedsGesture(false);
      setError(false);
      return true;
    } catch {
      setNeedsGesture(true);
      return false;
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = !muted;
    audio.muted = nextMuted;
    audio.volume = nextMuted ? 0 : 0.26;
    window.localStorage.setItem("tingloveeric.muted", String(nextMuted));
    setMuted(nextMuted);
  }, [muted]);

  const value = useMemo<StoryAudioContextValue>(() => ({
    activeTrack,
    currentTime,
    duration,
    endedTrack,
    error,
    muted,
    needsGesture,
    playing,
    playTrack,
    toggleMute,
    togglePlayback,
  }), [activeTrack, currentTime, duration, endedTrack, error, muted, needsGesture, playing, playTrack, toggleMute, togglePlayback]);

  return (
    <StoryAudioContext.Provider value={value}>
      <audio
        ref={audioRef}
        className="story-audio-director"
        src={tracks.opening.src}
        preload="auto"
        playsInline
        aria-label={`${activeTrack.title} · ${activeTrack.artist}`}
        onPlay={() => {
          setPlaying(true);
          setNeedsGesture(false);
          setError(false);
        }}
        onPause={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setError(true);
        }}
        onLoadedMetadata={(event) => {
          const nextDuration = event.currentTarget.duration;
          if (Number.isFinite(nextDuration) && nextDuration > 0) setDuration(nextDuration);
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onEnded={() => {
          setPlaying(false);
          setEndedTrack(activeTrackIdRef.current);
        }}
      />
      {children}
    </StoryAudioContext.Provider>
  );
}

export function useStoryAudio() {
  const context = useContext(StoryAudioContext);
  if (!context) throw new Error("useStoryAudio must be used inside StoryAudioDirector");
  return context;
}
