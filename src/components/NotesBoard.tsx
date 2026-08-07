"use client";

import { useEffect, useMemo, useState } from "react";
import type { LoveNote } from "@/data/love";
import { NoteCard } from "./NoteCard";
import { NoteComposer } from "./NoteComposer";

const storageKey = "tingloveeric.notes";

type PersistenceMode = "redis" | "memory" | "local";

type NotesResponse = {
  notes?: unknown;
  persistence?: "redis" | "memory";
};

function isStoredNote(value: unknown): value is LoveNote {
  const note = value as Partial<LoveNote>;
  return (
    typeof note.id === "string" &&
    typeof note.author === "string" &&
    typeof note.date === "string" &&
    typeof note.content === "string" &&
    note.content.trim().length > 0 &&
    (note.mood === undefined || typeof note.mood === "string")
  );
}

function readStoredNotes() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter(isStoredNote) : [];
  } catch {
    window.localStorage.removeItem(storageKey);
    return [];
  }
}

function readRemoteNotes(payload: NotesResponse) {
  return Array.isArray(payload.notes) ? payload.notes.filter(isStoredNote) : [];
}

export function NotesBoard({
  seedNotes,
  moodOptions,
}: {
  seedNotes: LoveNote[];
  moodOptions: string[];
}) {
  const [localNotes, setLocalNotes] = useState<LoveNote[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [persistenceMode, setPersistenceMode] = useState<PersistenceMode>("local");
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadNotes() {
      const browserNotes = readStoredNotes();

      try {
        const response = await fetch("/api/notes", { cache: "no-store" });
        if (!response.ok) throw new Error("Notes request failed");
        const payload = (await response.json()) as NotesResponse;
        const sharedNotes = readRemoteNotes(payload);
        const nextNotes = sharedNotes.length ? sharedNotes : browserNotes;

        if (cancelled) return;
        setLocalNotes(nextNotes);
        setPersistenceMode(payload.persistence || "memory");
        setSyncMessage("");

        if (!sharedNotes.length && browserNotes.length) {
          const migration = await fetch("/api/notes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notes: browserNotes }),
          });
          if (!migration.ok && !cancelled) {
            setSyncMessage("旧纸条先留在这台设备上，暂时还没有同步成功。");
          }
        }
      } catch {
        if (cancelled) return;
        setLocalNotes(browserNotes);
        setPersistenceMode("local");
        setSyncMessage("纸条接口暂时没有打开成功，当前先保存在这台设备上。");
      } finally {
        if (!cancelled) setHasLoaded(true);
      }
    }

    void loadNotes();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify(localNotes));
  }, [hasLoaded, localNotes]);

  async function handleAdd(note: LoveNote) {
    setSyncMessage("");

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });
      if (!response.ok) throw new Error("Notes save failed");
      const payload = (await response.json()) as NotesResponse;
      const savedNotes = readRemoteNotes(payload);
      setLocalNotes(savedNotes.length ? savedNotes : [note, ...localNotes]);
      setPersistenceMode(payload.persistence || "memory");
      setSyncMessage(
        payload.persistence === "redis"
          ? "这张纸条已经同步到两个人的小世界。"
          : "这张纸条已经放进当前设备的小世界。",
      );
    } catch {
      setLocalNotes((current) => [note, ...current]);
      setPersistenceMode("local");
      setSyncMessage("这张纸条先保存在本机，网络恢复后可以再同步。 ");
    }
  }

  const notes = useMemo(() => [...localNotes, ...seedNotes], [localNotes, seedNotes]);

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-muted)]" role="status" aria-live="polite">
        <span>
          {!hasLoaded
            ? "正在打开纸条盒..."
            : syncMessage ||
              (persistenceMode === "redis"
                ? "这面纸条墙会同步给两个人。"
                : persistenceMode === "memory"
                  ? "当前是临时保存，配置 KV 后即可跨设备保留。"
                  : "当前先保存在这台设备上。")}
        </span>
        <span>{localNotes.length} 张新纸条</span>
      </div>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <NoteComposer onAdd={handleAdd} moodOptions={moodOptions} />
        <div className="grid gap-4">
          {notes.length ? notes.map((note) => <NoteCard key={note.id} note={note} />) : (
            <div className="paper-note p-6 text-sm leading-7 text-[var(--color-muted)]">
              这里还空着，等第一张想你、贴贴或晚安的小纸条。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
