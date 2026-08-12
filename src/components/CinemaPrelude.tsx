"use client";

import Image from "next/image";
import { ArrowRight, Volume2 } from "lucide-react";
import styles from "./LoveStoryExperience.module.css";

type CinemaPreludeProps = {
  progress: number;
  ready: boolean;
  started: boolean;
  entryAvailable: boolean;
  openingAudioBlocked: boolean;
  audioPlaying: boolean;
  audioError: boolean;
  ariaHidden: boolean;
  onPlayOpeningAudio: () => void;
  onEnter: () => void;
};

type PreludeVisual = "hanni" | "her-world" | "collage";

const PRELUDE_VISUALS: Record<PreludeVisual, { src: string; alt: string; objectPosition: string }> = {
  hanni: {
    src: "/images/edited/hanni-portrait.jpg",
    alt: "2025 年 1 月 27 日暖色灯光中的自拍画面",
    objectPosition: "50% 44%",
  },
  "her-world": {
    src: "/images/edited/her-world.jpg",
    alt: "猫、鱼缸和发财树组成的生活画面",
    objectPosition: "54% 48%",
  },
  collage: {
    src: "/images/home/hero-memory-collage.jpg",
    alt: "自拍、猫咪与最初生活画面组成的记忆拼图",
    objectPosition: "58% 50%",
  },
};

const PRELUDE_FRAMES = [
  {
    id: "hanni-date",
    visual: "hanni" as const,
    eyebrow: "2025.01.27 · Soul",
    title: "那时候，你在 Soul 上叫 Hanni。",
    lead: "一张昏黄灯光下的自拍，标题是“小疯子”。",
  },
  {
    id: "before-us",
    visual: "hanni" as const,
    eyebrow: "在我们以前",
    title: "你还不知道，我会出现在后来的故事里。",
    lead: "照片外的我，也不知道你会在心里停这么久。",
  },
  {
    id: "her-world-date",
    visual: "her-world" as const,
    eyebrow: "2025.01.29 · Soul",
    title: "两天后，是一只猫、一缸鱼、一盆发财树。",
    lead: "这是我最早看见的、属于你的生活。",
  },
  {
    id: "small-things",
    visual: "her-world" as const,
    eyebrow: "她的小世界",
    title: "我先记住的，是这些很小的东西。",
    lead: "那时候，一切都还没有被后来改变。",
  },
  {
    id: "closer",
    visual: "collage" as const,
    eyebrow: "靠近以后",
    title: "后来，陌生慢慢有了回应。",
    lead: "不是一句盛大的承诺，只是有人愿意听你说完一天。",
  },
  {
    id: "share-tomorrow",
    visual: "hanni" as const,
    eyebrow: "一句真实的回复",
    title: "“明天听你分享。”",
    lead: "很轻的一句话，让分享欲第一次有了落点。",
  },
  {
    id: "great",
    visual: "collage" as const,
    eyebrow: "一句真实的回复",
    title: "“真棒。”",
    lead: "那段时间，我真的觉得你给生活带来了幸运和 love。",
  },
  {
    id: "good-night",
    visual: "hanni" as const,
    eyebrow: "一天结束以前",
    title: "“晚安～”",
    lead: "一句晚安，也曾让一个普通夜晚变得特别。",
  },
  {
    id: "write-name",
    visual: "collage" as const,
    eyebrow: "一些具体的喜欢",
    title: "我开始在纸上写你的名字。",
    lead: "不是为了展示，只是那个名字当时真的被认真放在心上。",
  },
  {
    id: "resume",
    visual: "her-world" as const,
    eyebrow: "一些具体的喜欢",
    title: "也认真帮你改简历，听你说生活。",
    lead: "喜欢开始变成一些很小、很实际的动作。",
  },
  {
    id: "not-proof",
    visual: "collage" as const,
    eyebrow: "真实，而不是证明",
    title: "这些回应不能替关系下定义。",
    lead: "但它们确实发生过，也确实让我们靠近过。",
  },
  {
    id: "begin-film",
    visual: "collage" as const,
    eyebrow: "甜蜜的序幕 · 01:00",
    title: "这一分钟结束，故事才真正开始。",
    lead: "接下来，是相遇、喜欢、最后一次见面，以及后来学会的事。",
  },
] as const;

