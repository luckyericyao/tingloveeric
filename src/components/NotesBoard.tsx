"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { LoveNote } from "@/data/love";
import { NoteCard } from "./NoteCard";
import { NoteComposer } from "./NoteComposer";

type NotesResponse = {
  notes?: unknown;
  note?: unknown;
  message?: string;
  persistence?: "redis" | "unavailable";
};

function isStoredNote(value: unknown): value is LoveNote {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
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
  const [readFailed, setReadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const saveRevision = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const revision = saveRevision.current;

    async function loadNotes() {
      try {
        const response = await fetch("/api/notes", { cache: "no-store" });
        const payload = (await response.json()) as NotesResponse;
        if (!response.ok) throw new Error(canEdit && payload.persistence === "unavailable"
          ? "长期保存尚未启用。写下的文字请先留在当前页面。"
          : payload.message || "信件暂时没有打开，请稍后重试。");
        const sharedNotes = readRemoteNotes(payload);
        const nextNotes = sharedNotes;

        if (cancelled || revision !== saveRevision.current) return;
        setLocalNotes(nextNotes);
        setReadFailed(false);
        setSyncMessage(canEdit && payload.persistence === "unavailable"
          ? "长期保存尚未启用。写下的文字请先留在当前页面。" : "");

      } catch (error) {
        if (cancelled || revision !== saveRevision.current) return;
        setReadFailed(true);
        setSyncMessage(error instanceof Error && !(error instanceof TypeError)
          ? error.message : "信件暂时没有打开，请稍后重试。没有上传或修改本机草稿。");
      } finally {
        if (!cancelled) setHasLoaded(true);
      }
    }

    void loadNotes();
    return () => {
      cancelled = true;
    };
  }, [canEdit, loadAttempt]);

  async function handleAdd(note: LoveNote) {
    saveRevision.current += 1;
    setSyncMessage("");

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });
      const payload = (await response.json().catch(() => null)) as NotesResponse | null;
      if (!response.ok || payload?.persistence !== "redis") {
        throw new Error(payload?.message || "没有确认长期保存。文字仍在输入框里，请先不要关闭页面。");
      }
      if (!isStoredNote(payload.note) || payload.note.id !== note.id || payload.note.content !== note.content) {
        throw new Error("保存结果没有确认这封信。文字仍在输入框里。");
      }
      const savedNotes = readRemoteNotes(payload);
      if (!savedNotes.some(saved => saved.id === note.id)) {
        throw new Error("保存结果没有包含这封信。文字仍在输入框里。");
      }
      saveRevision.current += 1;
      setReadFailed(false);
      setLocalNotes(savedNotes);
      setSyncMessage("已收好。");
    } catch (error) {
      setSyncMessage("");
      throw error instanceof TypeError ? new Error("没有保存成功，文字仍在输入框里。检查网络后可以重试。") : error;
    }
  }

  const notes = useMemo(() => [...localNotes, ...seedNotes], [localNotes, seedNotes]);

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-muted)]" role="status" aria-live="polite">
        <span>
          {!hasLoaded
            ? "纸张正在铺开..."
            : syncMessage || (canEdit ? "只写自己的话，慢慢收好。" : "")}
        </span>
        {readFailed ? <button
          type="button"
          className="inline-grid size-11 place-items-center border border-[var(--color-line)]"
          title="重新读取信件"
          aria-label="重新读取信件"
          onClick={() => { setReadFailed(false); setHasLoaded(false); setLoadAttempt(attempt => attempt + 1); }}
        ><RotateCcw size={16} /></button> : null}
        <span>{localNotes.length ? `${localNotes.length} 张新纸条` : ""}</span>
      </div>
      <div className={canEdit ? "grid gap-8 lg:grid-cols-[0.9fr_1.1fr]" : "grid gap-8"}>
        {canEdit ? <NoteComposer onAdd={handleAdd} moodOptions={moodOptions} /> : null}
        <div className="grid gap-4">
          {notes.length ? notes.map((note) => <NoteCard key={note.id} note={note} />) : hasLoaded && !readFailed ? (
            <div className="archive-empty-note">
              {canEdit ? "这里还空着。下一句话，只写自己的真实感受。" : "暂时没有分享的信。可以去看看照片，或让今天停在这里。"}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
