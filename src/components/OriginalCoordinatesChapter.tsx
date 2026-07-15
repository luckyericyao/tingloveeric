"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { coordinateMemories, originalCoordinates } from "@/data/originalCoordinates";
import styles from "./OriginalCoordinatesChapter.module.css";

type ArchiveImageProps = {
  index: number;
  className?: string;
  sizes: string;
  crop?: boolean;
  priority?: boolean;
  onOpen: (index: number) => void;
};

function ArchiveImage({
  index,
  className = "",
  sizes,
  crop = false,
  priority = false,
  onOpen,
}: ArchiveImageProps) {
  const memory = coordinateMemories[index];

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--tilt-x", `${y * -2.2}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${x * 2.6}deg`);
    event.currentTarget.style.setProperty("--shift-x", `${x * 7}px`);
    event.currentTarget.style.setProperty("--shift-y", `${y * 7}px`);
  };

  const resetPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.setProperty("--tilt-x", "0deg");
    event.currentTarget.style.setProperty("--tilt-y", "0deg");
    event.currentTarget.style.setProperty("--shift-x", "0px");
    event.currentTarget.style.setProperty("--shift-y", "0px");
  };

  return (
    <button
      className={`${styles.archiveImage} ${crop ? styles.archiveImageCropped : ""} ${className}`}
      type="button"
      onClick={() => onOpen(index)}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      aria-label={`沉浸查看：${memory.title}`}
    >
      <Image
        src={memory.source}
        alt={memory.alt}
        fill
        priority={priority}
        sizes={sizes}
        className={styles.archiveImageMedia}
        style={{ objectPosition: memory.focalPoint }}
      />
      <span className={styles.imageShade} aria-hidden="true" />
      <span className={styles.expandIcon} aria-hidden="true">
        <Maximize2 size={17} strokeWidth={1.5} />
      </span>
    </button>
  );
}

