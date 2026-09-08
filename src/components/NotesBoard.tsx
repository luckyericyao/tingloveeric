"use client";

import { useEffect, useMemo, useState } from "react";
import type { LoveNote } from "@/data/love";
import { NoteCard } from "./NoteCard";
import { NoteComposer } from "./NoteComposer";

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

function readRemoteNotes(payload: NotesResponse) {
  return Array.isArray(payload.notes) ? payload.notes.filter(isStoredNote) : [];
}

export function NotesBoard({
  canEdit = false,
  seedNotes,
  moodOptions,
}: {
  canEdit?: boolean;
  seedNotes: LoveNote[];
  moodOptions: string[];
}) {
  const [localNotes, setLocalNotes] = useState<LoveNote[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadNotes() {
      try {
        const response = await fetch("/api/notes", { cache: "no-store" });
        if (!response.ok) throw new Error("Notes request failed");
        const payload = (await response.json()) as NotesResponse;
        const sharedNotes = readRemoteNotes(payload);
        const nextNotes = sharedNotes;

        if (cancelled) return;
        setLocalNotes(nextNotes);
        setSyncMessage("");

      } catch {
        if (cancelled) return;
        setSyncMessage("信件暂时没有打开，请稍后刷新。没有上传或修改本机草稿。");
      } finally {
        if (!cancelled) setHasLoaded(true);
      }
    }

    void loadNotes();
    return () => {
      cancelled = true;
    };
  }, []);

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
      setSyncMessage(
        payload.persistence === "redis"
          ? "已收好。"
          : "已先收在当前页面。",
      );
    } catch {
      setSyncMessage("没有保存成功，文字仍在输入框里。");
      throw new Error("Note was not saved");
    }
  }

  const notes = useMemo(() => [...localNotes, ...seedNotes], [localNotes, seedNotes]);

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-muted)]" role="status" aria-live="polite">
        <span>
          {!hasLoaded
            ? "纸张正在铺开..."
            : syncMessage || "只写自己的话，慢慢收好。"}
        </span>
        <span>{localNotes.length ? `${localNotes.length} 张新纸条` : ""}</span>
      </div>
      <div className={canEdit ? "grid gap-8 lg:grid-cols-[0.9fr_1.1fr]" : "grid gap-8"}>
        {canEdit ? <NoteComposer onAdd={handleAdd} moodOptions={moodOptions} /> : null}
        <div className="grid gap-4">
          {notes.length ? notes.map((note) => <NoteCard key={note.id} note={note} />) : (
            <div className="archive-empty-note">
              {canEdit ? "这里还空着。下一句话，只写自己的真实感受。" : "暂时没有分享的信。可以去看看照片，或让今天停在这里。"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
