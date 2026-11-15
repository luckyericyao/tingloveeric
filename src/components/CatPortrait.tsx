"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./CatPortrait.module.css";

export function CatPortrait({ id, name, detail }: { id: "xiaoye" | "nono"; name: string; detail: string }) {
  const [ready, setReady] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [autoBlinkCount, setAutoBlinkCount] = useState(0);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const blink = useCallback((automatic = false) => {
    if (!ready || blinkTimer.current) return;
    setBlinking(true);
    if (automatic) setAutoBlinkCount(value => value + 1);
    blinkTimer.current = setTimeout(() => {
      setBlinking(false);
      blinkTimer.current = null;
    }, automatic ? 360 : 650);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let first = true;
    const clearIdle = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = null;
    };
    const schedule = () => {
      clearIdle();
      if (reduced.matches || document.hidden) return;
      const delay = first ? (id === "nono" ? 3100 : 4300) : 5200 + Math.random() * 2700;
      first = false;
      idleTimer.current = setTimeout(() => {
        blink(true);
        schedule();
      }, delay);
    };
    const update = () => schedule();
    reduced.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    schedule();
    return () => {
      clearIdle();
      reduced.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [blink, id, ready]);

  useEffect(() => () => {
    if (blinkTimer.current) clearTimeout(blinkTimer.current);
    if (idleTimer.current) clearTimeout(idleTimer.current);
  }, []);

  function respond() {
    blink(false);
  }

  return (
    <button type="button" className={styles.portrait} onClick={respond}
      aria-label={`轻轻摸摸${name}`} title={`轻轻摸摸${name}`}
      data-ready={ready} data-blinking={blinking} data-auto-blinks={autoBlinkCount}>
      <Image src={`/assets/cats/${id}-front.webp`} alt={detail} fill
        sizes="(max-width: 700px) 46vw, 40vw" className={blinking ? styles.hidden : undefined} />
      <Image src={`/assets/cats/${id}-blink.webp`} alt="" aria-hidden="true" fill loading="eager"
        sizes="(max-width: 700px) 46vw, 40vw" className={blinking ? undefined : styles.hidden}
        onLoad={event => { void event.currentTarget.decode().then(() => setReady(true)).catch(() => setReady(false)); }} />
    </button>
  );
}
