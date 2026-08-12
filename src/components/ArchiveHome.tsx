"use client";

import Image from "next/image";
import Link from "next/link";
import { Archive, ArrowDown, ArrowRight, LockKeyhole, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef } from "react";
import { coordinateMemories, originalCoordinates } from "@/data/originalCoordinates";
import { useStoryAudio } from "@/components/StoryAudioDirector";
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
    source: "Eric 的感受",
    quote: "“明天听你分享。” “晚安～”",
    body: "写下名字、改简历、分享工作和日常。那些很小的回应不能定义整段关系，却真实发生过。",
  },
] as const;

const heroSlides = [
  {
    source: "/images/edited/hanni-portrait.jpg",
    alt: "2025 年 1 月 27 日暖色灯光中的自拍画面",
    label: "那时候她叫 Hanni",
    date: "2025.01.27",
    caption: "昏黄的灯光，一张被保存下来的自拍。",
    className: "heroPrintPortrait",
    imageClassName: "",
  },
  {
    source: "/images/edited/her-world.jpg",
    alt: "猫、鱼缸和发财树组成的生活画面",
    label: "她的小世界",
    date: "2025.01.29",
    caption: "一只猫，一缸鱼，一盆发财树。",
    className: "heroPrintWorld",
    imageClassName: "",
  },
  {
    source: "/images/edited/cp-cottage-relic.jpg",
    alt: "曾经留下来的情侣小屋历史截图",
    label: "后来留下的数字遗迹",
    date: "那段关系的旧记录",
    caption: "有些画面没有被带走，只是安静地留在这里。",
    className: "heroPrintRelic",
    imageClassName: "",
  },
  {
    source: "/assets/cats/nono-front.webp",
    alt: "诺诺，海豹双色布偶猫",
    label: "诺诺 · Nono",
    date: "她的小世界",
    caption: "那只脸上带着灰色重点色的猫，叫诺诺。",
    className: "heroPrintNono",
    imageClassName: "heroPrintCat",
  },
  {
    source: "/assets/cats/xiaoye-front.webp",
    alt: "小yeah，银白色长毛猫",
    label: "小yeah",
    date: "她的小世界",
    caption: "还有一只银白色、安静又蓬松的小yeah。",
    className: "heroPrintXiaoye",
    imageClassName: "heroPrintCat",
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
  const {
    activeTrack,
    currentTime,
    duration,
    error: audioError,
    muted,
    needsGesture,
    playing,
    toggleMute,
    togglePlayback,
  } = useStoryAudio();

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

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const preludeSeconds = Math.min(60, Math.max(0, Math.floor(currentTime)));
  const activeSlideIndex = Math.min(Math.floor(preludeSeconds / 5), heroSlides.length - 1);
  const preludeBeat = activeSlideIndex >= 3 ? 3 : activeSlideIndex >= 2 ? 2 : activeSlideIndex >= 1 ? 1 : 0;
  const preludeComplete = audioError || activeTrack.id !== "opening" || currentTime >= 60;

  useEffect(() => {
    document.body.classList.toggle("home-prelude-locked", !preludeComplete);
    return () => document.body.classList.remove("home-prelude-locked");
  }, [preludeComplete]);

  return (
    <main ref={homeRef} className={styles.home}>
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
              <span>{audioError ? "音乐暂不可用" : needsGesture ? "点击后播放" : playing ? "正在播放" : "已暂停"}</span>
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
              onClick={toggleMute}
              aria-label={muted ? "取消静音" : "静音"}
              title={muted ? "取消静音" : "静音"}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      </header>

      <section className={styles.hero} data-prelude-beat={preludeBeat} data-prelude-slide={activeSlideIndex}>
        <Image
          src="/images/home/hero-memory-collage.jpg"
          alt="一张由旧自拍、猫咪、鱼缸与两只猫组成的甜蜜记忆拼贴"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroVeil} aria-hidden="true" />
        <div className={styles.heroScrapbook} aria-label="随音乐每五秒出现一张的记忆画面">
          {heroSlides.map((print, index) => (
            <figure
              key={print.source}
              className={`${styles.heroPrint} ${styles[print.className]} ${print.imageClassName ? styles[print.imageClassName] : ""} ${activeSlideIndex === index ? styles.heroPrintActive : ""}`}
              aria-hidden={activeSlideIndex !== index}
              aria-label={`${print.label} · ${print.date} · ${print.caption}`}
            >
              <div className={styles.heroPrintImage}>
                <Image
                  src={print.source}
                  alt={print.alt}
                  fill
                  sizes="(max-width: 767px) 58vw, 24vw"
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
          <p className={`${styles.heroBody} ${preludeBeat >= 1 ? styles.heroPreludeReveal : ""}`}>
            先是她叫 Hanni，后来是生活里几句很小的回应。
          </p>
          <p className={`${styles.heroSweetLine} ${preludeBeat >= 3 ? styles.heroPreludeReveal : ""}`}>
            “明天听你分享～”<br />“真棒。” · “晚安～”
          </p>
        </div>
        <div className={styles.heroTimeline} aria-label="首页时间线摘要">
          <span><b>01</b> 初见</span>
          <span><b>02</b> 看见她的生活</span>
          <span><b>03</b> 甜蜜的回应</span>
        </div>
        {preludeComplete ? (
          <>
            <Link className={styles.heroEntry} href="/cinema">
              <span>进入故事</span>
              <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
            <a
              className={styles.scrollCue}
              href="#archive-timeline"
              aria-label="继续往下看"
              title="继续往下看"
            >
              <span>继续往下看</span>
              <ArrowDown size={17} strokeWidth={1.5} />
            </a>
          </>
        ) : null}
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
