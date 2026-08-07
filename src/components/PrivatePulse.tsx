"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle, NotebookPen, RefreshCw } from "lucide-react";

type PrivatePulseProps = {
  seedPlaceCount: number;
  seedNoteCount: number;
};

type Snapshot = {
  latestMessage: string;
  messageCount: number;
  noteCount: number;
  placeCount: number;
  partial: boolean;
};

async function readJson(path: string) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path} failed`);
  return (await response.json()) as Record<string, unknown>;
}

async function readSnapshot(seedPlaceCount: number, seedNoteCount: number): Promise<Snapshot> {
  const results = await Promise.allSettled([
    readJson("/api/board/messages"),
    readJson("/api/notes"),
    readJson("/api/world/places"),
  ]);
  const board = results[0].status === "fulfilled" ? results[0].value : {};
  const notes = results[1].status === "fulfilled" ? results[1].value : {};
  const world = results[2].status === "fulfilled" ? results[2].value : {};
  const messages = Array.isArray(board.messages) ? board.messages : [];
  const notesList = Array.isArray(notes.notes) ? notes.notes : [];
  const customPlaces = Array.isArray(world.customPlaces) ? world.customPlaces : [];

  return {
    latestMessage:
      typeof messages[0] === "object" && messages[0] && "content" in messages[0]
        ? String(messages[0].content)
        : "还没有新留言，第一句可以很轻。",
    messageCount: messages.length,
    noteCount: seedNoteCount + notesList.length,
    placeCount: seedPlaceCount + customPlaces.length,
    partial: results.some((result) => result.status === "rejected"),
  };
}

export function PrivatePulse({ seedPlaceCount, seedNoteCount }: PrivatePulseProps) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSnapshot() {
      setIsRefreshing(true);
      try {
        const nextSnapshot = await readSnapshot(seedPlaceCount, seedNoteCount);
        if (!cancelled) setSnapshot(nextSnapshot);
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    }

    void loadSnapshot();
    const refreshTimer = window.setInterval(() => void loadSnapshot(), 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(refreshTimer);
    };
  }, [seedNoteCount, seedPlaceCount]);

  async function refreshSnapshot() {
    setIsRefreshing(true);
    try {
      setSnapshot(await readSnapshot(seedPlaceCount, seedNoteCount));
    } finally {
      setIsRefreshing(false);
    }
  }

  const items = [
    {
      href: "/board",
      label: "最新一句",
      value: snapshot?.latestMessage || "正在看看今天留下了什么...",
      detail: snapshot ? `${snapshot.messageCount} 句留言` : "正在打开",
      icon: MessageCircle,
    },
    {
      href: "/notes",
      label: "纸条盒",
      value: snapshot ? `${snapshot.noteCount} 张纸条被收好` : "正在数纸条...",
      detail: "写一句晚安或抱抱",
      icon: NotebookPen,
    },
    {
      href: "/world",
      label: "地图坐标",
      value: snapshot ? `${snapshot.placeCount} 个地方被点亮` : "正在打开地图...",
      detail: "去过的，和想一起去的",
      icon: MapPin,
    },
  ];

  return (
    <section className="mt-8 grid gap-3 md:grid-cols-3" aria-label="私人房间实时状态">
      <div className="flex items-center justify-between gap-3 border-y border-[color:var(--color-line)] px-2 py-2 text-xs text-[var(--color-muted)] md:col-span-3">
        <span role="status" aria-live="polite">
          {!snapshot
            ? "正在看看两个人的小世界..."
            : snapshot.partial
              ? "有一处房间暂时没同步，其他记录仍然在这里。"
              : "刚刚看过，新的留言会自动出现在这里。"}
        </span>
        <button
          type="button"
          data-testid="private-pulse-refresh"
          onClick={() => void refreshSnapshot()}
          disabled={isRefreshing}
          className="inline-flex shrink-0 items-center gap-1.5 border-b border-transparent py-1 text-[var(--color-rose)] transition hover:border-[var(--color-rose)] disabled:cursor-wait disabled:opacity-50"
        >
          <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "同步中" : "再看一眼"}
        </button>
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            data-testid={`private-pulse-${item.href.slice(1)}`}
            className="group border-y border-[color:var(--color-line)] px-2 py-4 transition hover:border-[rgba(214,154,176,0.52)]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-xs text-[var(--color-rose)]">
                <Icon size={15} strokeWidth={1.6} />
                {item.label}
              </span>
              <ArrowRight size={14} className="text-[var(--color-muted)] transition-transform group-hover:translate-x-1" />
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--color-ink)]">{item.value}</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">{item.detail}</p>
          </Link>
        );
      })}
    </section>
  );
}
