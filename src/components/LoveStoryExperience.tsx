"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowRight, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { storyVisuals, storyWorld, type StoryBeat, type StoryVisualId } from "@/data/storyWorld";
import { useStoryAudio } from "@/components/StoryAudioDirector";
import type { StoryPlaybackState } from "@/components/StoryWorldScene";
import styles from "./LoveStoryExperience.module.css";

const StoryWorldCanvas = dynamic(
  () => import("@/components/StoryWorldCanvas").then((module) => module.StoryWorldCanvas),
  { ssr: false },
);

const SCENE_LOAD_TIMEOUT_MS = 8000;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
type FilmVisual = "probing" | "loading" | "live" | "still";

function subscribeToMotion(onChange: () => void) {
  const media = matchMedia(REDUCED_MOTION);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const prefersReducedMotion = () => matchMedia(REDUCED_MOTION).matches;
const serverMotionPreference = () => false;

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFailure();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function FilmStill({ visual }: { visual: StoryVisualId }) {
  const [loaded, setLoaded] = useState(false);
  const frame = storyVisuals[visual];
  return (
    <div className={styles.fallbackVisual} aria-hidden="true" data-film-still={visual} data-loaded={loaded}>
      <Image src={frame.src} alt="" fill loading="eager" sizes="100vw"
        style={{ objectPosition: `${frame.focalPoint[0] * 100}% ${frame.focalPoint[1] * 100}%` }}
        onLoad={() => setLoaded(true)} onError={() => setLoaded(false)} />
    </div>
  );
}

function CaptionLine({ as: Tag, children, reducedMotion }: {
  as: "h2" | "p";
  children: React.ReactNode;
  reducedMotion: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <Tag aria-hidden={!reducedMotion && !revealed} onAnimationStart={() => setRevealed(true)}>
      {children}
    </Tag>
  );
}

export function LoveStoryExperience() {
  const router = useRouter();
  const audio = useStoryAudio();
  const { sessionReady, preludeComplete, filmRequested, requestFilm, playTrack, resumeTime, togglePlayback, pause } = audio;
  const [visual, setVisual] = useState<FilmVisual>("probing");
  const reducedMotion = useSyncExternalStore(subscribeToMotion, prefersReducedMotion, serverMotionPreference);
  const launched = useRef(false);
  const ready = useCallback(() => setVisual(current => current === "loading" ? "live" : current), []);
  const showStill = useCallback(() => setVisual("still"), []);
  const started = audio.sessionReady && audio.preludeComplete && audio.filmRequested;
  const sceneReady = visual === "live" || visual === "still";
  const filmTime = audio.activeTrack.id === "story" ? audio.currentTime : audio.resumeTime;
  const activeBeat = storyWorld.timeline.reduce((index, item, next) => filmTime >= item.start ? next : index, 0);
  const beat: StoryBeat = storyWorld.timeline[activeBeat];
  const chapter = storyWorld.chapters[beat.chapterIndex];
  const completed = audio.endedTrack === "story";
  const paused = !audio.playing || audio.buffering;
  const state: StoryPlaybackState = completed ? "completed" : filmTime - beat.start < 1.6 ? "transitioning" : "playing";

  useEffect(() => {
    if (!started) return;
    const frame = requestAnimationFrame(() => {
      let supported = false;
      try { supported = Boolean(document.createElement("canvas").getContext("webgl2")); } catch { /* Static fallback. */ }
      setVisual(current => current === "probing" ? (supported ? "loading" : "still") : current);
    });
    return () => cancelAnimationFrame(frame);
  }, [started]);

  useEffect(() => {
    if (!started || sceneReady) return;
    const deadline = window.setTimeout(showStill, SCENE_LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(deadline);
  }, [sceneReady, showStill, started]);

  useEffect(() => {
    if (!sessionReady) return;
    if (!preludeComplete) router.replace("/");
    else if (!filmRequested) void requestFilm();
  }, [sessionReady, preludeComplete, filmRequested, requestFilm, router]);

  useEffect(() => {
    if (!started || !sceneReady || launched.current) return;
    launched.current = true;
    void playTrack("story", resumeTime);
  }, [started, sceneReady, playTrack, resumeTime]);

  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if ((event.target as Element)?.closest("button, a, input, textarea, select")) return;
      if (event.key === " " && started && sceneReady) {
        event.preventDefault();
        void togglePlayback();
      }
      if (event.key === "Escape") {
        pause();
        router.push("/");
      }
    };
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, [started, sceneReady, togglePlayback, pause, router]);

  return (
    <main className={`${styles.experience} ${styles.recipientFilm}`} data-paused={paused} data-playback={state} data-beat={activeBeat} data-chapter={beat.chapterIndex} data-film-visual={visual}>
      {started && (visual === "loading" || visual === "live") ? (
        <SceneBoundary onFailure={showStill}>
          <StoryWorldCanvas activeBeat={activeBeat} activeChapter={beat.chapterIndex} panelOpen quality={reducedMotion ? "quiet" : "cinematic"}
            reducedMotion={reducedMotion} playbackState={state} playbackDirection="forward" paused={paused && sceneReady}
            onCatInteraction={() => {}} onReady={ready} onFailure={showStill} />
        </SceneBoundary>
      ) : started && visual === "still" ? (
        <FilmStill key={beat.visual} visual={beat.visual} />
      ) : null}
      <div className={styles.sceneVeil} aria-hidden="true" />
      <header className={styles.topbar}>
        <div className={styles.brand}><span><strong>Ting & Eric</strong><span className={styles.brandSubtitle}>{chapter.label}</span></span></div>
        <div className={styles.filmControls}>
          {started && sceneReady ? <>
            <button aria-label={paused ? "继续放映" : "暂停放映"} title={paused ? "继续放映" : "暂停放映"} onClick={() => void audio.togglePlayback()}>{paused ? <Play size={18} /> : <Pause size={18} />}</button>
            <button aria-label={audio.muted ? "取消静音" : "静音"} title={audio.muted ? "取消静音" : "静音"} onClick={audio.toggleMute}>{audio.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
          </> : null}
          <Link href="/" aria-label="退出放映，进度会保留" title="退出放映，进度会保留" onClick={audio.pause}><X size={18} /></Link>
        </div>
      </header>
      {!started || !sceneReady ? <p className={styles.filmLoading} role="status">正在准备这一幕…</p> : <>
        {audio.error || audio.needsGesture ? <div className={styles.filmRecovery} role="status"><p>音乐暂时停下了，故事也在这里等你。</p><button onClick={() => void audio.playTrack("story", filmTime)}>重试播放</button></div> : null}
        <article key={beat.id} className={styles.filmCaption} data-film-caption aria-live="polite">
          {beat.title ? <CaptionLine as="h2" reducedMotion={reducedMotion}>{beat.title}</CaptionLine> : null}
          {beat.quote ? <CaptionLine as="p" reducedMotion={reducedMotion}>“{beat.quote}”</CaptionLine> : null}
          {beat.body ? <CaptionLine as="p" reducedMotion={reducedMotion}>{beat.body}</CaptionLine> : null}
          {completed ? <Link className={styles.chapterAction} href="/world">去看看世界 <ArrowRight size={16} /></Link> : null}
        </article>
        <div className={styles.filmProgress} aria-hidden="true">{storyWorld.timeline.map((item, index) => <span key={item.id} className={index <= activeBeat ? styles.filmProgressSeen : ""} />)}</div>
      </>}
    </main>
  );
}
