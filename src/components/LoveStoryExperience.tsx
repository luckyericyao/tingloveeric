"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { storyWorld } from "@/data/storyWorld";
import { CinemaPrelude } from "@/components/CinemaPrelude";
import { useStoryAudio } from "@/components/StoryAudioDirector";
import type {
  RenderQuality,
  StoryPlaybackDirection,
  StoryPlaybackState,
} from "@/components/StoryWorldScene";
import styles from "./LoveStoryExperience.module.css";

const StoryWorldCanvas = dynamic(
  () => import("@/components/StoryWorldCanvas").then((module) => module.StoryWorldCanvas),
  { ssr: false },
);

const CHAPTER_TRANSITION_MS = 860;
const BEAT_TRANSITION_MS = 260;
const DEFAULT_MUSIC_DURATION_SECONDS = 254.4;
const PRELUDE_DURATION_SECONDS = 60;

function detectWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function LoveStoryExperience() {
  const [started, setStarted] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [activeBeat, setActiveBeat] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const [maxViewedChapter, setMaxViewedChapter] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [quality, setQuality] = useState<RenderQuality>("cinematic");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [playbackState, setPlaybackState] = useState<StoryPlaybackState>("idle");
  const [playbackDirection, setPlaybackDirection] = useState<StoryPlaybackDirection>("forward");
  const [timelineRun, setTimelineRun] = useState(0);
  const [preludeSeconds, setPreludeSeconds] = useState(0);
  const experienceRef = useRef<HTMLElement>(null);
  const activeBeatRef = useRef(0);
  const activeChapterRef = useRef(0);
  const maxViewedChapterRef = useRef(0);
  const playbackStateRef = useRef<StoryPlaybackState>("idle");
  const timelineTimers = useRef<number[]>([]);
  const filmStartedRef = useRef(false);
  const musicDurationRef = useRef(DEFAULT_MUSIC_DURATION_SECONDS);
  const beat = storyWorld.timeline[activeBeat];
  const chapter = storyWorld.chapters[activeChapter];
  const lastBeat = storyWorld.timeline.length - 1;
  const lastChapter = storyWorld.chapters.length - 1;
  const {
    activeTrack,
    currentTime: audioCurrentTime,
    duration: audioDuration,
    endedTrack,
    error: audioError,
    needsGesture: audioNeedsGesture,
    playing,
    playTrack,
  } = useStoryAudio();

  const setPlayback = useCallback((state: StoryPlaybackState) => {
    playbackStateRef.current = state;
    setPlaybackState(state);
  }, []);

  const clearTimeline = useCallback(() => {
    timelineTimers.current.forEach((timer) => window.clearTimeout(timer));
    timelineTimers.current = [];
  }, []);

  const scheduleTimeline = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timelineTimers.current = timelineTimers.current.filter((item) => item !== timer);
      callback();
    }, delay);
    timelineTimers.current.push(timer);
  }, []);

  const queueFilmBeat = useCallback((index: number) => {
    if (index <= activeBeatRef.current || index > lastBeat) return;
    const nextBeat = storyWorld.timeline[index];
    const nextChapter = nextBeat.chapterIndex;
    const chapterChanged = nextChapter !== activeChapterRef.current;
    clearTimeline();
    setPlayback(chapterChanged ? "transitioning" : "playing");
    setPlaybackDirection("forward");
    setPanelOpen(false);
    activeBeatRef.current = index;
    setActiveBeat(index);
    activeChapterRef.current = nextChapter;
    const viewedChapter = Math.max(maxViewedChapterRef.current, nextChapter);
    maxViewedChapterRef.current = viewedChapter;
    setActiveChapter(nextChapter);
    setMaxViewedChapter(viewedChapter);
    setTimelineRun((current) => current + 1);

    const transitionDuration = reducedMotion ? 40 : chapterChanged ? CHAPTER_TRANSITION_MS : BEAT_TRANSITION_MS;
    scheduleTimeline(() => {
      setPanelOpen(true);
      setPlayback("playing");
    }, transitionDuration);
  }, [clearTimeline, lastBeat, reducedMotion, scheduleTimeline, setPlayback]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      setReducedMotion(media.matches);
      if (media.matches) setQuality("quiet");
    };
    const frame = window.requestAnimationFrame(() => {
      const supported = detectWebGL();
      setWebglSupported(supported);
      if (!supported) setSceneReady(true);
      updateMotion();
    });
    media.addEventListener("change", updateMotion);
    return () => {
      window.cancelAnimationFrame(frame);
      media.removeEventListener("change", updateMotion);
    };
  }, []);

  useEffect(() => {
    if (started) return;
    const startedAt = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = Math.min(
        PRELUDE_DURATION_SECONDS,
        Math.floor((performance.now() - startedAt) / 1000),
      );
      setPreludeSeconds(elapsed);
      if (elapsed >= PRELUDE_DURATION_SECONDS) window.clearInterval(timer);
    }, 250);

    return () => window.clearInterval(timer);
  }, [started]);

  useEffect(() => {
    if (!started || !sceneReady || filmStartedRef.current) return;
    filmStartedRef.current = true;
    activeBeatRef.current = 0;
    activeChapterRef.current = 0;
    setPlaybackDirection("forward");
    setPanelOpen(true);
    setPlayback("playing");
  }, [sceneReady, setPlayback, started]);

  useEffect(() => () => {
    clearTimeline();
    filmStartedRef.current = false;
  }, [clearTimeline]);

  const startStory = async () => {
    clearTimeline();
    activeBeatRef.current = 0;
    activeChapterRef.current = 0;
    maxViewedChapterRef.current = 0;
    setActiveBeat(0);
    setActiveChapter(0);
    setMaxViewedChapter(0);
    setPlayback("idle");
    setStarted(true);
    setPanelOpen(true);
    filmStartedRef.current = false;
    await playTrack("story");
  };

  const playOpeningAudio = async () => {
    if (started) return;
    await playTrack("opening");
  };

  const handleSceneInteraction = useCallback(() => {
    // CatSprite3D owns the only intentional interaction inside the film.
  }, []);

  useEffect(() => {
    if (!started || !sceneReady || !filmStartedRef.current) return;
    if (playbackStateRef.current === "transitioning" || playbackStateRef.current === "completed") return;

    if (Number.isFinite(audioDuration) && audioDuration > 0) {
      musicDurationRef.current = audioDuration;
    }
    const nextBeat = storyWorld.timeline.reduce<number>(
      (current, item, index) => (audioCurrentTime >= item.start ? index : current),
      0,
    );

    if (nextBeat > activeBeatRef.current) {
      queueFilmBeat(nextBeat);
    }
  }, [audioCurrentTime, audioDuration, queueFilmBeat, sceneReady, started]);

  const handleAudioEnded = useCallback(() => {
    if (!started) return;
    activeBeatRef.current = lastBeat;
    activeChapterRef.current = lastChapter;
    maxViewedChapterRef.current = lastChapter;
    setActiveBeat(lastBeat);
    setActiveChapter(lastChapter);
    setMaxViewedChapter(lastChapter);
    setPanelOpen(true);
    setPlayback("completed");
  }, [lastBeat, lastChapter, setPlayback, started]);

  useEffect(() => {
    if (!started || endedTrack !== "story") return;
    const timer = window.setTimeout(handleAudioEnded, 0);
    return () => window.clearTimeout(timer);
  }, [endedTrack, handleAudioEnded, started]);

  const statusText = playbackState === "transitioning"
    ? "镜头转场中"
    : playbackState === "playing"
      ? "正在放映"
      : playbackState === "completed"
        ? "放映结束 · 下一站是世界地图"
        : "正在准备放映";

  return (
    <main
      ref={experienceRef}
      className={styles.experience}
      data-quality={quality}
      data-playback={playbackState}
      data-beat={activeBeat}
      data-chapter={activeChapter}
      data-max-viewed={maxViewedChapter}
    >
      {webglSupported && started ? (
        <StoryWorldCanvas
          activeBeat={activeBeat}
          activeChapter={activeChapter}
          panelOpen={panelOpen}
          quality={quality}
          reducedMotion={reducedMotion}
          playbackState={playbackState}
          playbackDirection={playbackDirection}
          onCatInteraction={handleSceneInteraction}
          onReady={() => setSceneReady(true)}
        />
      ) : webglSupported === false ? (
        <div className={styles.fallbackVisual} aria-hidden="true">
          <Image src="/images/shanghai-night-walk.jpg" alt="上海夜里的两个人" fill priority sizes="100vw" />
          <div className={styles.fallbackVeil} />
        </div>
      ) : null}

      <div className={styles.sceneVeil} aria-hidden="true" />

      <CinemaPrelude
        progress={preludeSeconds / PRELUDE_DURATION_SECONDS}
        ready={preludeSeconds >= PRELUDE_DURATION_SECONDS}
        started={started}
        entryAvailable={webglSupported !== null}
        openingAudioBlocked={audioNeedsGesture && activeTrack.id === "opening"}
        audioPlaying={activeTrack.id === "opening" && playing}
        audioError={activeTrack.id === "opening" && audioError}
        ariaHidden={started}
        onPlayOpeningAudio={playOpeningAudio}
        onEnter={startStory}
      />

      {started && sceneReady ? (
        <>
          <header className={styles.topbar}>
            <div className={styles.brand}>
              <span className={styles.brandMark} aria-hidden="true" />
              <span>
                <strong>Ting & Eric</strong>
                <span className={styles.brandSubtitle}>第 {activeChapter + 1} 幕 · {chapter.label}</span>
              </span>
            </div>

            <div className={styles.nowPlaying} aria-live="polite">
              <strong>{activeTrack?.title ?? "私人放映"}</strong>
              <span>{activeTrack?.artist ?? "Ting & Eric"}</span>
            </div>
          </header>

          <p className={styles.chapterStatus} aria-live="polite">
            {statusText} · {String(activeBeat + 1).padStart(2, "0")}/{storyWorld.timeline.length}
          </p>
          {audioError || (activeTrack.id === "story" && audioNeedsGesture) ? <p className={styles.errorNote}>音乐没有自动播放，放映仍会继续。</p> : null}

          <article
            key={`${beat.id}-${timelineRun}`}
            className={`${styles.chapterPanel} ${panelOpen ? "" : styles.chapterPanelHidden} ${playbackState === "playing" ? styles.chapterPanelPlaying : ""}`}
            aria-live="polite"
          >
            <div className={styles.chapterMeta}>
              <span>{String(activeBeat + 1).padStart(2, "0")}</span>
              <span>{beat.eyebrow}</span>
              <span>{beat.source}</span>
            </div>
            <h2>{beat.title}</h2>
            {beat.quote ? <p className={styles.chapterQuote}>“{beat.quote}”</p> : null}
            <p className={styles.chapterBody}>{beat.body}</p>
            <footer className={styles.chapterFooter}>
              <span className={styles.chapterPrompt}>{beat.prompt}</span>
              {playbackState === "completed" && activeBeat === lastBeat && chapter.action ? (
                <Link className={styles.chapterAction} href={chapter.action.href}>
                  {chapter.action.label}
                  <ArrowRight size={15} strokeWidth={1.6} />
                </Link>
              ) : null}
            </footer>
          </article>
          <div className={styles.filmProgress} aria-hidden="true">
            {storyWorld.timeline.map((item, index) => (
              <span
                className={index <= activeBeat ? styles.filmProgressSeen : ""}
                key={item.id}
              />
            ))}
          </div>
        </>
      ) : null}
    </main>
  );
}
