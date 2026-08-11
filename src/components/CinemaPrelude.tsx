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
  const beat = progress >= 0.82 ? 3 : progress >= 0.53 ? 2 : progress >= 0.24 ? 1 : 0;
  const elapsedSeconds = progress * 60;
  const audioStatus = audioError ? "音乐暂不可用" : openingAudioBlocked ? "点击后播放" : audioPlaying ? "正在播放" : "已暂停";

  return (
    <section
      className={`${styles.prelude} ${started && !ariaHidden ? styles.preludeEntering : ""} ${ariaHidden ? styles.preludeHidden : ""}`}
      aria-hidden={ariaHidden}
      aria-label="甜蜜的序幕"
    >
      <div className={styles.preludeBackdrop} aria-hidden="true" />
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
        <div className={styles.preludeCopy}>
          <p className={styles.preludeKicker}>2025.01 · 三个真实瞬间</p>
          <h1>先把这一分钟，留给这些小小的回应。</h1>
          <p className={styles.preludeLead}>
            一张自拍、一只猫，<br />还有一句“晚安～”。
          </p>
          <div className={`${styles.preludeQuote} ${beat >= 3 ? styles.preludeVisible : ""}`} aria-hidden={beat < 3}>
            <span>靠近以后</span>
            <blockquote>“明天听你分享。”</blockquote>
            <blockquote>“真棒。” · “晚安～”</blockquote>
            <small>那些很小的回应，曾经真实发生过。</small>
          </div>
        </div>

        <div className={styles.preludeGallery} aria-label="被保存下来的甜蜜画面">
          <figure className={`${styles.preludePhoto} ${styles.preludePortrait} ${beat >= 1 ? styles.preludeVisible : ""}`} aria-hidden={beat < 1}>
            <div className={styles.preludePhotoImage}>
              <Image
                src="/images/edited/hanni-portrait.jpg"
                alt="2025 年 1 月 27 日暖色灯光中的自拍画面"
                fill
                priority
                sizes="(max-width: 767px) 43vw, 24vw"
              />
            </div>
            <figcaption>
              <strong>那时候她叫 Hanni</strong>
              <span>2025.01.27 · “小疯子”</span>
            </figcaption>
          </figure>

          <figure className={`${styles.preludePhoto} ${styles.preludeWorld} ${beat >= 2 ? styles.preludeVisible : ""}`} aria-hidden={beat < 2}>
            <div className={styles.preludePhotoImage}>
              <Image
                src="/images/edited/her-world.jpg"
                alt="猫、鱼缸和发财树组成的生活画面"
                fill
                priority
                sizes="(max-width: 767px) 50vw, 28vw"
              />
            </div>
            <figcaption>
              <strong>她的小世界</strong>
              <span>2025.01.29</span>
            </figcaption>
          </figure>
        </div>
      </div>

      <footer className={styles.preludeFooter}>
        <div className={styles.preludeProgress}>
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
              {ready ? "序幕已经停在这里" : "一些细节正在慢慢显现"}
            </span>
          )}
          <button
            className={`${styles.preludeEnter} ${!ready ? styles.preludeEnterQuiet : ""}`}
            type="button"
            data-story-enter
            onClick={onEnter}
            disabled={!entryAvailable || started}
            tabIndex={ariaHidden ? -1 : 0}
          >
            <span>{started ? "正在进入" : "进入故事"}</span>
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </footer>
    </section>
  );
}