export function OriginalCoordinatesChapter() {
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const chapterRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = chapterRef.current;
    if (!container) return;
    const revealItems = container.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealVisible);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12%", threshold: 0.12 },
    );
    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (activeImage === null) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveImage(null);
      if (event.key === "ArrowRight") {
        setActiveImage((current) =>
          current === null ? null : (current + 1) % coordinateMemories.length,
        );
      }
      if (event.key === "ArrowLeft") {
        setActiveImage((current) =>
          current === null
            ? null
            : (current - 1 + coordinateMemories.length) % coordinateMemories.length,
        );
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [activeImage]);

  const showPrevious = () => {
    setActiveImage((current) =>
      current === null ? null : (current - 1 + coordinateMemories.length) % coordinateMemories.length,
    );
  };

  const showNext = () => {
    setActiveImage((current) =>
      current === null ? null : (current + 1) % coordinateMemories.length,
    );
  };

  return (
    <main ref={chapterRef} className={styles.chapter}>
      <header className={styles.chapterHeader}>
        <Link className={styles.backLink} href="/" aria-label="回到 3D 故事世界">
          <ArrowLeft size={17} strokeWidth={1.5} />
          <span>Ting & Eric</span>
        </Link>
        <span className={styles.headerIndex}>Chapter 01 · 2025.01</span>
      </header>

      <section className={styles.hero}>
        <Image
          src={coordinateMemories[1].source}
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroVeil} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <p className={styles.heroEnglish}>{originalCoordinates.englishTitle}</p>
          <h1>{originalCoordinates.title}</h1>
          <p className={styles.heroOpening}>{originalCoordinates.opening}</p>
        </div>
        <a className={styles.scrollCue} href="#chapter-start" aria-label="继续阅读">
          <ArrowDown size={18} strokeWidth={1.4} />
        </a>
      </section>

      <section id="chapter-start" className={styles.prologueBand}>
        <div className={styles.measure} data-reveal>
          <p className={styles.eyebrow}>原始坐标 · 第一帧</p>
          <p className={styles.prologueText}>
            那时候她在 Soul 上叫 Hanni。
            <br />
            照片里的她还不知道我会出现，照片外的我，也不知道这个人会在心里停这么久。
          </p>
        </div>
      </section>

      <section className={styles.memoryBand}>
        <div className={styles.memoryGrid}>
          <div className={`${styles.reveal} ${styles.portraitFrame}`} data-reveal>
            <ArchiveImage
              index={0}
              sizes="(max-width: 767px) 88vw, 40vw"
              onOpen={setActiveImage}
            />
          </div>
          <div className={`${styles.reveal} ${styles.memoryCopy}`} data-reveal>
            <p className={styles.eyebrow}>{coordinateMemories[0].date}</p>
            <h2>{coordinateMemories[0].title}</h2>
            <p>{coordinateMemories[0].caption}</p>
          </div>
        </div>
      </section>

      <section className={`${styles.memoryBand} ${styles.memoryBandMuted}`}>
        <div className={`${styles.memoryGrid} ${styles.memoryGridReverse}`}>
          <div className={`${styles.reveal} ${styles.memoryCopy}`} data-reveal>
            <p className={styles.eyebrow}>{coordinateMemories[1].date}</p>
            <h2>{coordinateMemories[1].title}</h2>
            <p>{coordinateMemories[1].caption}</p>
            <p className={styles.smallNote}>照片里的猫在当时尚未确认身份，因此没有被擅自命名。</p>
          </div>
          <div className={`${styles.reveal} ${styles.portraitFrame}`} data-reveal>
            <ArchiveImage
              index={1}
              sizes="(max-width: 767px) 88vw, 40vw"
              onOpen={setActiveImage}
            />
          </div>
        </div>
      </section>

      <section className={styles.relicBand}>
        <div className={styles.relicInner}>
          <div className={`${styles.reveal} ${styles.relicCopy}`} data-reveal>
            <p className={styles.eyebrow}>后来 · 数字遗迹</p>
            <h2>{coordinateMemories[2].title}</h2>
            <p>{coordinateMemories[2].caption}</p>
          </div>
          <div className={`${styles.reveal} ${styles.relicFrame}`} data-reveal>
            <ArchiveImage
              index={2}
              sizes="(max-width: 767px) 80vw, 34vw"
              onOpen={setActiveImage}
            />
            <span className={styles.relicCaption}>一张历史截图，不是现在的关系状态。</span>
          </div>
        </div>
      </section>

      <section className={styles.catsBand}>
        <div className={styles.catsIntro} data-reveal>
          <p className={styles.eyebrow}>她的小世界</p>
          <h2>诺诺与小伊</h2>
          <p>两只猫不只是照片墙里的素材。它们是最早让我看见她生活质地的两个角色。</p>
        </div>
        <div className={styles.catGrid}>
          {[3, 4].map((index) => {
            const memory = coordinateMemories[index];
            return (
              <article key={memory.id} className={styles.catPortrait} data-reveal>
                <ArchiveImage
                  index={index}
                  crop
                  sizes="(max-width: 767px) 92vw, 46vw"
                  onOpen={setActiveImage}
                />
                <div className={styles.catCaption}>
                  <div>
                    <span>{memory.date}</span>
                    <h3>{memory.title}</h3>
                  </div>
                  <p>{memory.caption}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.epilogue}>
        <div className={styles.epilogueInner} data-reveal>
          <p>
            后来我们靠近过，也最终失去了联系。
            <br />
            钱已经还清，旧的金钱关系结束了。我们重新成为两个自由、独立的人。
          </p>
          <blockquote>“{originalCoordinates.closing}”</blockquote>
          <Link className={styles.returnLink} href="/">
            <span>回到故事世界</span>
            <ArrowRight size={17} strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      {activeImage !== null ? (
        <div
          className={styles.viewer}
          role="dialog"
          aria-modal="true"
          aria-label={`查看图片：${coordinateMemories[activeImage].title}`}
        >
          <button className={styles.viewerBackdrop} type="button" onClick={() => setActiveImage(null)} aria-label="关闭图片" />
          <div className={styles.viewerFrame}>
            <Image
              src={coordinateMemories[activeImage].source}
              alt={coordinateMemories[activeImage].alt}
              fill
              sizes="96vw"
              className={styles.viewerImage}
              priority
            />
          </div>
          <div className={styles.viewerCaption}>
            <span>{String(activeImage + 1).padStart(2, "0")} / 05</span>
            <strong>{coordinateMemories[activeImage].title}</strong>
          </div>
          <button className={styles.viewerClose} type="button" onClick={() => setActiveImage(null)} aria-label="关闭图片">
            <X size={20} />
          </button>
          <button className={`${styles.viewerArrow} ${styles.viewerArrowLeft}`} type="button" onClick={showPrevious} aria-label="上一张图片">
            <ArrowLeft size={20} />
          </button>
          <button className={`${styles.viewerArrow} ${styles.viewerArrowRight}`} type="button" onClick={showNext} aria-label="下一张图片">
            <ArrowRight size={20} />
          </button>
        </div>
      ) : null}
    </main>
  );
}