function formatClock(seconds: number) {
  const safeSeconds = Math.max(0, Math.min(60, Math.floor(seconds)));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

export function CinemaPrelude({
  progress,
  ready,
  started,
  entryAvailable,
  openingAudioBlocked,
  audioPlaying,
  audioError,
  ariaHidden,
  onPlayOpeningAudio,
  onEnter,
}: CinemaPreludeProps) {
  const frameIndex = Math.min(PRELUDE_FRAMES.length - 1, Math.floor(progress * PRELUDE_FRAMES.length));
  const frame = PRELUDE_FRAMES[frameIndex];
  const elapsedSeconds = progress * 60;
  const remainingSeconds = Math.max(0, 60 - Math.floor(elapsedSeconds));
  const audioStatus = audioError ? "音乐暂不可用" : openingAudioBlocked ? "点击后播放" : audioPlaying ? "正在播放" : "已暂停";

  return (
    <section
      className={`${styles.prelude} ${started && !ariaHidden ? styles.preludeEntering : ""} ${ariaHidden ? styles.preludeHidden : ""}`}
      aria-hidden={ariaHidden}
      aria-label="甜蜜的序幕"
      data-prelude-frame={frameIndex}
      data-prelude-seconds={Math.floor(elapsedSeconds)}
    >
      <div className={styles.preludeFilmFrames} aria-hidden="true">
        {(Object.entries(PRELUDE_VISUALS) as Array<[PreludeVisual, (typeof PRELUDE_VISUALS)[PreludeVisual]]>).map(([id, visual]) => (
          <div
            className={`${styles.preludeFrameMedia} ${frame.visual === id ? styles.preludeFrameMediaActive : ""}`}
            key={id}
          >
            <Image
              src={visual.src}
              alt=""
              fill
              priority
              sizes="100vw"
              style={{ objectPosition: visual.objectPosition }}
            />
          </div>
        ))}
      </div>
      <div className={styles.preludeWash} aria-hidden="true" />

      <header className={styles.preludeTopbar}>
        <div className={styles.preludeBrand}>
          <span className={styles.preludeBrandRule} aria-hidden="true" />
          <span>
            <strong>Ting & Eric</strong>
            <small>私人档案馆 · 甜蜜的序幕</small>
          </span>
        </div>
        <div className={styles.preludeTrack} aria-live="polite">
          <span>{audioStatus}</span>
          <strong>就是爱你 · 陶喆</strong>
          <small>{formatClock(elapsedSeconds)} / 1:00</small>
        </div>
      </header>

      <div className={styles.preludeStage}>
        <div className={styles.preludeFrameCopy} key={frame.id}>
          <p className={styles.preludeKicker}>{frame.eyebrow}</p>
          <h1>{frame.title}</h1>
          <p className={styles.preludeLead}>{frame.lead}</p>
        </div>
        <div className={styles.preludeFrameCounter} aria-hidden="true">
          <span>{String(frameIndex + 1).padStart(2, "0")}</span>
          <i />
          <span>{String(PRELUDE_FRAMES.length).padStart(2, "0")}</span>
        </div>
      </div>

      <footer className={styles.preludeFooter}>
        <div className={styles.preludeProgress} aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
        <div className={styles.preludeFooterRow}>
          {openingAudioBlocked ? (
            <button className={styles.preludeSoundButton} type="button" onClick={onPlayOpeningAudio} tabIndex={ariaHidden ? -1 : 0}>
              <Volume2 size={15} strokeWidth={1.5} />
              <span>播放《就是爱你》</span>
            </button>
          ) : (
            <span className={styles.preludeFooterNote}>
              {ready ? "序幕已经停在这里" : `下一帧会自己出现 · 还剩 ${remainingSeconds} 秒`}
            </span>
          )}
          {ready ? (
            <button
              className={styles.preludeEnter}
              type="button"
              data-story-enter
              onClick={onEnter}
              disabled={!entryAvailable || started}
              tabIndex={ariaHidden ? -1 : 0}
            >
              <span>{started ? "正在进入" : "进入故事"}</span>
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          ) : null}
        </div>
      </footer>
    </section>
  );
}
