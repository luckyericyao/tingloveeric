"use client";

import Image from "next/image";
import Link from "next/link";
import { Archive, ArrowDown, ArrowRight, LockKeyhole, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { coordinateMemories, originalCoordinates } from "@/data/originalCoordinates";
import styles from "./ArchiveHome.module.css";

const homeMoments = [
  {
    memoryIndex: 0,
    index: "01",
    kicker: "2025.01.27 · 初见",
    title: "那时候她叫 Hanni",
    source: "真实记录",
    quote: "“小疯子”",
    body: "昏黄的灯光，一张被保存下来的自拍。那时候故事还没有开始，所有事情都仍然拥有无限可能。",
  },
  {
    memoryIndex: 1,
    index: "02",
    kicker: "2025.01.29 · 看见她的生活",
    title: "我先看见了她的小世界",
    source: "真实记录",
    quote: "一只猫，一缸鱼，一盆发财树。",
    body: "在真正了解她以前，我先从这些普通的小东西里，看见了属于她的生活。最早留下来的，往往不是大事件。",
  },
  {
    memoryIndex: 2,
    index: "03",
    kicker: "靠近以后 · 甜蜜的回应",
    title: "那些小小的回应",
    source: "真实记录 · Eric 的感受",
    quote: "“明天听你分享。” “晚安～”",
    body: "写下名字、改简历、分享工作和日常。那些很小的回应不能定义整段关系，却真实发生过。",
  },
] as const;

const heroPrints = [
  {
    source: "/images/coordinates/hanni-2025-01-27.jpg",
    alt: "旧动态里的暖色自拍画面",
    label: "小疯子",
    date: "2025.01.27",
    className: "heroPrintPortrait",
  },
  {
    source: "/images/coordinates/her-world-2025-01-29.jpg",
    alt: "猫、鱼缸和发财树组成的旧动态画面",
    label: "她的小世界",
    date: "2025.01.29",
    className: "heroPrintWorld",
  },
] as const;

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function ArchiveHome() {
  const homeRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const fadeFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const savedMuted = window.localStorage.getItem("tingloveeric.muted") === "true";
    audio.volume = savedMuted ? 0 : 0.26;
    audio.muted = savedMuted;
    setMuted(savedMuted);

    const fadeIn = () => {
      if (savedMuted) return;
      const startedAt = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / 1300);
        audio.volume = 0.26 * progress;
        if (progress < 1) fadeFrameRef.current = window.requestAnimationFrame(step);
      };
      if (fadeFrameRef.current !== null) window.cancelAnimationFrame(fadeFrameRef.current);
      fadeFrameRef.current = window.requestAnimationFrame(step);
    };

    let disposed = false;
    let removeUnlockListeners = () => {};

    const tryPlayback = async () => {
      if (disposed) return;
      if (!audio.paused) return;
      try {
        await audio.play();
        if (disposed) return;
        fadeIn();
        setNeedsGesture(false);
        removeUnlockListeners();
      } catch {
        setNeedsGesture(true);
      }
    };

    const unlock = () => void tryPlayback();
    const unlockOptions: AddEventListenerOptions = { passive: true };
    const events = ["pointerdown", "touchstart", "wheel", "keydown"] as const;
    events.forEach((event) => window.addEventListener(event, unlock, unlockOptions));
    audio.addEventListener("canplay", unlock);
    removeUnlockListeners = () => {
      events.forEach((event) => window.removeEventListener(event, unlock, unlockOptions));
      audio.removeEventListener("canplay", unlock);
    };

    const blockedTimer = window.setTimeout(() => {
      if (audio.paused) setNeedsGesture(true);
    }, 700);

    return () => {
      disposed = true;
      removeUnlockListeners();
      window.clearTimeout(blockedTimer);
      if (fadeFrameRef.current !== null) window.cancelAnimationFrame(fadeFrameRef.current);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    const root = homeRef.current;
    if (!root) return;
    const elements = root.querySelectorAll<HTMLElement>("[data-home-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(styles.revealVisible);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px 8%", threshold: 0.08 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }

    try {
      await audio.play();
      audio.volume = muted ? 0 : 0.26;
      setNeedsGesture(false);
    } catch {
      setNeedsGesture(true);
    }
  };

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  return (
    <main ref={homeRef} className={styles.home}>
      <audio
        ref={audioRef}
        src="/audio/jiu-shi-ai-ni.m4a"
        autoPlay
        playsInline
        preload="auto"
        onPlay={() => {
          setPlaying(true);
          setNeedsGesture(false);
        }}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      />

      <header className={styles.topbar}>
        <Link className={styles.brand} href="/">
          <strong>Ting & Eric</strong>
          <span>私人档案馆</span>
        </Link>

        <div className={styles.topbarRight}>
          <Link className={styles.privateEntry} href="/private" title="打开私人房间">
            <LockKeyhole size={15} strokeWidth={1.5} />
            <span>私人房间</span>
          </Link>
          <div className={styles.soundtrack}>
            <div className={styles.soundtrackCopy}>
              <span>{needsGesture ? "滑动后播放" : "正在播放"}</span>
              <strong>就是爱你 · 陶喆</strong>
              <div className={styles.progressTrack} aria-hidden="true">
                <span style={{ transform: `scaleX(${progress})` }} />
              </div>
              <small>{formatTime(currentTime)} / {formatTime(duration)}</small>
            </div>
            <button
              type="button"
              className={styles.iconButton}
              onClick={togglePlayback}
              aria-label={playing ? "暂停《就是爱你》" : "播放《就是爱你》"}
              title={playing ? "暂停《就是爱你》" : "播放《就是爱你》"}
            >
              {playing ? <Pause size={17} /> : <Play size={17} />}
            </button>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => {
                const audio = audioRef.current;
                if (!audio) return;
                const nextMuted = !muted;
                audio.muted = nextMuted;
                audio.volume = nextMuted ? 0 : 0.26;
                window.localStorage.setItem("tingloveeric.muted", String(nextMuted));
                setMuted(nextMuted);
              }}
              aria-label={muted ? "取消静音" : "静音"}
              title={muted ? "取消静音" : "静音"}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <Image
          src="/images/home/hero-memory-collage.jpg"
          alt="一张由旧自拍、猫咪、鱼缸与两只猫组成的甜蜜记忆拼贴"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroVeil} aria-hidden="true" />
        <div className={styles.heroScrapbook} aria-label="被保存下来的三张画面">
          {heroPrints.map((print, index) => (
            <figure
              key={print.source}
              className={`${styles.heroPrint} ${styles[print.className]}`}
              data-home-reveal
            >
              <div className={styles.heroPrintImage}>
                <Image
                  src={print.source}
                  alt={print.alt}
                  fill
                  sizes="(max-width: 767px) 34vw, 16vw"
                  priority={index === 0}
                  className={styles.heroPrintPhoto}
                />
              </div>
              <figcaption>
                <strong>{print.label}</strong>
                <span>{print.date}</span>
              </figcaption>
            </figure>
          ))}
        </div>
          <div className={styles.heroCopy}>
          <p className={styles.heroKicker}>2025.01 · 三件小事</p>
          <h1>甜蜜的瞬间</h1>
          <p className={styles.positioning}>
            一张自拍、一只猫，<br />还有一句“晚安～”。
          </p>
          <p className={styles.heroBody}>
            先是她叫 Hanni，后来是生活里几句很小的回应。
          </p>
          <p className={styles.heroSweetLine}>
            “明天听你分享～”<br />“真棒。” · “晚安～”
          </p>
        </div>
        <div className={styles.heroTimeline} aria-label="首页时间线摘要">
          <span><b>01</b> 初见</span>
          <span><b>02</b> 看见她的生活</span>
          <span><b>03</b> 甜蜜的回应</span>
        </div>
        <p className={styles.scrollHint}>向下，时间会继续</p>
        <a className={styles.scrollCue} href="#archive-timeline" aria-label="继续阅读原始坐标">
          <ArrowDown size={18} strokeWidth={1.5} />
        </a>
      </section>

      <section id="archive-timeline" className={styles.archiveBeat} aria-label="首页的三段甜蜜记录">
        <div className={styles.timelineIntro}>
        <div className={styles.measure} data-home-reveal>
          <p className={styles.eyebrow}>2025.01 · 最早留下来的三件小事</p>
          <h2>从一张自拍开始</h2>
          <p>
            我是在 Soul 上看见她的。先是一张自拍、一只猫、一缸鱼和一盆发财树，
            后来才慢慢记住那些很小的回应。
          </p>
          <div className={styles.timelineIndex} aria-label="时间线章节">
            {homeMoments.map((moment) => (
              <span key={moment.index}>
                <b>{moment.index}</b>
                <em>{moment.kicker}</em>
              </span>
            ))}
          </div>
        </div>
        </div>

      <div className={styles.timeline} aria-label="原始坐标时间线">
        {homeMoments.map((moment, position) => {
          const memory = coordinateMemories[moment.memoryIndex];
          return (
            <article
              key={moment.index}
              className={`${styles.moment} ${position % 2 === 1 ? styles.momentReverse : ""}`}
            >
              <span className={styles.timelineMarker} aria-hidden="true">{moment.index}</span>
              <div className={styles.momentInner}>
                <figure className={styles.photoWrap} data-home-reveal>
                  <div className={styles.photoFrame}>
                    <Image
                      src={memory.source}
                      alt={memory.alt}
                      fill
                      sizes="(max-width: 767px) 88vw, 42vw"
                      className={styles.timelineImage}
                      style={{ objectPosition: memory.focalPoint }}
                    />
                  </div>
                  <figcaption>{memory.date} · {moment.source}</figcaption>
                </figure>

                <div className={styles.momentCopy} data-home-reveal>
                  <p className={styles.eyebrow}>{moment.kicker}</p>
                  <h3>{moment.title}</h3>
                  <blockquote>{moment.quote}</blockquote>
                  <p>{moment.body}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.tenderBand}>
          <div className={styles.tenderInner} data-home-reveal>
          <div>
            <p className={styles.eyebrow}>{originalCoordinates.tenderMoments.eyebrow}</p>
            <h2>一句晚安，<br />也值得留下。</h2>
            <p className={styles.tenderLead}>{originalCoordinates.tenderMoments.lead}</p>
          </div>
          <div className={styles.tenderCopy}>
            {originalCoordinates.tenderMoments.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <blockquote>
              {originalCoordinates.tenderMoments.replies.map((reply) => (
                <span key={reply}>“{reply}”</span>
              ))}
            </blockquote>
            <p className={styles.tenderNote}>{originalCoordinates.tenderMoments.closing}</p>
          </div>
        </div>
      </div>
      </section>

      <section className={styles.closing}>
        <div className={styles.closingInner} data-home-reveal>
          <p className={styles.eyebrow}>Eric 的感受 · 故事没有被写成结局</p>
          <h2>当时的温柔，不需要因为后来改变了，就被否定。</h2>
          <p>
            这里保存真实发生过的相遇、靠近和变化。它不替任何人写下结局，
            只让那些曾经存在过的时刻，有一个安静的地方继续被看见。
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/private">
              <Archive size={17} />
              <span>打开四个房间</span>
            </Link>
            <Link className={styles.secondaryAction} href="/cinema">
              <span>进入电影故事</span>
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className={styles.privateLinks} aria-label="私人房间">
            <Link href="/coordinates">相遇与靠近</Link>
            <Link href="/her">她与两只猫</Link>
            <Link href="/world">打开想去的地方</Link>
            <Link href="/notes">写一封未寄出的信</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
