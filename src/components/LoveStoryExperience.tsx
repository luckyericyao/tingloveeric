"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Gauge,
  Pause,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { storyWorld } from "@/data/storyWorld";
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

const WHEEL_THRESHOLD = 28;
const TOUCH_THRESHOLD = 26;
const FORWARD_TRANSITION_MS = 1700;
const CHAPTER_PLAY_MS = 4300;
const RETURN_TRANSITION_MS = 900;

function detectWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function isPlaybackLocked(state: StoryPlaybackState) {
  return state === "transitioning" || state === "playing";
}

export function LoveStoryExperience() {
  const [started, setStarted] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [maxViewedChapter, setMaxViewedChapter] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [quality, setQuality] = useState<RenderQuality>("cinematic");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [playbackState, setPlaybackState] = useState<StoryPlaybackState>("idle");
  const [playbackDirection, setPlaybackDirection] = useState<StoryPlaybackDirection>("forward");
  const [timelineRun, setTimelineRun] = useState(0);
  const [hasAdvanced, setHasAdvanced] = useState(false);
  const [navNotice, setNavNotice] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.42);
  const [audioError, setAudioError] = useState(false);
  const experienceRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const activeChapterRef = useRef(0);
  const maxViewedChapterRef = useRef(0);
  const playbackStateRef = useRef<StoryPlaybackState>("idle");
  const timelineTimers = useRef<number[]>([]);
  const wheelAccumulator = useRef(0);
  const wheelResetTimer = useRef<number | null>(null);
  const noticeTimer = useRef<number | null>(null);
  const suppressSceneClickUntil = useRef(0);
  const chapter = storyWorld.chapters[activeChapter];
  const lastChapter = storyWorld.chapters.length - 1;
  const controlsUnlocked = playbackState === "idle" || playbackState === "settled";

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

  const finishAtChapter = useCallback((index: number) => {
    const viewed = Math.max(maxViewedChapterRef.current, index);
    maxViewedChapterRef.current = viewed;
    setMaxViewedChapter(viewed);
    setPlayback(index === lastChapter ? "completed" : "settled");
  }, [lastChapter, setPlayback]);

  const moveToViewedChapter = useCallback((index: number, direction: StoryPlaybackDirection) => {
    clearTimeline();
    wheelAccumulator.current = 0;
    setPlayback("transitioning");
    setPlaybackDirection(direction);
    setPanelOpen(false);
    activeChapterRef.current = index;
    setActiveChapter(index);
    setTimelineRun((current) => current + 1);

    const transitionDuration = reducedMotion ? 80 : RETURN_TRANSITION_MS;
    scheduleTimeline(() => {
      setPanelOpen(true);
      setPlayback(index === lastChapter ? "completed" : "settled");
    }, transitionDuration);
  }, [clearTimeline, lastChapter, reducedMotion, scheduleTimeline, setPlayback]);

  const playNewChapter = useCallback((index: number) => {
    clearTimeline();
    wheelAccumulator.current = 0;
    setPlayback("transitioning");
    setPlaybackDirection("forward");
    setPanelOpen(false);
    activeChapterRef.current = index;
    setActiveChapter(index);
    setTimelineRun((current) => current + 1);

    const transitionDuration = reducedMotion ? 80 : FORWARD_TRANSITION_MS;
    const readingDuration = reducedMotion ? 2400 : CHAPTER_PLAY_MS;
    scheduleTimeline(() => {
      setPanelOpen(true);
      setPlayback("playing");
    }, transitionDuration);
    scheduleTimeline(() => finishAtChapter(index), transitionDuration + readingDuration);
  }, [clearTimeline, finishAtChapter, reducedMotion, scheduleTimeline, setPlayback]);

  const requestAdvance = useCallback(() => {
    if (!started || !sceneReady) return false;
    const state = playbackStateRef.current;
    if (state !== "idle" && state !== "settled") {
      wheelAccumulator.current = 0;
      return false;
    }

    const current = activeChapterRef.current;
    if (current >= lastChapter) {
      setPlayback("completed");
      return false;
    }

    const next = current + 1;
    setHasAdvanced(true);
    if (next <= maxViewedChapterRef.current) moveToViewedChapter(next, "forward");
    else playNewChapter(next);
    return true;
  }, [lastChapter, moveToViewedChapter, playNewChapter, sceneReady, setPlayback, started]);

  const requestPrevious = useCallback(() => {
    if (!started || !sceneReady) return false;
    const state = playbackStateRef.current;
    if (state !== "settled" && state !== "completed") return false;
    const current = activeChapterRef.current;
    if (current <= 0) return false;
    moveToViewedChapter(current - 1, "backward");
    return true;
  }, [moveToViewedChapter, sceneReady, started]);

  const showFutureNotice = useCallback(() => {
    setNavNotice("故事会带你走到那里");
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNavNotice(""), 1800);
  }, []);

  const selectViewedChapter = useCallback((index: number) => {
    if (index > maxViewedChapterRef.current) {
      showFutureNotice();
      return;
    }
    if (isPlaybackLocked(playbackStateRef.current) || index === activeChapterRef.current) return;
    moveToViewedChapter(index, index < activeChapterRef.current ? "backward" : "forward");
  }, [moveToViewedChapter, showFutureNotice]);

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
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
  }, [muted, volume]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!started) return;
      if (["ArrowDown", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
        requestAdvance();
      } else if (["ArrowUp", "ArrowLeft"].includes(event.key)) {
        event.preventDefault();
        requestPrevious();
      } else if (event.key === "Escape") {
        setPanelOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [requestAdvance, requestPrevious, started]);

  useEffect(() => {
    if (!started) return;

    let touchStartY: number | null = null;
    let touchLastY: number | null = null;

    const resetWheelSoon = () => {
      if (wheelResetTimer.current !== null) window.clearTimeout(wheelResetTimer.current);
      wheelResetTimer.current = window.setTimeout(() => {
        wheelAccumulator.current = 0;
      }, 160);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (isPlaybackLocked(playbackStateRef.current)) {
        wheelAccumulator.current = 0;
        return;
      }

      const normalized = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? event.deltaY * 16 : event.deltaY;
      if (normalized === 0) return;
      if (Math.sign(normalized) !== Math.sign(wheelAccumulator.current)) wheelAccumulator.current = 0;
      wheelAccumulator.current += normalized;
      resetWheelSoon();

      if (wheelAccumulator.current >= WHEEL_THRESHOLD) {
        wheelAccumulator.current = 0;
        requestAdvance();
      } else if (wheelAccumulator.current <= -WHEEL_THRESHOLD) {
        wheelAccumulator.current = 0;
        requestPrevious();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      touchStartY = event.touches[0].clientY;
      touchLastY = touchStartY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      if (touchStartY === null || event.touches.length !== 1) return;
      touchLastY = event.touches[0].clientY;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      if (touchStartY === null || touchLastY === null) return;
      const distance = touchLastY - touchStartY;
      touchStartY = null;
      touchLastY = null;
      if (distance <= -TOUCH_THRESHOLD) requestAdvance();
      else if (distance >= TOUCH_THRESHOLD) requestPrevious();
    };

    const handleTouchCancel = () => {
      touchStartY = null;
      touchLastY = null;
    };

    const handleBlankClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("button, a, input, article, header, nav")) return;
      window.setTimeout(() => {
        if (performance.now() < suppressSceneClickUntil.current) return;
        requestAdvance();
      }, 0);
    };

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: false, capture: true });
    window.addEventListener("touchcancel", handleTouchCancel, { capture: true });
    window.addEventListener("click", handleBlankClick, true);

    return () => {
      window.removeEventListener("wheel", handleWheel, true);
      window.removeEventListener("touchstart", handleTouchStart, true);
      window.removeEventListener("touchmove", handleTouchMove, true);
      window.removeEventListener("touchend", handleTouchEnd, true);
      window.removeEventListener("touchcancel", handleTouchCancel, true);
      window.removeEventListener("click", handleBlankClick, true);
      if (wheelResetTimer.current !== null) window.clearTimeout(wheelResetTimer.current);
    };
  }, [requestAdvance, requestPrevious, started]);

  useEffect(() => () => {
    clearTimeline();
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
  }, [clearTimeline]);

  const startStory = async () => {
    clearTimeline();
    activeChapterRef.current = 0;
    maxViewedChapterRef.current = 0;
    setActiveChapter(0);
    setMaxViewedChapter(0);
    setHasAdvanced(false);
    setPlayback("idle");
    setStarted(true);
    setPanelOpen(true);
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.volume = volume;
      await audio.play();
      setIsPlaying(true);
      setAudioError(false);
    } catch {
      setAudioError(true);
      setIsPlaying(false);
    }
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    try {
      setMuted(false);
      await audio.play();
      setIsPlaying(true);
      setAudioError(false);
    } catch {
      setAudioError(true);
    }
  };

  const toggleMute = () => setMuted((current) => !current);

  const handleSceneInteraction = useCallback(() => {
    suppressSceneClickUntil.current = performance.now() + 300;
  }, []);

  const statusText = !hasAdvanced
    ? "轻轻滑动，故事会自己向前。"
    : playbackState === "transitioning"
      ? "镜头正在前往下一幕"
      : playbackState === "playing"
        ? "这一幕正在展开"
        : playbackState === "completed"
          ? "故事还在继续"
          : `第 ${activeChapter + 1} 幕已经抵达`;

  return (
    <main
      ref={experienceRef}
      className={styles.experience}
      data-quality={quality}
      data-playback={playbackState}
      data-chapter={activeChapter}
      data-max-viewed={maxViewedChapter}
    >
      <audio ref={audioRef} loop preload="metadata">
        <source src={storyWorld.music.src} type="audio/mp4" />
      </audio>

      {webglSupported && started ? (
        <StoryWorldCanvas
          activeChapter={activeChapter}
          panelOpen={panelOpen}
          quality={quality}
          reducedMotion={reducedMotion}
          playbackState={playbackState}
          playbackDirection={playbackDirection}
          onRequestAdvance={requestAdvance}
          onSceneInteraction={handleSceneInteraction}
          onReady={() => setSceneReady(true)}
        />
      ) : webglSupported === false ? (
        <div className={styles.fallbackVisual} onClick={requestAdvance} aria-hidden="true">
          <Image src="/images/shanghai-night-walk.jpg" alt="上海夜里的两个人" fill priority sizes="100vw" />
          <div className={styles.fallbackVeil} />
        </div>
      ) : null}

      <div className={styles.sceneVeil} aria-hidden="true" />

      <section
        className={`${styles.intro} ${started && sceneReady ? styles.introHidden : ""}`}
        aria-hidden={started && sceneReady}
      >
        <div className={styles.introContent}>
          <div className={styles.introLine} aria-hidden="true" />
          <p className={styles.introEyebrow}>私人放映 · 第一幕</p>
          <h1>{storyWorld.title}</h1>
          <p className={styles.introSubtitle}>{storyWorld.subtitle}</p>
          <div className={styles.loadingTrack} aria-hidden="true">
            <div
              className={`${styles.loadingFill} ${sceneReady || (!started && webglSupported !== null) ? styles.loadingReady : ""}`}
            />
          </div>
          <p className={styles.loadingText}>
            {sceneReady || (!started && webglSupported !== null) ? "夜色已经准备好" : "正在点亮记忆"}
          </p>
          <button
            className={styles.enterButton}
            type="button"
            onClick={startStory}
            disabled={webglSupported === null || started}
          >
            <span>{started ? "正在进入" : "进入故事"}</span>
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
          <p className={styles.audioNote}>进入后音乐才会开始；随时可以静音。</p>
        </div>
      </section>

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

            <div className={styles.topControls}>
              <div className={styles.volumeControl}>
                <button className={styles.iconButton} type="button" onClick={toggleMusic} title={isPlaying ? "暂停音乐" : "播放音乐"} aria-label={isPlaying ? "暂停音乐" : "播放音乐"}>
                  {isPlaying ? <Pause size={17} /> : <Play size={17} />}
                </button>
                <button className={styles.iconButton} type="button" onClick={toggleMute} title={muted ? "取消静音" : "静音"} aria-label={muted ? "取消静音" : "静音"}>
                  {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  className={styles.volumeSlider}
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={volume}
                  onChange={(event) => {
                    setVolume(Number(event.target.value));
                    setMuted(false);
                  }}
                  aria-label="音乐音量"
                  title="音乐音量"
                />
              </div>
              <button
                className={`${styles.iconButton} ${quality === "quiet" ? styles.qualityActive : ""}`}
                type="button"
                onClick={() => setQuality((current) => (current === "cinematic" ? "quiet" : "cinematic"))}
                title={quality === "cinematic" ? "切换到简化模式" : "切换到电影模式"}
                aria-label={quality === "cinematic" ? "切换到简化模式" : "切换到电影模式"}
              >
                <Gauge size={18} />
              </button>
              <Link className={styles.controlLink} href="/story" title="打开完整档案" aria-label="打开完整档案">
                <Archive size={18} />
              </Link>
            </div>
          </header>

          <p className={`${styles.chapterStatus} ${!hasAdvanced ? styles.firstHint : ""}`} aria-live="polite">
            {statusText}
          </p>
          {navNotice ? <p className={styles.navNotice} role="status">{navNotice}</p> : null}
          {audioError ? <p className={styles.errorNote}>音乐未能自动开始，请点播放键。</p> : null}

          <article
            key={`${chapter.id}-${timelineRun}`}
            className={`${styles.chapterPanel} ${panelOpen ? "" : styles.chapterPanelHidden} ${playbackState === "playing" ? styles.chapterPanelPlaying : ""}`}
            aria-live="polite"
          >
            <button className={styles.panelClose} type="button" onClick={() => setPanelOpen(false)} title="收起旁白" aria-label="收起旁白">
              <X size={16} />
            </button>
            <div className={styles.chapterMeta}>
              <span>{chapter.index}</span>
              <span>{chapter.label}</span>
              {chapter.date ? <span>{chapter.date}</span> : null}
              {chapter.place ? <span>{chapter.place}</span> : null}
            </div>
            <h2>{chapter.title}</h2>
            <p className={styles.chapterQuote}>“{chapter.quote}”</p>
            <p className={styles.chapterBody}>{chapter.body}</p>
            <footer className={styles.chapterFooter}>
              <span className={styles.chapterPrompt}>{chapter.prompt}</span>
              {chapter.action ? (
                <Link className={styles.chapterAction} href={chapter.action.href}>
                  {chapter.action.label}
                </Link>
              ) : null}
            </footer>
          </article>

          {!panelOpen && playbackState !== "transitioning" ? (
            <button className={styles.reopenPanel} type="button" onClick={() => setPanelOpen(true)}>
              <Sparkles size={15} />
              <span>{chapter.label}</span>
            </button>
          ) : null}

          <nav className={styles.chapterNav} aria-label="故事章节">
            <button
              className={styles.navArrow}
              type="button"
              onClick={requestPrevious}
              disabled={(playbackState !== "settled" && playbackState !== "completed") || activeChapter === 0}
              title="上一幕"
              aria-label="上一幕"
            >
              <ArrowLeft size={17} />
            </button>
            <div className={styles.chapterTrack}>
              {storyWorld.chapters.map((item, index) => {
                const viewed = index <= maxViewedChapter;
                return (
                  <button
                    key={item.id}
                    className={`${styles.chapterDot} ${index === activeChapter ? styles.chapterDotActive : ""} ${viewed ? styles.chapterDotViewed : styles.chapterDotFuture}`}
                    type="button"
                    onClick={() => selectViewedChapter(index)}
                    title={viewed ? `${item.index} ${item.label}` : "故事会带你走到那里"}
                    aria-label={viewed ? `返回${item.label}` : `${item.label}尚未观看`}
                    aria-current={index === activeChapter ? "step" : undefined}
                    aria-disabled={!viewed || isPlaybackLocked(playbackState)}
                  >
                    <span />
                  </button>
                );
              })}
            </div>
            <button
              className={`${styles.navArrow} ${styles.nextControl}`}
              type="button"
              onClick={requestAdvance}
              disabled={!controlsUnlocked || activeChapter === lastChapter}
              title="下一幕"
              aria-label="下一幕"
            >
              <ArrowRight size={17} />
            </button>
          </nav>
        </>
      ) : null}
    </main>
  );
}
