"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowRight, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { storyVisuals, storyWorld, type StoryBeat } from "@/data/storyWorld";
import { useStoryAudio } from "@/components/StoryAudioDirector";
import type { StoryPlaybackState } from "@/components/StoryWorldScene";
import styles from "./LoveStoryExperience.module.css";

const StoryWorldCanvas = dynamic(
  () => import("@/components/StoryWorldCanvas").then((module) => module.StoryWorldCanvas),
  { ssr: false },
);

export function LoveStoryExperience() {
  const router = useRouter();
  const audio = useStoryAudio();
  const { sessionReady, preludeComplete, filmRequested, requestFilm, playTrack, resumeTime, togglePlayback, pause } = audio;
  const [sceneReady, setSceneReady] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const launched = useRef(false);
  const ready = useCallback(() => setSceneReady(true), []);
  const started = audio.sessionReady && audio.preludeComplete && audio.filmRequested;
  const filmTime = audio.activeTrack.id === "story" ? audio.currentTime : audio.resumeTime;
  const activeBeat = storyWorld.timeline.reduce((index, item, next) => filmTime >= item.start ? next : index, 0);
  const beat: StoryBeat = storyWorld.timeline[activeBeat];
  const chapter = storyWorld.chapters[beat.chapterIndex];
  const completed = audio.endedTrack === "story";
  const paused = !audio.playing || audio.buffering;
  const state: StoryPlaybackState = completed ? "completed" : filmTime - beat.start < 1.6 ? "transitioning" : "playing";

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReducedMotion(media.matches);
    media.addEventListener("change", change);
    const frame = requestAnimationFrame(() => {
    change();
    let supported = false;
    try { supported = Boolean(document.createElement("canvas").getContext("webgl2")); } catch { /* Static fallback. */ }
    setWebgl(supported);
    if (!supported) setSceneReady(true);
    });
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", change);
    };
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    if (!preludeComplete) router.replace("/");
    else if (!filmRequested) requestFilm();
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
    <main className={`${styles.experience} ${styles.recipientFilm}`} data-paused={paused} data-playback={state} data-beat={activeBeat} data-chapter={beat.chapterIndex}>
      {started && webgl ? (
        <StoryWorldCanvas activeBeat={activeBeat} activeChapter={beat.chapterIndex} panelOpen quality={reducedMotion ? "quiet" : "cinematic"}
          reducedMotion={reducedMotion} playbackState={state} playbackDirection="forward" paused={paused && sceneReady}
          onCatInteraction={() => {}} onReady={ready} />
      ) : started && webgl === false ? (
        <div className={styles.fallbackVisual} aria-hidden="true">
          {beat.visual !== "night" ? <Image src={storyVisuals[beat.visual].src} alt="" fill priority sizes="100vw" /> : null}
        </div>
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
        <article key={beat.id} className={styles.filmCaption} aria-live="polite">
          {beat.title ? <h2>{beat.title}</h2> : null}
          {beat.quote ? <p>“{beat.quote}”</p> : null}
          {beat.body ? <p>{beat.body}</p> : null}
          {completed ? <Link className={styles.chapterAction} href="/world">去看看世界 <ArrowRight size={16} /></Link> : null}
        </article>
        <div className={styles.filmProgress} aria-hidden="true">{storyWorld.timeline.map((item, index) => <span key={item.id} className={index <= activeBeat ? styles.filmProgressSeen : ""} />)}</div>
      </>}
    </main>
  );
}
