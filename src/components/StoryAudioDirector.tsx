"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { archiveContent } from "@/data/archiveContent";
import { OPENING_DURATION } from "@/data/openingSequence";

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

const PLAYBACK_VOLUME = 0.26;

type StoryAudioContextValue = {
  activeTrack: StoryTrack;
  currentTime: number;
  duration: number;
  endedTrack: StoryTrackId | null;
  error: boolean;
  muted: boolean;
  needsGesture: boolean;
  playing: boolean;
  sessionReady: boolean;
  preludeComplete: boolean;
  filmRequested: boolean;
  resumeTime: number;
  buffering: boolean;
  requestFilm: () => Promise<boolean>;
  pause: () => void;
  playTrack: (trackId: StoryTrackId, offset?: number) => Promise<boolean>;
  toggleMute: () => void;
  togglePlayback: () => Promise<boolean>;
};

const StoryAudioContext = createContext<StoryAudioContextValue | null>(null);

export function StoryAudioDirector({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);
  const activeTrackIdRef = useRef<StoryTrackId>("opening");
  const openingUnlockCleanupRef = useRef<(() => void) | null>(null);
  const fadeFrameRef = useRef<number | null>(null);
  const fadeResolveRef = useRef<(() => void) | null>(null);
  const [initialSource] = useState(() => pathname === "/" ? tracks.opening.src : undefined);
  const [activeTrackId, setActiveTrackId] = useState<StoryTrackId>("opening");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [endedTrack, setEndedTrack] = useState<StoryTrackId | null>(null);
  const [error, setError] = useState(false);
  const [muted, setMuted] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [preludeComplete, setPreludeComplete] = useState(false);
  const [filmRequested, setFilmRequested] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const activeTrack = tracks[activeTrackId];

  useEffect(() => {
    if (!buffering || !playing) return;
    const timeout = window.setTimeout(() => {
      audioRef.current?.pause();
      setBuffering(false);
      setError(true);
    }, 15000);
    return () => window.clearTimeout(timeout);
  }, [buffering, playing]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let savedMuted = false;
    try {
      savedMuted = window.localStorage.getItem("tingloveeric.muted") === "true";
    } catch { /* Playback must also work when browser storage is disabled. */ }
    audio.muted = savedMuted;
    audio.volume = savedMuted ? 0 : PLAYBACK_VOLUME;
    const frame = requestAnimationFrame(() => {
    setMuted(savedMuted);
    try {
      setPreludeComplete(sessionStorage.getItem("archive.prelude.complete") === "true");
      setFilmRequested(sessionStorage.getItem("archive.film.requested") === "true");
      const saved = Number(sessionStorage.getItem("archive.film.time"));
      setResumeTime(Number.isFinite(saved) ? Math.max(0, Math.min(saved, 254.4)) : 0);
    } catch { /* Storage is optional in private browsing. */ }
    setSessionReady(true);
    });
    const pauseInBackground = () => { if (document.hidden) audio.pause(); };
    document.addEventListener("visibilitychange", pauseInBackground);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", pauseInBackground);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const shouldStageOpening = pathname === "/";

    if (!shouldStageOpening) {
      openingUnlockCleanupRef.current?.();
      openingUnlockCleanupRef.current = null;
      audio.pause();
      return;
    }

    if (activeTrackIdRef.current !== "opening" || audio.getAttribute("src") !== tracks.opening.src) {
      activeTrackIdRef.current = "opening";
      setActiveTrackId("opening");
      setCurrentTime(0);
      setDuration(0);
      setEndedTrack(null);
      setPlaying(false);
      setBuffering(false);
      setError(false);
      audio.src = tracks.opening.src;
      audio.currentTime = 0;
      audio.load();
    }

    let disposed = false;
    const tryPlayback = async () => {
      if (disposed || activeTrackIdRef.current !== "opening" || !audio.paused) return;
      if (audio.error) {
        setError(true);
        return;
      }
      try {
        await audio.play();
        if (!disposed) {
          setNeedsGesture(false);
          setError(false);
          openingUnlockCleanupRef.current?.();
        }
      } catch (error) {
        if (disposed || (error instanceof DOMException && error.name === "AbortError")) return;
        if (audio.error) setError(true);
        else setNeedsGesture(true);
      }
    };

    const unlock = (event: Event) => {
      const target = event.target as Element | null;
      if (target?.closest?.("[data-audio-control], [data-story-enter]")) return;
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

  const cancelFade = useCallback(() => {
    if (fadeFrameRef.current !== null) cancelAnimationFrame(fadeFrameRef.current);
    fadeFrameRef.current = null;
    if (audioRef.current) audioRef.current.dataset.audioTransition = "steady";
    fadeResolveRef.current?.();
    fadeResolveRef.current = null;
  }, []);
  const fadeVolume = useCallback((audio: HTMLAudioElement, target: number, milliseconds: number) => new Promise<void>((resolve) => {
    cancelFade();
    fadeResolveRef.current = resolve;
    audio.dataset.audioTransition = target === 0 ? "fading-out" : "fading-in";
    const from = audio.volume;
    const startedAt = performance.now();
    const frame = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / milliseconds);
      const eased = progress * progress * (3 - 2 * progress);
      audio.volume = from + (target - from) * eased;
      if (progress < 1) fadeFrameRef.current = requestAnimationFrame(frame);
      else {
        fadeFrameRef.current = null;
        fadeResolveRef.current = null;
        audio.dataset.audioTransition = "steady";
        resolve();
      }
    };
    fadeFrameRef.current = requestAnimationFrame(frame);
  }), [cancelFade]);
  const pause = useCallback(() => {
    cancelFade();
    audioRef.current?.pause();
  }, [cancelFade]);
  const requestFilm = useCallback(async () => {
    if (!preludeComplete) return false;
    const audio = audioRef.current;
    if (audio && activeTrackIdRef.current === "opening" && !audio.paused && !muted) {
      await fadeVolume(audio, 0, 420);
    }
    setFilmRequested(true);
    try { sessionStorage.setItem("archive.film.requested", "true"); } catch { /* Optional persistence. */ }
    return true;
  }, [fadeVolume, muted, preludeComplete]);

  const playTrack = useCallback(async (trackId: StoryTrackId, offset = 0) => {
    const audio = audioRef.current;
    if (!audio) return false;
    const nextTrack = tracks[trackId];
    openingUnlockCleanupRef.current?.();
    openingUnlockCleanupRef.current = null;
    activeTrackIdRef.current = trackId;
    setEndedTrack(null);
    setActiveTrackId(trackId);
    setCurrentTime(offset);
    setDuration(0);
    setBuffering(false);
    audio.pause();
    audio.src = nextTrack.src;
    audio.currentTime = offset;
    cancelFade();
    audio.volume = 0;
    try {
      await audio.play();
      setPlaying(true);
      setNeedsGesture(false);
      setError(false);
      if (!muted) void fadeVolume(audio, PLAYBACK_VOLUME, 650);
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return false;
      setPlaying(false);
      setNeedsGesture(true);
      return false;
    }
  }, [cancelFade, fadeVolume, muted]);

  const failedOffset = error ? currentTime : 0;
  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;
    if (!audio.paused) {
      pause();
      return true;
    }
    if (error || audio.error) return playTrack(activeTrackIdRef.current, error ? failedOffset : audio.currentTime);
    try {
      await audio.play();
      setPlaying(true);
      setNeedsGesture(false);
      setError(false);
      if (!audio.muted && audio.volume < PLAYBACK_VOLUME) void fadeVolume(audio, PLAYBACK_VOLUME, 650);
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return false;
      if (audio.error) setError(true);
      else setNeedsGesture(true);
      return false;
    }
  }, [error, fadeVolume, failedOffset, pause, playTrack]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    cancelFade();
    const nextMuted = !muted;
    audio.muted = nextMuted;
    audio.volume = nextMuted ? 0 : PLAYBACK_VOLUME;
    try {
      window.localStorage.setItem("tingloveeric.muted", String(nextMuted));
    } catch { /* The current session still keeps its mute preference. */ }
    setMuted(nextMuted);
  }, [cancelFade, muted]);

  const value = useMemo<StoryAudioContextValue>(() => ({
    activeTrack,
    currentTime,
    duration,
    endedTrack,
    error,
    muted,
    needsGesture,
    playing,
    sessionReady,
    preludeComplete,
    filmRequested,
    resumeTime,
    buffering,
    requestFilm,
    pause,
    playTrack,
    toggleMute,
    togglePlayback,
  }), [activeTrack, currentTime, duration, endedTrack, error, muted, needsGesture, playing, sessionReady, preludeComplete, filmRequested, resumeTime, buffering, requestFilm, pause, playTrack, toggleMute, togglePlayback]);

  return (
    <StoryAudioContext.Provider value={value}>
      <audio
        ref={audioRef}
        className="story-audio-director"
        src={initialSource}
        preload="auto"
        playsInline
        aria-label={`${activeTrack.title} · ${activeTrack.artist}`}
        onPlay={(event) => {
          openingUnlockCleanupRef.current?.();
          setPlaying(true);
          setBuffering(event.currentTarget.readyState < HTMLMediaElement.HAVE_CURRENT_DATA);
          setNeedsGesture(false);
          setError(false);
        }}
        onPlaying={() => setBuffering(false)}
        onWaiting={() => setBuffering(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setBuffering(false);
          setError(true);
        }}
        onLoadedMetadata={(event) => {
          const nextDuration = event.currentTarget.duration;
          if (Number.isFinite(nextDuration) && nextDuration > 0) setDuration(nextDuration);
        }}
        onDurationChange={(event) => {
          const value = event.currentTarget.duration;
          if (Number.isFinite(value) && value > 0) setDuration(value);
        }}
        onTimeUpdate={(event) => {
          const time = event.currentTarget.currentTime;
          setCurrentTime(time);
          if (activeTrackIdRef.current === "opening" && time >= OPENING_DURATION) {
            setPreludeComplete(true);
            try { sessionStorage.setItem("archive.prelude.complete", "true"); } catch { /* Optional persistence. */ }
          }
          if (activeTrackIdRef.current === "story") {
            setResumeTime(time);
            try { sessionStorage.setItem("archive.film.time", String(time)); } catch { /* Optional persistence. */ }
          }
        }}
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
