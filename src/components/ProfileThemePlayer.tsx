"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ProfileThemePlayerProps = {
  src: string;
  title: string;
  artist: string;
};

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function ProfileThemePlayer({ src, title, artist }: ProfileThemePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeFrameRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0;
    void audio.play().then(() => {
      const startedAt = performance.now();
      const fade = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / 1200);
        audio.volume = 0.26 * progress;
        if (progress < 1) fadeFrameRef.current = window.requestAnimationFrame(fade);
      };
      fadeFrameRef.current = window.requestAnimationFrame(fade);
    }).catch(() => {
      setPlaying(false);
    });

    return () => {
      audio.pause();
      if (fadeFrameRef.current !== null) window.cancelAnimationFrame(fadeFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : 0.26;
  }, [muted]);

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
    } catch {
      setPlaying(false);
    }
  };

  return (
    <section
      className="mt-10 grid gap-5 border-y border-[color:var(--color-line)] py-5 md:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] md:items-center"
      aria-label={`Eric 的主题曲：${title}`}
    >
      <div className="min-w-0">
        <p className="font-serif-elegant text-xs text-[var(--color-gold)]">Eric 的主题曲</p>
        <h2 className="mt-2 truncate font-serif-elegant text-2xl font-medium text-[var(--color-ink)]">
          {title}
        </h2>
        <p className="mt-1 text-xs text-[var(--color-muted)]">{artist}</p>
      </div>

      <div className="grid min-w-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3">
        <button
          type="button"
          className="grid size-11 place-items-center border border-[#211c1d]/18 bg-transparent text-[var(--color-ink)] transition-colors hover:border-[var(--color-rose)] hover:text-[var(--color-rose)]"
          onClick={togglePlayback}
          title={playing ? "暂停主题曲" : "播放主题曲"}
          aria-label={playing ? "暂停主题曲" : "播放主题曲"}
        >
          {playing ? <Pause size={17} /> : <Play size={17} />}
        </button>

        <div className="grid min-w-0 gap-2">
          <input
            className="h-4 w-full cursor-pointer accent-[var(--color-rose)]"
            type="range"
            min="0"
            max={Math.max(duration, 0)}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => {
              const audio = audioRef.current;
              if (!audio) return;
              const nextTime = Number(event.target.value);
              audio.currentTime = nextTime;
              setCurrentTime(nextTime);
            }}
            aria-label="主题曲进度"
          />
          <div className="flex justify-between text-[0.65rem] text-[var(--color-muted)]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button
          type="button"
          className="grid size-11 place-items-center border border-[#211c1d]/18 bg-transparent text-[var(--color-ink)] transition-colors hover:border-[var(--color-rose)] hover:text-[var(--color-rose)]"
          onClick={() => setMuted((current) => !current)}
          title={muted ? "取消静音" : "静音"}
          aria-label={muted ? "取消静音" : "静音"}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      <audio
        ref={audioRef}
        src={src}
        autoPlay
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      />
    </section>
  );
}
