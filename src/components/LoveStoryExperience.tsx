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
import type { RenderQuality } from "@/components/StoryWorldScene";
import styles from "./LoveStoryExperience.module.css";

const StoryWorldCanvas = dynamic(
  () => import("@/components/StoryWorldCanvas").then((module) => module.StoryWorldCanvas),
  { ssr: false },
);

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
  const [activeChapter, setActiveChapter] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [quality, setQuality] = useState<RenderQuality>("cinematic");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.42);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const pointerStart = useRef<number | null>(null);
  const chapter = storyWorld.chapters[activeChapter];

  const selectChapter = useCallback((index: number) => {
    const bounded = Math.max(0, Math.min(storyWorld.chapters.length - 1, index));
    setActiveChapter(bounded);
    setPanelOpen(true);
  }, []);

  const nextChapter = useCallback(() => {
    setActiveChapter((current) => Math.min(storyWorld.chapters.length - 1, current + 1));
    setPanelOpen(true);
  }, []);

  const previousChapter = useCallback(() => {
    setActiveChapter((current) => Math.max(0, current - 1));
    setPanelOpen(true);
  }, []);

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
      if (event.key === "ArrowRight") nextChapter();
      if (event.key === "ArrowLeft") previousChapter();
      if (event.key === "Escape") setPanelOpen((current) => !current);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextChapter, previousChapter, started]);

  const startStory = async () => {
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

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a, input")) return;
    pointerStart.current = event.clientX;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStart.current === null) return;
    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(distance) < 58) return;
    if (distance < 0) nextChapter();
    else previousChapter();
  };

  return (
    <main
      className={styles.experience}
      data-quality={quality}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
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
          onSelectChapter={selectChapter}
          onAdvance={nextChapter}
          onReady={() => setSceneReady(true)}
        />
      ) : webglSupported === false ? (
        <div className={styles.fallbackVisual}>
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

          <p className={styles.chapterStatus}>触碰蝴蝶、小猫或记忆物件</p>
          {audioError ? <p className={styles.errorNote}>音乐未能自动开始，请点播放键。</p> : null}

          <article className={`${styles.chapterPanel} ${panelOpen ? "" : styles.chapterPanelHidden}`} aria-live="polite">
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

          {!panelOpen ? (
            <button className={styles.reopenPanel} type="button" onClick={() => setPanelOpen(true)}>
              <Sparkles size={15} />
              <span>{chapter.label}</span>
            </button>
          ) : null}

          <nav className={styles.chapterNav} aria-label="故事章节">
            <button className={styles.navArrow} type="button" onClick={previousChapter} disabled={activeChapter === 0} title="上一幕" aria-label="上一幕">
              <ArrowLeft size={17} />
            </button>
            <div className={styles.chapterTrack}>
              {storyWorld.chapters.map((item, index) => (
                <button
                  key={item.id}
                  className={`${styles.chapterDot} ${index === activeChapter ? styles.chapterDotActive : ""}`}
                  type="button"
                  onClick={() => selectChapter(index)}
                  title={`${item.index} ${item.label}`}
                  aria-label={`前往${item.label}`}
                  aria-current={index === activeChapter ? "step" : undefined}
                >
                  <span />
                </button>
              ))}
            </div>
            <button className={styles.navArrow} type="button" onClick={nextChapter} disabled={activeChapter === storyWorld.chapters.length - 1} title="下一幕" aria-label="下一幕">
              <ArrowRight size={17} />
            </button>
          </nav>
        </>
      ) : null}
    </main>
  );
}
